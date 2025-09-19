"use client";
import { Card, ConfigProvider } from "antd";
import React from "react";
import AddressAutocompleteLeaflet from "./AddressAutocompleteLeaflet";

const Content = () => {
  // (opsional) simpan hasil pick buat dicek
  const [picked, setPicked] = React.useState<null | {
    coords: { lat: number; lon: number };
    display: string;
    address: {
      jalan: string | null;
      kelurahan: string | null;
      kecamatan: string | null;
      kota: string | null;
      provinsi: string | null;
      kodepos: string | null;
      rt: string | null;
      rw: string | null;
    };
  }>(null);

  // Pastikan region sudah termasuk kelurahan (village)
  // Contoh untuk Kembangan, Jakarta Barat, kode pos 11640 → kelurahan Joglo
  const region = React.useMemo(
    () => ({
      province: { id: "31", name: "Daerah Khusus Ibukota Jakarta" },
      city: { id: "3174", name: "Kota Jakarta Barat" },
      district: { id: "3174020", name: "Kecamatan Kembangan" }, // nama bebas, filter tetap jalan
      village: { id: "3174020005", name: "Kelurahan Joglo" }, // ⬅️ kelurahan (BARU)
      postalCode: "11640", // STRICT filter 5 digit
    }),
    []
  );

  return (
    <ConfigProvider>
      <div className="flex items-center justify-between mb-[30px]">
        <div className="mr-auto">
          <h4 className="font-bold mb-[5px] text-[1.125rem] text-[#212b36] leading-[1.2]">Map</h4>
          <h6 className="text-sm text-[#646b72] leading-[1.2]">Choose Your Location</h6>
        </div>
      </div>

      <Card title="Default size card">
        <AddressAutocompleteLeaflet
          region={region}
          onPicked={(r) => {
            // r.display = label suggestion yang sudah dibersihkan (tanpa RT/RW & tanpa "Java")
            // r.address.jalan = persis label tersebut
            // admin area (kel/kec/kota/prov) diisi dari props region; RT/RW dari input user
            setPicked(r);
            console.log("picked:", r);
          }}
        />
      </Card>

      {/* debug kecil biar kelihatan hasil */}
      {picked && <pre className="mt-4 p-3 rounded-md border bg-white text-xs overflow-auto">{JSON.stringify(picked, null, 2)}</pre>}
    </ConfigProvider>
  );
};

export default Content;
