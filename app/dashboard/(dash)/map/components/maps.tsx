"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Plus } from "lucide-react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import MapModal from "./map-modal";

interface MapProps {
  coordinates: { lat: number; lng: number } | null;
  initialAddress: string;
  areaBoundary: { northeast: { lat: number; lng: number }; southwest: { lat: number; lng: number } } | null;
  allowedPostal?: string | null;
  onLocationConfirm: (address: string, newCoordinates: { lat: number; lng: number }) => void;
}

const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), { ssr: false });

const Map: React.FC<MapProps> = ({ coordinates, initialAddress, areaBoundary, allowedPostal, onLocationConfirm }) => {
  const [showMapModal, setShowMapModal] = useState(false);
  const [markerIcon, setMarkerIcon] = useState<any>(null);

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

  const mapCenter = useMemo(() => coordinates ?? { lat: -2.5489, lng: 118.0149 }, [coordinates]);

  const handleMapClick = () => setShowMapModal(true);
  const handleModalClose = () => setShowMapModal(false);

  return (
    <>
      {coordinates ? (
        <div className="w-full relative bg-gray-100">
          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-t-md">
            <AlertTriangle className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-blue-600 font-semibold text-sm">Tetapkan pin yang tepat</p>
              <p className="text-zinc-500 text-xs">
                Kami akan mengantarkan ke lokasi peta. Mohon periksa apakah sudah benar, jika belum klik peta untuk menyesuaikan.
              </p>
            </div>
          </div>

          <div className={cn("relative w-full h-36", showMapModal && "opacity-60")}>
            <MapContainer
              center={[mapCenter.lat, mapCenter.lng]}
              zoom={15}
              style={{ width: "100%", height: "100%" }}
              zoomControl={false}
              dragging={false}
              scrollWheelZoom={false}
              doubleClickZoom={false}
              attributionControl={false}
              className="z-0"
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {markerIcon && <Marker position={[mapCenter.lat, mapCenter.lng]} icon={markerIcon} />}
            </MapContainer>

            <button type="button" aria-label="Lihat peta penuh" onClick={handleMapClick} className="absolute inset-0 z-[600] bg-transparent" />

            <Button
              type="button"
              className={cn(
                "absolute right-4 top-4 z-[700] px-3 py-1 bg-white text-gray-700 text-xs shadow-md",
                "border border-gray-300 rounded-none hover:bg-gray-100 transition-colors"
              )}
              onClick={handleMapClick}
            >
              Lihat Peta
            </Button>
          </div>
        </div>
      ) : (
        <div className="w-full h-32 relative cursor-not-allowed">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url("/illustration/map.jpg")`, filter: "grayscale(100%) opacity(0.3)" }}
          />
          <div className="relative flex items-center justify-center h-full">
            <Button className={cn("flex items-center px-4 py-2 border border-gray-100 bg-white rounded text-black text-sm shadow-lg")} disabled>
              <Plus className="mr-2 text-lg" />
              Tambah Lokasi
            </Button>
          </div>
        </div>
      )}

      {coordinates && areaBoundary && (
        <MapModal
          isOpen={showMapModal}
          initialCoordinates={coordinates}
          initialAddress={initialAddress}
          areaBoundary={areaBoundary}
          allowedPostal={allowedPostal ?? null}
          onClose={handleModalClose}
          onConfirm={(newCoords, newAddress) => {
            onLocationConfirm(newAddress, newCoords);
            setShowMapModal(false);
          }}
        />
      )}
    </>
  );
};

export default Map;
