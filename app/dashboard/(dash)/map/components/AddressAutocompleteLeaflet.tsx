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
  // kelurahan – tambah lebih banyak kandidat (hindari locality yang sebenarnya RT/RW)
  const loc = String(p.locality || "");
  const likelyRtRw = /\br[\s]*t\b|\br[\s]*w\b/i.test(loc);
  const kelurahan = p.suburb || p.neighbourhood || p.village || p.hamlet || p.quarter || p.ward || (!likelyRtRw ? p.locality : null);

  const kecamatan = p.district || p.city_district || p.subdistrict || null;
  const kota = p.city || p.town || p.municipality || p.county || null;
  const provinsi = p.state || p.region || p.state_district || null;

  return {
    jalan: [p.street, p.housenumber].filter(Boolean).join(" ") || p.name || null,
    kelurahan: kelurahan || null,
    kecamatan,
    kota,
    provinsi,
    kodepos: p.postcode || null,
    rt: p.rt || p["addr:rt"] || null,
    rw: p.rw || p["addr:rw"] || null,
  };
}

function allEmpty(a?: AddressDetail | null) {
  if (!a) return true;
  return Object.values(a).every((v) => v == null || v === "");
}

/* ---------- RT/RW helpers ---------- */
function extractRtRw(text: string) {
  const t = text || "";
  // tangkap pola campuran: RT.004, R T 09, RT04/08, dll
  const rt =
    t.match(/\br\s*\.?\s*t\s*[:.\-\/ ]*\s*0*([0-9]{1,3})\b/i)?.[1] ||
    t.match(/\brt\s*[:.\-\/ ]*\s*0*([0-9]{1,3})\b/i)?.[1] ||
    t.match(/\b0*([0-9]{1,3})\b(?=\/\s*rw)/i)?.[1] ||
    null;

  const rw =
    t.match(/\br\s*\.?\s*w\s*[:.\-\/ ]*\s*0*([0-9]{1,3})\b/i)?.[1] ||
    t.match(/\brw\s*[:.\-\/ ]*\s*0*([0-9]{1,3})\b/i)?.[1] ||
    t.match(/(?<=rt\s*[:.\-\/ ]*\s*0*[0-9]{1,3}\s*\/\s*)0*([0-9]{1,3})\b/i)?.[1] ||
    null;

  return { rt, rw };
}

function enrichRtRw(addr: AddressDetail, sources: Array<string | undefined | null>): AddressDetail {
  let out = { ...addr };
  for (const s of sources) {
    if (!s) continue;
    const { rt, rw } = extractRtRw(String(s));
    if (!out.rt && rt) out.rt = rt;
    if (!out.rw && rw) out.rw = rw;
    if (out.rt && out.rw) break;
  }
  return out;
}

/* ---------- Postal helpers (STRICT 5-digit ID) ---------- */
function extractPostal5FromText(s?: string | null): string | null {
  if (!s) return null;
  const m = String(s).match(/(^|\D)(\d{5})(\D|$)/);
  return m ? m[2] : null;
}
function normalizePostal5(s?: string | null): string | null {
  const d = extractPostal5FromText(s);
  return d ? d : null;
}
function itemPostal5(it: SuggestItem): string | null {
  return normalizePostal5(it.raw?.postcode) || normalizePostal5(it.label) || normalizePostal5(it.raw?.name) || null;
}

/* ---------- Normalisasi & prioritas ---------- */
function normalizeLight(s?: string | null) {
  const text = (s || "").toLowerCase().replace(/[.,]/g, " ");
  const stop = new Set(["provinsi", "province", "daerah", "khusus", "ibukota", "kota", "kabupaten", "regency", "special", "region", "of", "d.i.", "istimewa"]);
  return text
    .split(/\s+/)
    .filter((t) => t && !stop.has(t))
    .join(" ")
    .trim();
}
function normalizeAdmin(s?: string | null) {
  return (s || "")
    .toLowerCase()
    .replace(/[.,]/g, " ")
    .replace(/\b(provinsi|province|daerah|khusus|ibukota|kota|kabupaten|regency|special|region|of|d\.i\.|istimewa)\b/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}
function prioritizeByProvince<T extends { label: string }>(items: T[], region: RegionSel): T[] {
  const key = normalizeLight(region.province?.name);
  if (!key) return items;
  const hits: T[] = [];
  const rest: T[] = [];
  for (const it of items) (normalizeLight((it as any).label).includes(key) ? hits : rest).push(it);
  return hits.length ? [...hits, ...rest] : items;
}

/* ---------- Filter prov + city + district + postal (postal STRICT) ---------- */
function cityCores(name?: string | null): string[] {
  const n = normalizeAdmin(name);
  if (!n) return [];
  const out = new Set<string>([n]);
  if (/\bjakarta\b/.test(n)) out.add("jakarta");
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
  return cores.some((c) => cityRaw.includes(c) || lbl.includes(c));
}
function itemInDistrict(it: SuggestItem, districtName?: string | null) {
  const key = normalizeAdmin(districtName);
  if (!key) return true;
  const raw = (it.raw || {}) as any;
  const dRaw = normalizeAdmin(raw.district || raw.city_district || raw.subdistrict || "");
  const lbl = normalizeAdmin(it.label);
  return (dRaw && dRaw.includes(key)) || (lbl && lbl.includes(key));
}
function itemInPostcodeStrict(it: SuggestItem, postal?: string | null) {
  const want = normalizePostal5(postal);
  if (!want) return true;
  const got = itemPostal5(it);
  return !!got && got === want;
}

function filterByRegion(items: SuggestItem[], region: RegionSel) {
  let keep = items;

  const prov = keep.filter((it) => itemInProvince(it, region.province?.name));
  keep = prov.length ? prov : keep;

  const city = keep.filter((it) => itemInCity(it, region.city?.name));
  keep = city.length ? city : keep;

  const dist = keep.filter((it) => itemInDistrict(it, region.district?.name));
  keep = dist.length ? dist : keep;

  // STRICT postal (kalau ada)
  if (region.postalCode && region.postalCode.trim()) {
    keep = keep.filter((it) => itemInPostcodeStrict(it, region.postalCode));
  }

  return keep;
}

/* ---------- Candidate builder (jalan raya/gang + RT/RW friendly) ---------- */
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

/* ---------- LOG & Photon fetch ---------- */
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

/* ---------- Photon (ID-first) ---------- */
async function photonSearch(query: string, limit = 10, bias?: { lat: number; lon: number }, setPhotonRate?: any): Promise<SuggestItem[]> {
  // Bias ke Indonesia
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
        p.suburb || p.neighbourhood || p.village || p.hamlet || p.quarter || p.locality || p.ward,
        p.city || p.town || p.municipality || p.county,
        p.district || p.city_district || p.subdistrict,
        p.state,
        p.postcode,
      ]
        .filter(Boolean)
        .join(", ");
      return { label, lat, lon, raw: p };
    });

    const idOnly = rows.filter((it) => String(it.raw?.countrycode || "").toUpperCase() === "ID");
    return idOnly.length ? idOnly : rows;
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

/* ---------- Nominatim reverse (lebih detail) ---------- */
async function reverseNominatim(lat: number, lon: number) {
  try {
    // minta addressdetails dan zoom tinggi biar granular
    const r = await fetch(`https://geocode.maps.co/reverse?lat=${lat}&lon=${lon}&addressdetails=1&zoom=18&format=jsonv2`);
    const j = await r.json();
    const a = j.address || {};
    return {
      street: a.road || a.residential || a.pedestrian || a.path,
      housenumber: a.house_number,
      suburb: a.suburb || a.neighbourhood || a.village || a.hamlet || a.quarter || a.locality || a.ward,
      district: a.city_district || a.district || a.subdistrict,
      city: a.city || a.town || a.municipality || a.county,
      state: a.state || a.region || a.state_district,
      postcode: a.postcode,
      rt: a.rt || a["addr:rt"],
      rw: a.rw || a["addr:rw"],
      display_name: j.display_name,
      name: j.name,
    };
  } catch {
    return {};
  }
}

/* ---------- Heuristic kelurahan dari label (kalau tetap kosong) ---------- */
function kelFromLabel(label: string, already?: string | null) {
  if (already) return already;
  const parts = label.split(",").map((s) => s.trim());
  // ambil bagian kecil di awal yang bukan jalan panjang
  const pick = parts.find((p) => !/jalan|jl|jln|highway|tol|arteri|raya/i.test(p) && p.length <= 40);
  return pick || null;
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

  // SEARCH: kandidat → bias postal (jika ada) → +city → +province, lalu filter by region (postal STRICT)
  const runSearch = useCallback(
    async (qInput: string) => {
      const cands = buildCandidates(qInput);
      const wantPostal = normalizePostal5(region.postalCode);

      for (const cand of cands) {
        // 0) kalau ada kode pos: cobain cand + kode pos (bias keras)
        if (wantPostal) {
          const q0 = `${cand}, ${wantPostal}`;
          let items0 = await photonSearch(q0, limit, bias || undefined, setPhotonRate);
          if (items0.length) {
            const f0 = filterByRegion(items0, region);
            const b0 = f0.length ? f0 : items0;
            return prioritizeByProvince(b0, region);
          }
        }

        // 1) cand
        let items = await photonSearch(cand, limit, bias || undefined, setPhotonRate);
        if (items.length) {
          const filtered = filterByRegion(items, region);
          const best = filtered.length ? filtered : items;
          return prioritizeByProvince(best, region);
        }

        // 2) cand + city (+postal kalau ada)
        const withCity = [cand, region.city?.name, wantPostal || ""].filter(Boolean).join(", ");
        if (withCity !== cand) {
          items = await photonSearch(withCity, limit, bias || undefined, setPhotonRate);
          if (items.length) {
            const filtered = filterByRegion(items, region);
            const best = filtered.length ? filtered : items;
            return prioritizeByProvince(best, region);
          }
        }

        // 3) cand + province (+postal kalau ada)
        const withProv = [cand, region.province?.name, wantPostal || ""].filter(Boolean).join(", ");
        if (withProv !== cand) {
          items = await photonSearch(withProv, limit, bias || undefined, setPhotonRate);
          if (items.length) {
            const filtered = filterByRegion(items, region);
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

    // 1) detail dari raw Photon
    let detail: AddressDetail | null = s.raw ? mapPropsToAddress(s.raw) : null;

    // 2) Photon reverse kalau masih kosong
    if (allEmpty(detail)) {
      const base = await photonReverse(s.lat, s.lon, setPhotonRate);
      detail = mapPropsToAddress(base);
    }

    // 3) Jika ada kolom kosong → Nominatim reverse (sekali), lalu merge
    if (!detail?.rt || !detail?.rw || !detail?.kelurahan || !detail?.kecamatan || !detail?.kota || !detail?.kodepos) {
      const nom = await reverseNominatim(s.lat, s.lon);
      if (Object.keys(nom).length) {
        const nomAddr = mapPropsToAddress(nom);
        detail = {
          jalan: detail?.jalan || nomAddr.jalan,
          kelurahan: detail?.kelurahan || nomAddr.kelurahan,
          kecamatan: detail?.kecamatan || nomAddr.kecamatan,
          kota: detail?.kota || nomAddr.kota,
          provinsi: detail?.provinsi || nomAddr.provinsi,
          kodepos: detail?.kodepos || nomAddr.kodepos,
          rt: detail?.rt || nomAddr.rt,
          rw: detail?.rw || nomAddr.rw,
        };
        // RT/RW dari display_name nominatim
        detail = enrichRtRw(detail, [nom.display_name, nom.name]);
      }
    }

    // 4) Tambal RT/RW terakhir dari label, text yang kamu ketik, dan raw Photon
    detail = enrichRtRw(detail!, [s.label, text, s.raw?.name, s.raw?.locality, s.raw?.street]);

    // 5) Kalau kelurahan masih kosong, coba tarik dari label
    if (!detail.kelurahan) {
      detail.kelurahan = kelFromLabel(s.label, detail.kelurahan);
    }

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
              <span className="ml-2">Kec: {region.district?.name ?? "-"}</span>
              <span className="ml-2">KodePos (STRICT): {region.postalCode ?? "-"}</span>
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
          <div>
            <b>Koordinat</b>: {coords ? `${coords.lat.toFixed(6)}, ${coords.lon.toFixed(6)}` : "-"}
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
