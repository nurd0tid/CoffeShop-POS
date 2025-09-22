"use client";

import React, { useEffect, useState } from "react";
import { runPhotonSuggestionSearch, getRegionBias, type RegionSel, type SuggestItem } from "@/lib/utils/fetchAddress"; // <- sesuaikan path kalau berbeda

interface AddressAutocompleteProps {
  provinsi: string;
  kodePos: string;
  initialAddress: string;
  onAddressSelect: (address: string, coords: { lat: number; lng: number }) => void;
  error?: boolean;
  // opsional (biar filter makin ketat, kalau kamu punya datanya)
  kota?: string;
  kecamatan?: string;
  kelurahan?: string;
}

const MIN_QUERY = 3;

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({ provinsi, kodePos, initialAddress, onAddressSelect, error, kota, kecamatan, kelurahan }) => {
  const [query, setQuery] = useState<string>("");
  const [suggestions, setSuggestions] = useState<SuggestItem[]>([]);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [bias, setBias] = useState<{ lat: number; lon: number } | null>(null);

  // build RegionSel dari props sederhana (tanpa maksa city/district kalau nggak ada)
  const region: RegionSel = {
    province: provinsi ? { id: provinsi, name: provinsi } : undefined,
    city: kota ? { id: kota, name: kota } : undefined,
    district: kecamatan ? { id: kecamatan, name: kecamatan } : undefined,
    village: kelurahan ? { id: kelurahan, name: kelurahan } : undefined,
    postalCode: kodePos || null,
  };

  // set initial text
  useEffect(() => {
    if (initialAddress) setQuery(initialAddress);
  }, [initialAddress]);

  // ambil bias dari region (Photon only)
  useEffect(() => {
    let dead = false;
    (async () => {
      const b = await getRegionBias(region);
      if (!dead) setBias(b);
    })();
    return () => {
      dead = true;
    };
  }, [provinsi, kota, kecamatan, kelurahan, kodePos]);

  // debounce fetch suggestions (Photon only, exact pipeline dari fetchAddress.ts)
  useEffect(() => {
    const t = setTimeout(async () => {
      const q = query.trim();
      if (q.length >= MIN_QUERY && provinsi) {
        try {
          const rows = await runPhotonSuggestionSearch(q, region, {
            limit: 12,
            bias,
            strictLabelPostal: true, // hindari 11610/11640 campur di label
          });
          setSuggestions(rows);
        } catch {
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
      }
    }, 500);
    return () => clearTimeout(t);
  }, [query, provinsi, kodePos, kota, kecamatan, kelurahan, bias]);

  const handleSuggestionClick = (s: SuggestItem) => {
    const fullAddress = s.label; // sudah clean (tanpa RT/RW & tanpa "Java")
    setQuery(fullAddress);
    setIsFocused(false);
    onAddressSelect(fullAddress, { lat: s.lat, lng: s.lon });
  };

  return (
    <div className="relative">
      <div className="relative">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder=" "
          disabled={!provinsi}
          className={`block px-2.5 pb-2.5 pt-4 w-full text-xs resize-none ${
            !provinsi ? "bg-gray-100 cursor-not-allowed text-gray-500" : "text-gray-900"
          } bg-transparent border-1 ${
            error
              ? "border-rose-500 appearance-none focus:outline-none focus:ring-0 focus:border-rose-600 peer"
              : "border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-gray-600 peer"
          }`}
          rows={3}
        />
        <label
          className={`absolute text-sm ${
            !provinsi ? "text-gray-400" : "text-gray-500"
          } duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-gray-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1`}
        >
          Nama Jalan, Gedung, No. Rumah
        </label>
      </div>

      {isFocused && suggestions.length > 0 && (
        <div className="mt-1 bg-white border border-gray-300 shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((s, idx) => (
            <div
              key={`${s.lat}-${s.lon}-${idx}`}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
              onClick={() => handleSuggestionClick(s)}
            >
              <div className="text-xs space-x-1">
                <span className="font-semibold">{s.label}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete;
