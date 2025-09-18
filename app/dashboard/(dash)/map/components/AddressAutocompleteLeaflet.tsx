"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import type { Map as LeafletMap } from "leaflet";

// react-leaflet (SSR off)
const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), { ssr: false });

const MapRefBinder: React.FC<{ onInit: (map: LeafletMap) => void }> = ({ onInit }) => {
  const useMapHook = useMemo(() => require("react-leaflet").useMap as typeof import("react-leaflet").useMap, []);
  const map = useMapHook();
  useEffect(() => {
    onInit(map);
  }, [map, onInit]);
  return null;
};

// ===== Types =====
type RegionSel = {
  province?: { id: string; name: string };
  city?: { id: string; name: string };
  district?: { id: string; name: string };
  postalCode?: string | null;
};
type SuggestItem = { label: string; lat: number; lon: number; raw?: any };
type AddressDetail = {
  jalan: string | null;
  kelurahan: string | null;
  kecamatan: string | null;
  kota: string | null;
  provinsi: string | null;
  kodepos: string | null;
  rt: string | null;
  rw: string | null;
};

// ===== Utils =====
function useDebounce<T>(value: T, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

function mapPropsToAddress(p: any): AddressDetail {
  return {
    jalan: [p.street, p.housenumber].filter(Boolean).join(" ") || null,
    kelurahan: p.suburb || p.neighbourhood || p.village || null,
    kecamatan: p.district || null,
    kota: p.city || p.town || p.municipality || null,
    provinsi: p.state || null,
    kodepos: p.postcode || null,
    rt: p.rt || p["addr:rt"] || null,
    rw: p.rw || p["addr:rw"] || null,
  };
}
function patchRtRwFromText(addr: AddressDetail, text: string): AddressDetail {
  const rt = addr.rt ?? text.match(/\bRT[.\s-]*([0-9]{1,3})\b/i)?.[1] ?? null;
  const rw = addr.rw ?? text.match(/\bRW[.\s-]*([0-9]{1,3})\b/i)?.[1] ?? null;
  return { ...addr, rt, rw };
}
function allEmpty(a?: AddressDetail | null) {
  if (!a) return true;
  return Object.values(a).every((v) => v == null || v === "");
}

// ===== Normalisasi & Prioritas =====
function normalizeLight(s?: string | null) {
  const text = (s || "").toLowerCase().replace(/[.,]/g, " ");
  const stop = new Set(["provinsi", "province", "daerah", "khusus", "ibukota", "kota", "kabupaten", "regency", "special", "region", "of", "d.i.", "istimewa"]);
  return text
    .split(/\s+/)
    .filter((t) => t && !stop.has(t))
    .join(" ")
    .trim();
}
function prioritizeByProvince<T extends { label: string }>(items: T[], region: RegionSel): T[] {
  const key = normalizeLight(region.province?.name);
  if (!key) return items;
  const hits: T[] = [],
    rest: T[] = [];
  for (const it of items) (normalizeLight((it as any).label).includes(key) ? hits : rest).push(it);
  return hits.length ? [...hits, ...rest] : items;
}

// ===== Filter provinsi (strict) + kota (default longgar) =====
function normalizeAdmin(s?: string | null) {
  return (s || "")
    .toLowerCase()
    .replace(/[.,]/g, " ")
    .replace(/\b(provinsi|province|daerah|khusus|ibukota|kota|kabupaten|regency|special|region|of|d\.i\.|istimewa)\b/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}
function cityCores(name?: string | null): string[] {
  const n = normalizeAdmin(name);
  if (!n) return [];
  const out = new Set<string>([n]);
  if (/\bjakarta\b/.test(n)) out.add("jakarta"); // bantu varian
  return Array.from(out);
}
function itemInProvince(it: SuggestItem, provinceName?: string | null) {
  const key = normalizeAdmin(provinceName);
  if (!key) return true;
  const raw = (it.raw || {}) as any;
  const provRaw = normalizeAdmin(raw.state || raw.region || raw.state_district || "");
  const lbl = normalizeAdmin(it.label);
  return (provRaw && provRaw.includes(key)) || (lbl && lbl.includes(key));
}
function itemInCity(it: SuggestItem, cityName?: string | null) {
  const cores = cityCores(cityName);
  if (!cores.length) return true;
  const raw = (it.raw || {}) as any;
  const cityRaw = normalizeAdmin(raw.city || raw.town || raw.municipality || raw.county || "");
  const lbl = normalizeAdmin(it.label);
  if (cores.some((c) => cityRaw.includes(c))) return true;
  if (cores.some((c) => lbl.includes(c))) return true;
  return false;
}
function filterByProvinceCity(items: SuggestItem[], region: RegionSel, strictProvince = true, strictCity = false) {
  // --- langkah 1: provinsi ---
  const provMatched = items.filter((it) => itemInProvince(it, region.province?.name));
  let keep = strictProvince ? provMatched : provMatched.length ? provMatched : items;
  if (!keep.length) return keep;

  // --- langkah 2: kota ---
  const cityMatched = keep.filter((it) => itemInCity(it, region.city?.name));
  keep = strictCity ? cityMatched : cityMatched.length ? cityMatched : keep;
  return keep;
}

// ===== Candidate builder (tahan "jalan raya joglo", "gang sawo joglo", + RT/RW) =====
function buildCandidates(q: string): string[] {
  const base = q.trim();
  if (!base) return [];
  const cleanRtRw = base
    .replace(/\brt[.\s-]*\d{1,3}\b/gi, "")
    .replace(/\brw[.\s-]*\d{1,3}\b/gi, "")
    .replace(/\bno\.?\s*\d+\b/gi, "")
    .replace(/[(),]/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();

  const set = new Set<string>();
  set.add(cleanRtRw);

  const noPrefix = cleanRtRw.replace(/\b(jalan|jl|jln|gang|gg)\b\.?/gi, "").trim();
  if (noPrefix) set.add(noPrefix);

  const words = noPrefix.split(/\s+/).filter(Boolean);
  if (words.length >= 2) set.add([...words.slice(0, -2), words.at(-1)!, words.at(-2)!].join(" "));

  const withoutRaya = cleanRtRw
    .replace(/\braya\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  if (withoutRaya) set.add(withoutRaya);

  return Array.from(set);
}

// =================== LOG & Photon fetch ===================
type RateState = { hits: number; lastStatus?: number; lastMs?: number; lastUrl?: string; limited?: boolean; lastErr?: string | null };
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
let lastPhotonAt = 0;
const PHOTON_GAP_MS = 250;

async function fetchPhoton(url: string, setPhotonRate: React.Dispatch<React.SetStateAction<RateState>>) {
  const now = Date.now();
  const need = PHOTON_GAP_MS - (now - lastPhotonAt);
  if (need > 0) await sleep(need);
  lastPhotonAt = Date.now();

  const t0 = performance.now();
  let res: Response | null = null;
  let err: any = null;
  try {
    res = await fetch(url);
  } catch (e) {
    err = e;
  }
  const ms = Math.round(performance.now() - t0);

  if (!res) {
    console.log(`[GEO][photon] NETWORK-ERR ${ms}ms url=${url}`, err);
    setPhotonRate((r) => ({ ...r, hits: r.hits + 1, lastStatus: 0, lastMs: ms, lastUrl: url, lastErr: String(err), limited: false }));
    throw err;
  }

  console.log(`[GEO][photon] ${res.status} ${ms}ms url=${url}`);
  const limited = res.status === 429 || res.status === 503;
  setPhotonRate((r) => ({ ...r, hits: r.hits + 1, lastStatus: res.status, lastMs: ms, lastUrl: url, limited, lastErr: null }));
  if (!res.ok) throw new Error(`photon HTTP ${res.status}`);
  return res;
}

// =================== Photon Providers ===================
// ⬇⬇⬇ COUNTRY FILTER: ID only (kalau ada). Kalau gak ada hasil ID, baru fallback ke semua.
async function photonSearch(query: string, limit = 10, bias?: { lat: number; lon: number }, setPhotonRate?: any): Promise<SuggestItem[]> {
  // tambahkan “, Indonesia” untuk bias ke negara (Photon tidak punya parameter countrycode)
  const qForPhoton = query.includes("Indonesia") ? query : `${query}, Indonesia`;

  const params = new URLSearchParams({ q: qForPhoton, lang: "en", limit: String(limit), bbox: "95,-11,141,6" });
  if (bias) {
    params.set("lat", String(bias.lat));
    params.set("lon", String(bias.lon));
  }
  const url = `https://photon.komoot.io/api/?${params.toString()}`;

  try {
    const r = await fetchPhoton(url, setPhotonRate!);
    const j = await r.json();
    const rows: SuggestItem[] = (j.features || []).map((f: any) => {
      const [lon, lat] = f.geometry.coordinates;
      const p = f.properties || {};
      const label = [
        p.name,
        p.street && p.housenumber ? `${p.street} ${p.housenumber}` : p.street,
        p.suburb || p.neighbourhood || p.village,
        p.city || p.town || p.municipality,
        p.district,
        p.state,
        p.postcode,
      ]
        .filter(Boolean)
        .join(", ");
      return { label, lat, lon, raw: p };
    });

    // --- FILTER NEGARA: utamakan Indonesia (ID) ---
    const idOnly = rows.filter((it) => String(it.raw?.countrycode || "").toUpperCase() === "ID");
    return idOnly.length ? idOnly : rows; // kalau gak ada ID sama sekali, jangan kosongin total
  } catch {
    return [];
  }
}

async function photonReverse(lat: number, lon: number, setPhotonRate?: any) {
  try {
    const r = await fetchPhoton(`https://photon.komoot.io/reverse?lat=${lat}&lon=${lon}&lang=en`, setPhotonRate!);
    const j = await r.json();
    return j.features?.[0]?.properties || {};
  } catch {
    return {};
  }
}

// =================== Component ===================
const AddressAutocompleteLeaflet: React.FC<{
  region: RegionSel;
  placeholder?: string;
  defaultCenter?: { lat: number; lon: number };
  onPicked?(r: { coords: { lat: number; lon: number }; display: string; address: AddressDetail }): void;
  minChars?: number;
  limit?: number;
}> = ({ region, placeholder = "Nama Jalan, Gedung, No. Rumah", defaultCenter = { lat: -2.5489, lon: 118.0149 }, onPicked, minChars = 3, limit = 12 }) => {
  const [text, setText] = useState("");
  const deb = useDebounce(text, 300); // <-- hanya sekali
  const [list, setList] = useState<SuggestItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState<number>(-1);

  const lastResultsRef = useRef<SuggestItem[]>([]);
  const justPickedRef = useRef(false);

  // log Photon
  const [photonRate, setPhotonRate] = useState<RateState>({ hits: 0 });

  // map
  const mapRef = useRef<LeafletMap | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [addr, setAddr] = useState<AddressDetail | null>(null);
  const [markerIcon, setMarkerIcon] = useState<any>(null);

  // bias lat/lon dari region via Photon
  const [bias, setBias] = useState<{ lat: number; lon: number } | null>(null);
  useEffect(() => {
    const seed = [region.district?.name, region.city?.name, region.province?.name].filter(Boolean).join(", ");
    if (!seed) {
      setBias(null);
      return;
    }
    (async () => {
      let arr = region.district?.name ? await photonSearch(region.district.name, 1, undefined, setPhotonRate) : [];
      if (!arr.length && region.city?.name) arr = await photonSearch(region.city.name, 1, undefined, setPhotonRate);
      if (!arr.length && region.province?.name) arr = await photonSearch(region.province.name, 1, undefined, setPhotonRate);
      setBias(arr[0] ? { lat: arr[0].lat, lon: arr[0].lon } : null);
    })();
  }, [region.district?.name, region.city?.name, region.province?.name]);

  // icon
  useEffect(() => {
    let mounted = true;
    (async () => {
      const L = (await import("leaflet")).default;
      const icon = new L.Icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });
      if (mounted) setMarkerIcon(icon);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // outside click
  const boxRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // SEARCH: kandidat → +city → +province (semua hasil sudah ID-only), lalu filter prov/kota
  const runSearch = useCallback(
    async (qInput: string) => {
      const cands = buildCandidates(qInput);
      for (const cand of cands) {
        // 1) cand
        let items = await photonSearch(cand, limit, bias || undefined, setPhotonRate);
        if (items.length) {
          const filtered = filterByProvinceCity(items, region, true /*prov strict*/, false /*kota longgar*/);
          const best = filtered.length ? filtered : items; // fallback kalau prov mismatch
          return prioritizeByProvince(best, region);
        }

        // 2) cand + city
        const withCity = [cand, region.city?.name].filter(Boolean).join(", ");
        if (withCity !== cand) {
          items = await photonSearch(withCity, limit, bias || undefined, setPhotonRate);
          if (items.length) {
            const filtered = filterByProvinceCity(items, region, true, false);
            const best = filtered.length ? filtered : items;
            return prioritizeByProvince(best, region);
          }
        }

        // 3) cand + province
        const withProv = [cand, region.province?.name].filter(Boolean).join(", ");
        if (withProv !== cand) {
          items = await photonSearch(withProv, limit, bias || undefined, setPhotonRate);
          if (items.length) {
            const filtered = filterByProvinceCity(items, region, true, false);
            const best = filtered.length ? filtered : items;
            return prioritizeByProvince(best, region);
          }
        }
      }
      return [];
    },
    [limit, bias, region]
  );

  // fetch suggestions
  const minLen = minChars ?? 3;
  useEffect(() => {
    const go = async () => {
      if (justPickedRef.current) {
        justPickedRef.current = false;
        return;
      }
      if (!deb || deb.trim().length < minLen) {
        setList([]);
        setActiveIdx(-1);
        return;
      }
      setLoading(true);
      try {
        const items = await runSearch(deb.trim());
        setList(items);
        lastResultsRef.current = items;
        setActiveIdx(items.length ? 0 : -1);
      } catch {
        setList([]);
        setActiveIdx(-1);
      } finally {
        setLoading(false);
      }
    };
    go();
  }, [deb, minLen, runSearch]);

  // pilih
  const pick = async (s: SuggestItem) => {
    setText(s.label);
    setCoords({ lat: s.lat, lon: s.lon });
    setOpen(false);
    justPickedRef.current = true;

    let detail: AddressDetail | null = s.raw ? mapPropsToAddress(s.raw) : null;
    if (allEmpty(detail)) {
      const base = await photonReverse(s.lat, s.lon, setPhotonRate);
      detail = mapPropsToAddress(base);
    }
    detail = patchRtRwFromText(detail!, s.label);

    setAddr(detail!);
    mapRef.current?.flyTo([s.lat, s.lon], 16, { duration: 0.8 });
    onPicked?.({ coords: { lat: s.lat, lon: s.lon }, display: s.label, address: detail! });
  };

  // reset saat wilayah berubah
  useEffect(() => {
    setText("");
    setList([]);
    setAddr(null);
    setCoords(null);
    setActiveIdx(-1);
  }, [region.province?.id, region.city?.id, region.district?.id, region.postalCode]);

  // keyboard nav
  const onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (!open || !list.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, list.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIdx >= 0) pick(list[activeIdx]);
    }
  };

  return (
    <div className="w-full">
      {/* INPUT + DROPDOWN */}
      <div className="relative" ref={boxRef}>
        <label className="mb-1 block text-sm font-medium text-[#212b36]">Nama Jalan, Gedung, No. Rumah</label>
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            setOpen(true);
            if (!list.length && lastResultsRef.current.length) {
              setList(lastResultsRef.current);
              setActiveIdx(0);
            }
          }}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          rows={3}
          className="w-full resize-y rounded-md border px-3 py-2 outline-none"
        />
        {open && (
          <div className="absolute left-0 right-0 top-full z-[1000] mt-2 max-h-[60vh] overflow-auto rounded-md border bg-white shadow-lg">
            {/* ringkasan log Photon + filter */}
            <div className="px-3 py-1 text-[11px] text-gray-500 border-b">
              Photon: {photonRate.lastStatus ?? "-"} ({photonRate.lastMs ?? "-"}ms) • hit={photonRate.hits}
              {photonRate.limited && <span className="ml-2 text-amber-700">— rate-limited</span>}
              {photonRate.lastUrl && (
                <span className="ml-2 truncate" title={photonRate.lastUrl}>
                  URL: {photonRate.lastUrl}
                </span>
              )}
              <span className="ml-3">Prov: {region.province?.name ?? "-"}</span>
              <span className="ml-2">Kota: {region.city?.name ?? "-"}</span>
              <span className="ml-2">Negara: ID only</span>
            </div>

            {loading && <div className="p-3 text-sm text-gray-500">Mencari…</div>}
            {!loading && list.length === 0 && text.trim().length >= (minChars ?? 3) && <div className="p-3 text-sm text-gray-500">Tidak ada hasil</div>}
            {!loading &&
              list.map((s, i) => (
                <button
                  key={`${s.lat}-${s.lon}-${i}`}
                  onClick={() => pick(s)}
                  className={`block w-full px-3 py-2 text-left hover:bg-gray-100 ${i === activeIdx ? "bg-gray-100" : ""}`}
                >
                  {s.label}
                </button>
              ))}
          </div>
        )}
      </div>

      <div className="mt-6" />

      {/* RINGKAS ALAMAT */}
      {addr && (
        <div className="mb-4 rounded-md border p-3 text-sm text-gray-700">
          <div>
            <b>Jalan</b>: {addr.jalan ?? "-"}
          </div>
          <div>
            <b>Kelurahan</b>: {addr.kelurahan ?? "-"}
          </div>
          <div>
            <b>Kecamatan</b>: {addr.kecamatan ?? "-"}
          </div>
          <div>
            <b>Kota</b>: {addr.kota ?? "-"}
          </div>
          <div>
            <b>Provinsi</b>: {addr.provinsi ?? "-"}
          </div>
          <div>
            <b>Kode Pos</b>: {addr.kodepos ?? "-"}
          </div>
          <div>
            <b>RT/RW</b>: {addr.rt ?? "-"} / {addr.rw ?? "-"}
          </div>
        </div>
      )}

      {/* MAP */}
      <div className="relative z-0 h-[420px] w-full overflow-hidden rounded-md">
        <MapContainer
          center={[coords?.lat ?? defaultCenter.lat, coords?.lon ?? defaultCenter.lon]}
          zoom={coords ? 16 : 5}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom
        >
          <MapRefBinder
            onInit={(m) => {
              mapRef.current = m;
            }}
          />
          <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {coords && markerIcon && <Marker position={[coords.lat, coords.lon]} icon={markerIcon} />}
        </MapContainer>
      </div>
    </div>
  );
};

export default AddressAutocompleteLeaflet;
