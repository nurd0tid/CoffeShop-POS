"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { IoSearchOutline } from "react-icons/io5";
import categories from "@/data/categories.json";
import menuItems from "@/data/menuItems.json";
import { MenuItem } from "@/types/menu";

type Props = {
  activeCategoryId: string;
  onSelectMenus?: (selected: MenuItem[]) => void;
};

const Content = ({ activeCategoryId, onSelectMenus }: Props) => {
  const [selectedMenus, setSelectedMenus] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const filteredMenus = (menuItems as MenuItem[]).filter((item) => {
    const matchCategory = activeCategoryId === categories[0].id ? true : item.categoryId === activeCategoryId;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.description.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  useEffect(() => {
    if (onSelectMenus) {
      const selectedMenuObjects = (menuItems as MenuItem[]).filter((menu) => selectedMenus.includes(menu.id));
      onSelectMenus(selectedMenuObjects);
    }
  }, [selectedMenus]);

  const handleSelectMenu = (id: string) => {
    setSelectedMenus((prev) => (prev.includes(id) ? prev.filter((menuId) => menuId !== id) : [...prev, id]));
  };

  const formatRupiah = (value: number) => "Rp" + value.toLocaleString("id-ID", { minimumFractionDigits: 0 });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h4 className="mb-4 mt-0 font-medium text-[1.125rem] text-[#212b36]">Products</h4>
        <div className="mb-4 relative">
          <span className="absolute top-0 bottom-0 left-0 flex items-center justify-center p-[0_8px] pointer-events-none text-xs text-[#a6aaaf] z-[9]">
            <IoSearchOutline />
          </span>
          <input
            className="text-xs pl-[30px] h-[30px] border border-[#e6eaed] text-[#212b36] bg-white leading-[1.6] rounded-[.35rem] p-[.45rem_.85rem] block w-full focus:ring-0 focus:outline-0"
            value={search}
            placeholder="Search products..."
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="pt-0 inline-block w-full">
        <div className="grid xl:grid-cols-4 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMenus.map((menu) => (
            <div key={menu.id}>
              <div
                className={`p-[15px] transition-all duration-[.5s] ease-in mb-[1.5rem] bg-white relative rounded-[8px] border shadow-none cursor-pointer
                  ${selectedMenus.includes(menu.id) ? "border-[#3eb780]" : "border-[#e6eaed] hover:border-[#3eb780]"}`}
                onClick={() => handleSelectMenu(menu.id)}
              >
                <Link
                  href="#"
                  className="bg-[#f9fafb] rounded-[10px] flex items-center justify-center mb-[10px] relative p-[10px] text-[#212b36] hover:transition-all hover:duration-[.5s] hover:ease-in"
                >
                  <Image
                    src="/akal_sehat.png"
                    width={108}
                    height={90}
                    alt={menu.name}
                    className="hover:transform-[scale(1.2)] transition-all duration-[.5s] ease-in align-middle"
                  />
                  {selectedMenus.includes(menu.id) && (
                    <span className="transition-all duration-[.5s] ease-in absolute top-[-5px] right-[-5px] rounded-full text-[#3eb780] items-center flex text-[18px] justify-center">
                      <IoIosCheckmarkCircle className="leading-[1]" />
                    </span>
                  )}
                </Link>
                <h6 className="mb-1 whitespace-nowrap overflow-hidden text-ellipsis">
                  <Link href="#" className="text-[#646b72] hover:transition-all hover:duration-[.5s] hover:ease-in whitespace-nowrap text-[.875rem]">
                    {categories.find((cat) => cat.id === menu.categoryId)?.name || "Unknown Category"}
                  </Link>
                </h6>
                <h6 className="font-bold whitespace-nowrap overflow-hidden text-ellipsis text-[#092c4c]">
                  <Link href="#" className="text-[#212b36] hover:transition-all hover:duration-[.5s] hover:ease-in whitespace-nowrap text-[.875rem]">
                    {menu.name}
                  </Link>
                </h6>

                <div className="flex items-center gap-2 mt-[4px]">
                  <span className="text-[#212b36] text-xs">{menu.description}</span>
                </div>
                <div className="flex items-center gap-2 mt-[8px] pt-[8px] border-t border-dashed border-t-[#e6eaed]">
                  {menu.price.map(({ size, value }) => (
                    <span key={size} className="text-[#3eb780] font-semibold text-xs">
                      {size}: {formatRupiah(value)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {filteredMenus.length === 0 && <div className="col-span-full text-center text-[#b8bcc9] py-8">No products found.</div>}
        </div>
      </div>
    </div>
  );
};

export default Content;
