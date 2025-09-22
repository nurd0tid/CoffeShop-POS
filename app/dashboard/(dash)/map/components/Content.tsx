"use client";

import React, { useState } from "react";
import { Card, ConfigProvider } from "antd";
import AddressAutocomplete from "./address-auto-complete";
import Map from "./maps";

type LatLng = { lat: number; lng: number };
type Boundary = { northeast: LatLng; southwest: LatLng };

function makeBoundaryFromCoords(center: LatLng, radiusMeters = 400): Boundary {
  const metersPerDegLat = 111_320;
  const metersPerDegLng = 111_320 * Math.cos((center.lat * Math.PI) / 180);
  const dLat = radiusMeters / metersPerDegLat;
  const dLng = radiusMeters / metersPerDegLng;
  return {
    northeast: { lat: center.lat + dLat, lng: center.lng + dLng },
    southwest: { lat: center.lat - dLat, lng: center.lng - dLng },
  };
}

const Content = () => {
  const [selected, setSelected] = useState<{
    address: string;
    coords: { lat: number; lng: number };
  } | null>(null);

  const [areaBoundary, setAreaBoundary] = useState<Boundary | null>(null);

  const provinsi = "Daerah Khusus Ibukota Jakarta";
  const kodePos = "11640";

  const acKey = selected ? `${selected.coords.lat.toFixed(6)},${selected.coords.lng.toFixed(6)}` : "init";

  return (
    <ConfigProvider>
      <div className="flex items-center justify-between mb-[30px]">
        <div className="mr-auto">
          <h4 className="font-bold mb-[5px] text-[1.125rem] text-[#212b36] leading-[1.2]">Map</h4>
          <h6 className="text-sm text-[#646b72] leading-[1.2]">Choose Your Location</h6>
        </div>
      </div>

      <Card title="Pilih Alamat dan Lokasi">
        <AddressAutocomplete
          key={acKey}
          provinsi={provinsi}
          kodePos={kodePos}
          initialAddress={selected?.address ?? ""}
          onAddressSelect={(address, coords) => {
            const fixed = { lat: coords.lat, lng: coords.lng };
            setSelected({ address, coords: fixed });
            setAreaBoundary(makeBoundaryFromCoords(fixed, 400));
          }}
        />

        <div className="mt-4">
          <Map
            coordinates={selected ? selected.coords : null}
            initialAddress={selected ? selected.address : ""}
            areaBoundary={areaBoundary}
            allowedPostal={kodePos}
            onLocationConfirm={(newAddress, newCoords) => {
              setSelected({ address: newAddress, coords: newCoords });
              setAreaBoundary(makeBoundaryFromCoords(newCoords, 400));
            }}
          />
        </div>
      </Card>

      {selected && <pre className="mt-4 p-3 rounded-md border bg-white text-xs overflow-auto">{JSON.stringify(selected, null, 2)}</pre>}
    </ConfigProvider>
  );
};

export default Content;
