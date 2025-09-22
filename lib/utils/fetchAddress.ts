// /lib/utils/fetchAddress.ts
"use client";

/**
 * Photon-only helpers for address suggestions in Indonesia.
 * NO geocode, NO nominatim. Exactly like your fixed component.
 */

export type RegionSel = {
  province?: { id: string; name: string };
  city?: { id: string; name: string };
  district?: { id: string; name: string };
  village?: { id: string; name: string };
  postalCode?: string | null;
};

export type SuggestItem = { label: string; lat: number; lon: number; raw?: any };

// ================== Utils (same as your component) ==================
function parsePostcodeFromText(text: string): string | null {
  const m = text.match(/\b\d{5}\b/);
  return m ? m[0] : null;
}

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
  const hits: T[] = [],
    rest: T[] = [];
  for (const it of items) (normalizeLight((it as any).label).includes(key) ? hits : rest).push(it);
  return hits.length ? [...hits, ...rest] : items;
}

// ---------- filter prov + city + district + postal (postal STRICT) ----------
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

  if (region.postalCode && region.postalCode.trim()) {
    keep = keep.filter((it) => itemInPostcodeStrict(it, region.postalCode));
  }

  return keep;
}

// ---------- Candidate builder (jalan raya/gang + RT/RW friendly) ----------
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

// ---------- Helper: bersihin part RT/RW & dedup + drop state ----------
function isRtRwPart(part: string): boolean {
  const t = part.trim();
  if (/^(r\s*\.?\s*t|rt)\b/i.test(t)) return true;
  if (/^(r\s*\.?\s*w|rw)\b/i.test(t)) return true;
  if (/^rw\s*\d{1,3}$/i.test(t)) return true;
  if (/^rt\s*\d{1,3}$/i.test(t)) return true;
  return false;
}
function cleanLabelParts(parts: Array<string | undefined | null>): string {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const p of parts) {
    if (!p) continue;
    const s = String(p).trim();
    if (!s) continue;
    if (isRtRwPart(s)) continue;
    const key = s.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
  }
  return out.join(", ");
}

// ================== Photon fetch (client) ==================
type RateState = { hits: number; lastStatus?: number; lastMs?: number; lastUrl?: string; limited?: boolean; lastErr?: string | null };
let lastPhotonAt = 0;
const PHOTON_GAP_MS = 250;
const ID_BBOX = "95,-11,141,6";
const PHOTON_LANG = "en";

async function fetchPhoton(url: string, hookRate?: (r: Partial<RateState>) => void) {
  const now = Date.now();
  const need = PHOTON_GAP_MS - (now - lastPhotonAt);
  if (need > 0) await new Promise((r) => setTimeout(r, need));
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
    hookRate?.({ hits: 1, lastStatus: 0, lastMs: ms, lastUrl: url, lastErr: String(err), limited: false });
    throw err;
  }
  const limited = res.status === 429 || res.status === 503;
  hookRate?.({ hits: 1, lastStatus: res.status, lastMs: ms, lastUrl: url, limited, lastErr: null });
  if (!res.ok) throw new Error(`photon HTTP ${res.status}`);
  return res;
}

// Exported: photonSearch & photonReverse (EXACT behavior like component)
export async function photonSearch(
  query: string,
  limit = 10,
  bias?: { lat: number; lon: number },
  hookRate?: (r: Partial<RateState>) => void
): Promise<SuggestItem[]> {
  const qForPhoton = query.includes("Indonesia") ? query : `${query}, Indonesia`;
  const params = new URLSearchParams({ q: qForPhoton, lang: PHOTON_LANG, limit: String(limit), bbox: ID_BBOX });
  if (bias) {
    params.set("lat", String(bias.lat));
    params.set("lon", String(bias.lon));
  }
  const url = `https://photon.komoot.io/api/?${params.toString()}`;

  try {
    const r = await fetchPhoton(url, hookRate);
    const j = await r.json();
    const rows: SuggestItem[] = (j.features || []).map((f: any) => {
      const [lon, lat] = f.geometry.coordinates;
      const p = f.properties || {};
      const label = cleanLabelParts([
        p.name,
        p.street && p.housenumber ? `${p.street} ${p.housenumber}` : p.street,
        p.suburb || p.neighbourhood || p.village || p.hamlet || p.quarter || p.locality || p.ward,
        p.city || p.town || p.municipality || p.county,
        p.district || p.city_district || p.subdistrict,
        p.postcode,
      ]);
      return { label, lat, lon, raw: p };
    });

    const idOnly = rows.filter((it) => String(it.raw?.countrycode || "").toUpperCase() === "ID");
    return idOnly.length ? idOnly : rows;
  } catch {
    return [];
  }
}

export async function photonReverse(lat: number, lon: number, hookRate?: (r: Partial<RateState>) => void) {
  try {
    const r = await fetchPhoton(`https://photon.komoot.io/reverse?lat=${lat}&lon=${lon}&lang=${PHOTON_LANG}`, hookRate);
    const j = await r.json();
    return j.features?.[0]?.properties || {};
  } catch {
    return {};
  }
}

// ================== Bias & Main search runner (same pipeline) ==================
export async function getRegionBias(region: RegionSel, hookRate?: (r: Partial<RateState>) => void) {
  let arr: SuggestItem[] = [];
  if (region.district?.name) arr = await photonSearch(region.district.name, 1, undefined, hookRate);
  if (!arr.length && region.city?.name) arr = await photonSearch(region.city.name, 1, undefined, hookRate);
  if (!arr.length && region.province?.name) arr = await photonSearch(region.province.name, 1, undefined, hookRate);
  return arr[0] ? { lat: arr[0].lat, lon: arr[0].lon } : null;
}

// Optional post-filter to kill labels that carry different postal codes
function onlyWantedPostalInLabel(label: string, want?: string | null) {
  if (!want || !/^\d{5}$/.test(want)) return true;
  const codes = Array.from(new Set(label.match(/\b\d{5}\b/g) || []));
  return codes.length === 0 || (codes.length === 1 && codes[0] === want);
}

/**
 * EXACT “runSearch” pipeline you use in the component:
 * candidates → (postal bias) → +city → +province → filterByRegion → prioritizeByProvince
 * Photon-only.
 */
export async function runPhotonSuggestionSearch(
  qInput: string,
  region: RegionSel,
  {
    limit = 12,
    bias,
    strictLabelPostal = true, // keep true to avoid mixed 11610/11640 in label
    hookRate,
  }: {
    limit?: number;
    bias?: { lat: number; lon: number } | null;
    strictLabelPostal?: boolean;
    hookRate?: (r: Partial<RateState>) => void;
  } = {}
): Promise<SuggestItem[]> {
  const cands = buildCandidates(qInput);
  const wantPostal = normalizePostal5(region.postalCode);

  const postClean = (items: SuggestItem[]) => {
    const filtered = filterByRegion(items, region);
    const best = filtered.length ? filtered : items;
    const cleaned = strictLabelPostal ? best.filter((it) => onlyWantedPostalInLabel(it.label, wantPostal)) : best;
    return prioritizeByProvince(cleaned.length ? cleaned : best, region);
  };

  for (const cand of cands) {
    // 0) kalau ada kode pos → bias keras
    if (wantPostal) {
      const q0 = `${cand}, ${wantPostal}`;
      let items0 = await photonSearch(q0, limit, bias || undefined, hookRate);
      if (items0.length) return postClean(items0);
    }

    // 1) cand
    let items = await photonSearch(cand, limit, bias || undefined, hookRate);
    if (items.length) return postClean(items);

    // 2) cand + city (+postal kalau ada)
    const withCity = [cand, region.city?.name, wantPostal || ""].filter(Boolean).join(", ");
    if (withCity !== cand) {
      items = await photonSearch(withCity, limit, bias || undefined, hookRate);
      if (items.length) return postClean(items);
    }

    // 3) cand + province (+postal kalau ada)
    const withProv = [cand, region.province?.name, wantPostal || ""].filter(Boolean).join(", ");
    if (withProv !== cand) {
      items = await photonSearch(withProv, limit, bias || undefined, hookRate);
      if (items.length) return postClean(items);
    }
  }

  return [];
}

// ============== Tiny helpers you might need in the component ==============
export function pickPostcodeForSuggestion(s: SuggestItem, region: RegionSel) {
  return s.raw?.postcode || parsePostcodeFromText(s.label) || region.postalCode || null;
}
