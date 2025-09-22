"use client";
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IoIosArrowRoundBack } from "react-icons/io";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { photonReverse } from "@/lib/utils/fetchAddress";

// react-leaflet (SSR off)
const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), { ssr: false });
import { useMapEvents } from "react-leaflet";

interface MapModalProps {
  isOpen: boolean;
  initialCoordinates: { lat: number; lng: number };
  initialAddress: string;
  areaBoundary: { northeast: { lat: number; lng: number }; southwest: { lat: number; lng: number } };
  allowedPostal: string | null; // wajib sama
  onClose: () => void;
  onConfirm: (newCoordinates: { lat: number; lng: number }, newAddress: string) => void;
}

function normalizePostal5(s?: string | null) {
  if (!s) return null;
  const m = String(s).match(/\b\d{5}\b/);
  return m ? m[0] : null;
}

const MapModal: React.FC<MapModalProps> = ({ isOpen, initialCoordinates, initialAddress, areaBoundary, allowedPostal, onClose, onConfirm }) => {
  const [center, setCenter] = useState(initialCoordinates);
  const [markerIcon, setMarkerIcon] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  useEffect(() => {
    if (isOpen) {
      setCenter(initialCoordinates);
      setErrorMsg(null);
    }
  }, [isOpen, initialCoordinates]);

  const isWithinBounds = (p: { lat: number; lng: number }) => {
    const { northeast, southwest } = areaBoundary;
    return p.lat >= southwest.lat && p.lat <= northeast.lat && p.lng >= southwest.lng && p.lng <= northeast.lng;
  };

  const handleConfirm = async () => {
    setErrorMsg(null);

    if (!isWithinBounds(center)) {
      setErrorMsg("Lokasi berada di luar area yang diizinkan.");
      return;
    }

    // reverse via Photon + cek kode pos
    const rev = await photonReverse(center.lat, center.lng);
    const gotPostal = normalizePostal5(rev?.postcode ?? null);
    const wantPostal = normalizePostal5(allowedPostal);

    if (wantPostal && gotPostal && gotPostal !== wantPostal) {
      setErrorMsg(`Kode Pos tidak sesuai (sekarang: ${gotPostal}, harus: ${wantPostal}).`);
      return;
    }

    const display = [
      rev?.name ?? "",
      rev?.street ? (rev?.housenumber ? `${rev.street} ${rev.housenumber}` : rev.street) : "",
      rev?.suburb || rev?.village || rev?.neighbourhood || "",
      rev?.city || rev?.town || rev?.municipality || rev?.county || "",
      rev?.district || rev?.city_district || rev?.subdistrict || "",
      rev?.postcode || "",
    ]
      .map((s) => (s || "").trim())
      .filter(Boolean)
      .join(", ");

    onConfirm(center, display || initialAddress);
  };

  // Geser pin: bisa klik peta atau drag marker
  const Dragger = () => {
    useMapEvents({
      click(e) {
        setCenter({ lat: e.latlng.lat, lng: e.latlng.lng });
      },
    });
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white rounded-none [&>button]:hidden max-w-screen-md max-h-screen z-[999]" aria-describedby={undefined}>
        <DialogTitle></DialogTitle>

        <div className="flex gap-2">
          <IoIosArrowRoundBack className="w-14 h-14 text-zinc-400 cursor-pointer" onClick={onClose} />
          <div>
            <span className="text-lg text-black font-medium">Ubah Lokasi</span>
            <p className="text-sm text-zinc-400">{initialAddress}</p>
          </div>
        </div>

        <div className="w-full h-96 overflow-hidden mb-2 relative">
          <MapContainer center={[initialCoordinates.lat, initialCoordinates.lng]} zoom={15} style={{ width: "100%", height: "100%" }} scrollWheelZoom>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Dragger />
            {markerIcon && (
              <Marker
                position={[center.lat, center.lng]}
                icon={markerIcon}
                draggable
                eventHandlers={{
                  dragend: (e) => {
                    const ll = e.target.getLatLng();
                    setCenter({ lat: ll.lat, lng: ll.lng });
                  },
                }}
              />
            )}
          </MapContainer>
        </div>

        {errorMsg && <div className="p-3 text-sm border border-rose-200 bg-rose-50 text-rose-700">{errorMsg}</div>}

        <div className="flex justify-end items-center p-4 bg-white gap-2">
          <Button variant="ghost" className="text-gray-700 rounded-none w-36" onClick={onClose}>
            Nanti Saja
          </Button>
          <Button className="bg-[#0076f9] text-white rounded-none hover:bg-[#0076f9]/60 w-36" onClick={handleConfirm}>
            Konfirmasi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MapModal;
