"use client";
import { Card, ConfigProvider } from "antd";
import React from "react";
import AddressAutocompleteLeaflet from "./AddressAutocompleteLeaflet";

const Content = () => {
  const region = {
    province: { id: "31", name: "Daerah Khusus Ibukota Jakarta" },
    city: { id: "3174", name: "Kota Jakarta Barat" },
    district: { id: "3174020", name: "Kembangan" },
    postalCode: "11640", // opsional
  };

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
            // simpan r.coords (lat/lon) + r.address (komponen) + r.display (string)
            console.log(r);
          }}
        />
      </Card>
    </ConfigProvider>
  );
};

export default Content;
