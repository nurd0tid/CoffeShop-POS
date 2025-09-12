"use client";
import { MenuItem } from "@/types/menu";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { BsCash, BsTrash } from "react-icons/bs";
import { CiCreditCard1, CiMoneyBill, CiPause1 } from "react-icons/ci";
import { FiEdit, FiMinusCircle, FiPlusCircle, FiUserPlus } from "react-icons/fi";
import { IoCloseOutline, IoTrashOutline } from "react-icons/io5";
import { RiQrScan2Line } from "react-icons/ri";
import { TbTrashXFilled } from "react-icons/tb";
const Select = dynamic(() => import("react-select"), { ssr: false });

const options = [
  { value: "john", label: "John" },
  { value: "smith", label: "Smith" },
  { value: "ana", label: "Ana" },
  { value: "elza", label: "Elza" },
];

const optionsProduct = [
  { value: "coffe", label: "Coffe" },
  { value: "pie", label: "Pie" },
];

type SidebarProps = {
  selectedMenus: MenuItem[];
  onDeleteMenu: (id: string) => void;
  onClearMenus: () => void;
};

const Sidebar = ({ selectedMenus, onDeleteMenu, onClearMenus }: SidebarProps) => {
  // State untuk quantity per menu
  const [quantities, setQuantities] = useState<{ [id: string]: number }>({});

  // Set default quantity 1 jika belum ada
  useEffect(() => {
    const newQuantities = { ...quantities };
    selectedMenus.forEach((menu) => {
      if (!newQuantities[menu.id]) {
        newQuantities[menu.id] = 1;
      }
    });
    // Remove quantity for deleted menus
    Object.keys(newQuantities).forEach((id) => {
      if (!selectedMenus.find((menu) => menu.id === id)) {
        delete newQuantities[id];
      }
    });
    setQuantities(newQuantities);
    // eslint-disable-next-line
  }, [selectedMenus]);

  // Hapus produk
  const handleDelete = (id: string) => {
    const newQuantities = { ...quantities };
    delete newQuantities[id];
    setQuantities(newQuantities);
    // Trigger hapus di parent (optional, jika ingin hapus dari Content juga)
    // Bisa pakai callback prop jika ingin sinkron
  };

  // Tambah/kurang quantity
  const handleQuantity = (id: string, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) + delta),
    }));
  };

  // Hitung subtotal
  const getMenuSubtotal = (menu: MenuItem) => {
    // Ambil harga size pertama (atau bisa pilih size lain jika ada fitur)
    const priceObj = menu.price[0];
    return priceObj.value * (quantities[menu.id] || 1);
  };

  const subtotal = selectedMenus.reduce((sum, menu) => sum + getMenuSubtotal(menu), 0);
  const tax = Math.round(subtotal * 0.11);
  const discount = 0;
  const total = subtotal + tax - discount;

  const formatRupiah = (value: number) => "Rp" + value.toLocaleString("id-ID", { minimumFractionDigits: 0 });

  return (
    <>
      <div className="col-span-12 lg:col-span-5 xl:col-span-4 sticky top-0">
        <aside className="p-6 overflow-y-auto bg-white border-l border-l-[#e6eaed] [@media(min-width:992px)]:h-[calc(100vh-65px)]">
          {/* Section Order Number */}
          <div className="rounded-[8px] p-[10px] mb-[20px] text-[#5b6670] bg-[#f9faFB] flex items-center justify-between w-full">
            <div>
              <h3 className="font-medium text-[#212b36] text-[1.125rem]">Order List</h3>
              <span>Transaction ID : #655565</span>
            </div>
            <div>
              <Link href="#" className="text-rose-500 text-[1rem]">
                <TbTrashXFilled />
              </Link>
            </div>
          </div>
          {/* Section Custom Information */}
          <div className="border-b border-b-[#e6eaed] pb-[10px] mb-[20px]">
            <h4 className="mb-[1rem] font-medium text-[#212b36] leading-[1.2] text-lg">Custom Information</h4>
            <div className="mb-[10px] flex items-center">
              <div className="grow">
                <Select
                  options={options}
                  placeholder="Walk in Customer"
                  isSearchable={false}
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderColor: "#dbe0e6",
                      boxShadow: "none",
                      outline: "none",
                      height: "40px",
                      justifyContent: "center",
                      alignItems: "center",
                      display: "flex",
                      flexWrap: "wrap",
                      minHeight: "38px",
                      position: "relative",
                      transition: "all 100ms",
                      color: "#5b6670",
                      "&:hover": { borderColor: "#dbe0e6" },
                    }),
                  }}
                />
              </div>
              <Link
                href="#"
                className="min-w-[38px] min-h-[38px] ml-[10px] inline-flex items-center justify-center p-0 rounded-[8px] bg-[#0076f9] border border-[#0076f9] text-white shadow-[0_4px_20px_rgba(254,159,67,.15)]"
              >
                <FiUserPlus size={16} />
              </Link>
            </div>
            <div className="mb-[10px]">
              <Select
                options={optionsProduct}
                placeholder="Search Product"
                isSearchable={true}
                styles={{
                  control: (base) => ({
                    ...base,
                    borderColor: "#dbe0e6",
                    boxShadow: "none",
                    outline: "none",
                    height: "40px",
                    justifyContent: "center",
                    alignItems: "center",
                    display: "flex",
                    flexWrap: "wrap",
                    minHeight: "38px",
                    position: "relative",
                    transition: "all 100ms",
                    color: "#5b6670",
                    "&:hover": { borderColor: "#dbe0e6" },
                  }),
                }}
              />
            </div>
          </div>
          {/* Section Product Added */}
          <div className="mb-[20px]">
            <div className="mb-[20px] flex items-center justify-between">
              <h5 className="mb-0 items-center flex mt-0 font-medium text-[1rem] text-[#212b36]">
                Product Added
                <span className="w-[15px] h-[15px] flex items-cente justify-center bg-[#0076f9] rounded-full text-white text-[10px] font-semibold ml-[5px]">
                  {selectedMenus.length}
                </span>
              </h5>
              {selectedMenus.length > 0 && (
                <button className="text-rose-500 flex items-center gap-2 cursor-pointer" onClick={onClearMenus}>
                  <IoCloseOutline size={16} />
                  Clear All
                </button>
              )}
            </div>
            <div className="h-[311px] overflow-auto">
              {/* No Product */}
              {selectedMenus.length === 0 ? (
                <div className="block">
                  <Image src="/no-empty.png" width={150} height={150} alt="No Product" className="mx-auto block" />
                </div>
              ) : (
                selectedMenus.map((menu) => (
                  <div key={menu.id} className="border border-[#e6eaed] rounded-[8px] mb-[5px] p-[8px] flex flex-wrap gap-2 items-center justify-between">
                    <div className="flex items-center w-3/5">
                      <Link href="#" className="w-[83px] h-[83px] bg-[#fafbfe] rounded-[10px] flex items-center mr-[10px] shrink-0">
                        <Image src="/akal_sehat.png" width={70} height={70} alt="Product" className="align-middle h-auto max-w-full" />
                      </Link>
                      <div>
                        <span className="bg-[#0076f9] rounded-[3px] font-semibold text-white text-xs p-[2px_4px] min-w-[52px] inline-block mb-[5px]">
                          {`REF${(selectedMenus.findIndex((m) => m.id === menu.id) + 1).toString().padStart(4, "0")}`}
                        </span>
                        <h6 className="font-bold mb-[5px] text-[.875rem] text-[#212b36] cursor-pointer">{menu.name}</h6>
                        <p className="font-bold text-sm mb-0 text-[#0e9384]">{formatRupiah(menu.price[0].value)}</p>
                      </div>
                    </div>
                    <div className="bg-[#e6eaed] border-0 text-[#212b36] p-[1px_7px] rounded-[8px] flex items-center gap-2">
                      <span>
                        <FiMinusCircle size={16} onClick={() => handleQuantity(menu.id, -1)} className="cursor-pointer" />
                      </span>
                      <input
                        className="rounded-[8px] h-[28px] w-[71px] text-center text-sm focus:ring-0 focus:border-0 focus:outline-0"
                        value={quantities[menu.id] || 1}
                        readOnly
                      />
                      <span>
                        <FiPlusCircle size={16} onClick={() => handleQuantity(menu.id, 1)} className="cursor-pointer" />
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-[7px] rounded-[8px] border border-[#e6eaed] w-[30px] h-[30px] cursor-pointer inline-flex items-center justify-center hover:bg-[#0076f9] hover:text-white">
                        <FiEdit size={16} />
                      </button>
                      <button
                        className="p-[7px] rounded-[8px] border border-[#e6eaed] w-[30px] h-[30px] cursor-pointer inline-flex items-center justify-center hover:bg-rose-500 hover:text-white"
                        onClick={() => onDeleteMenu(menu.id)}
                      >
                        <BsTrash size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          {/* Section Order Price Information */}
          <div className="mb-[20px]">
            <div className="mb-[20px] pb-[20px] border-b border-b-[#e6eaed]"></div>
            <div className="bg-[#f9fafb] p-[24px] rounded-[8px]">
              <table className="m-0 text-[#646b72] overflow-x-auto w-full">
                <tbody>
                  <tr>
                    <td className="p-[0_0_15px] text-[15px] font-medium align-middle whitespace-nowrap leading-[1.462]">Sub Total</td>
                    <td className="!text-right p-[0_0_15px] text-[15px] font-medium align-middle leading-[1.462] whitespace-nowrap">
                      {formatRupiah(subtotal)}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-[0_0_15px] text-[15px] font-medium align-middle whitespace-nowrap leading-[1.462]">Tax (GST 11%)</td>
                    <td className="!text-right p-[0_0_15px] text-[15px] font-medium align-middle leading-[1.462] whitespace-nowrap">{formatRupiah(tax)}</td>
                  </tr>
                  <tr>
                    <td className="p-[0_0_15px] text-[15px] font-medium align-middle whitespace-nowrap leading-[1.462]">Sub Total</td>
                    <td className="!text-right p-[0_0_15px] text-[15px] font-medium align-middle leading-[1.462] whitespace-nowrap">
                      {formatRupiah(subtotal + tax)}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-[0_0_15px] text-[15px] text-rose-500 font-medium align-middle whitespace-nowrap leading-[1.462]">Discount (10%)</td>
                    <td className="!text-right p-[0_0_15px] text-rose-500 text-[15px] font-medium align-middle leading-[1.462] whitespace-nowrap">
                      {formatRupiah(discount)}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-[20px_0_0] text-[16px] text-[#092c4c] font-semibold align-middle whitespace-nowrap leading-[1.462]">Total</td>
                    <td className="!text-right p-[20px_0_0] text-[#092c4c]text-[16px] font-semibold align-middle leading-[1.462] whitespace-nowrap">
                      {formatRupiah(total)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          {/* Section Payment Method */}
          <div className="mb-[20px]">
            <h4 className="mb-[10px] font-medium mt-0 text-[1.125rem] text-[#212b36]">Payment Method</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="">
                <div className="transition-all duration-[.5s] ease-in p-[10px_15px] text-[15px] text-[#092c4c] rounded-[10px] border border-[#e6eaed] cursor-pointer hover:bg-[#fff6ee] hover:border-[#0076f9] hover:text-[#0076f9]  flex flex-col items-center justify-center gap-2">
                  <BsCash className="text-[#646b72] hover:text-[#0076f9] text-lg" />
                  Cash
                </div>
              </div>
              <div className="">
                <div className="transition-all duration-[.5s] ease-in p-[10px_15px] text-[15px] text-[#092c4c] rounded-[10px] border border-[#e6eaed] cursor-pointer hover:bg-[#fff6ee] hover:border-[#0076f9] hover:text-[#0076f9]  flex flex-col items-center justify-center gap-2">
                  <CiCreditCard1 className="text-[#646b72] hover:text-[#0076f9] text-lg" />
                  Debit Card
                </div>
              </div>
              <div className="">
                <div className="transition-all duration-[.5s] ease-in p-[10px_15px] text-[15px] text-[#092c4c] rounded-[10px] border border-[#e6eaed] cursor-pointer hover:bg-[#fff6ee] hover:border-[#0076f9] hover:text-[#0076f9] flex flex-col items-center justify-center gap-2">
                  <RiQrScan2Line className="text-[#646b72] hover:text-[#0076f9] text-lg" />
                  Scan
                </div>
              </div>
            </div>
          </div>
          <div className="mb-[20px]">
            <button
              className={`text-sm font-bold p-[13px_10px] rounded-[5px] !w-full transition-all duration-[.5s] border
    ${
      selectedMenus.length === 0
        ? "bg-[#e6eaed] border-[#e6eaed] text-[#b8bcc9] cursor-not-allowed"
        : "bg-[#092c4c] border-[#092c4c] text-white shadow-[0_4px_20px_rgba(9,44,76,.15)] hover:bg-[rgb(5.22,25.52,44.09)] hover:shadow-[0_3px_10px_rgba(9,44,76,.5)] cursor-pointer"
    }`}
              disabled={selectedMenus.length === 0}
            >
              Grand Total : {formatRupiah(total)}
            </button>
          </div>
          <div className="mb-[20px]">
            <div className="grid grid-cols-3 gap-3">
              <button className="cursor-pointer flex items-center justify-center gap-2 text-sm p-[9px] rounded-[4px] bg-[#693bef] shadow-[0_4px_20px_rgba(105,56,239,.15)] text-white font-bold hover:bg-[#5017ec] hover:shadow-[0_3px_10px_rgba(105,56,239,.5)]">
                <CiPause1 />
                Hold
              </button>
              <button className="cursor-pointer flex items-center justify-center gap-2 text-sm p-[9px] rounded-[4px] bg-[#FF0000] shadow-[0_4px_20px_rgba(255,0,0,.15)] text-white font-bold hover:bg-[#db0000] hover:shadow-[0_3px_10px_rgba(255,0,0,.5)]">
                <IoTrashOutline />
                Void
              </button>
              <button className="cursor-pointer flex items-center justify-center gap-2 text-sm p-[9px] rounded-[4px] bg-[#3EB780] shadow-[0_4px_20px_rgba(62,183,128,.15)] text-white font-bold hover:bg-[#137347] hover:shadow-[0_3px_10px_rgba(62,183,128,.5)]">
                <CiMoneyBill />
                Payment
              </button>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
};

export default Sidebar;
