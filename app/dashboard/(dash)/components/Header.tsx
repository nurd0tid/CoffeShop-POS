"use client";
import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import React, { MouseEventHandler, useEffect, useRef, useState } from "react";
import { BsCash, BsFullscreen, BsLaptop } from "react-icons/bs";
import { FiPrinter, FiUser } from "react-icons/fi";
import { GoGear } from "react-icons/go";
import { LuChartNoAxesCombined } from "react-icons/lu";
import { PiCalculator } from "react-icons/pi";
import { RiLogoutCircleLine } from "react-icons/ri";
import { TbProgress } from "react-icons/tb";

const Header = () => {
  const [showProfile, setShowProfile] = useState<boolean>(false);
  const profileRef = useRef<HTMLLIElement | null>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowProfile(false);
    };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const handleProfileClick: MouseEventHandler<HTMLAnchorElement> = (e) => {
    e.preventDefault();
    setShowProfile((s) => !s);
  };

  const handleLogout = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShowProfile(false);

    await signOut({ callbackUrl: "/auth/signin" });
  };

  return (
    <>
      <div className="[@media(min-width:992px)]:left-[252px] bg-[#fff] border-b border-b-[#e6eaed] h-[65px] z-[999] fixed top-0 right-0 left-0 transition-all duration-[.5s] ease-in [@media(max-width:991.96px)]:absolute [@media(max-width:991.96)]:w-full">
        {/* Header Left Logo */}
        <div className="[@media(min-width:992px)]:float-left [@media(min-width:992px)]:relative [@media(min-width:992px)]:text-center [@media(min-width:992px)]:z-[1] [@media(min-width:992px)]:hidden flex items-center h-[65px] w-[252px] p-[0_24px] transiation-all duration-[.5s] ease-in">
          <Link href="/" className="[@media(max-width:991.96)]:text-center [@media(max-width:991.96)]:w-full inline-block leading-0">
            <Image src="/logo-wide.png" alt="Logo" fill className="w-[130px] align-middle border-none object-contain max-w-full h-auto" />
          </Link>
        </div>
        {/* Nav User Menu */}
        <ul className="items-center justify-center m-0 relative pr-6 h-full transition-all duration-[.5s] ease-in [@media(max-width:991.96px)]:hidden flex flex-wrap pl-0 list-none">
          <li className="mr-auto ml-[24px] [@max-width(1199.96px)]:ml-[7px]"></li>
          <li className="border-r pr-[12px] ml-[12px] me-0 [@media(max-width:1199.96px)]:ml-[7px]  border-r-[#e6eaed]">
            <Link
              href="/dashboard/pos"
              className="h-[30px] text-white rounded-[5px] gap-2 p-[7px_12px] leading-normal bg-[#1B2850] border border-[#1B2850] shadow-[0_4px_20px_rgba(27,40,80,.15)] text-[.85rem] transition-all duration-[.5s] font-semibold flex items-center justify-center hover:bg-[#121b35] hover:border-[#121b35] hover:shdaow-[0_3px_10px_rgba(27,40,80,.5)] cursor-pointer w-full hover:!text-white focus:!text-white"
            >
              <BsLaptop />
              POS
            </Link>
          </li>
          <li className="ml-[12px] me-0 [@media(max-width:1199.96px)]:ml-[7px]">
            <Link href="#" className="p-0 flex leading-normal border-0 items-center justify-center bg-[#0076f9] rounded-[8px] w-[32px] h-[32px] relative">
              <PiCalculator size={16} className="leading-[1] text-white" />
            </Link>
          </li>
          <li className="ml-[12px] me-0 [@media(max-width:1199.96px)]:ml-[7px]">
            <Link
              href="#"
              className="p-0 flex leading-normal text-[#092c4c] border-0 items-center justify-center bg-[#f7f7f7] rounded-[8px] w-[32px] h-[32px] relative hover:text-[#0076f9]"
            >
              <BsFullscreen size={16} />
            </Link>
          </li>
          <li className="ml-[12px] me-0 [@media(max-width:1199.96px)]:ml-[7px]">
            <Link
              href="#"
              className="p-0 flex leading-normal text-[#092c4c] border-0 items-center justify-center bg-[#f7f7f7] rounded-[8px] w-[32px] h-[32px] relative hover:text-[#0076f9]"
            >
              <BsCash size={16} />
            </Link>
          </li>
          <li className="ml-[12px] me-0 [@media(max-width:1199.96px)]:ml-[7px]">
            <Link
              href="#"
              className="p-0 flex leading-normal text-[#092c4c] border-0 items-center justify-center bg-[#f7f7f7] rounded-[8px] w-[32px] h-[32px] relative hover:text-[#0076f9]"
            >
              <FiPrinter size={16} />
            </Link>
          </li>
          <li className="ml-[12px] me-0 [@media(max-width:1199.96px)]:ml-[7px]">
            <Link
              href="#"
              className="p-0 flex leading-normal text-[#092c4c] border-0 items-center justify-center bg-[#f7f7f7] rounded-[8px] w-[32px] h-[32px] relative hover:text-[#0076f9]"
            >
              <TbProgress size={16} />
            </Link>
          </li>
          <li className="ml-[12px] me-0 [@media(max-width:1199.96px)]:ml-[7px]">
            <Link
              href="#"
              className="p-0 flex leading-normal text-[#092c4c] border-0 items-center justify-center bg-[#f7f7f7] rounded-[8px] w-[32px] h-[32px] relative hover:text-[#0076f9]"
            >
              <LuChartNoAxesCombined size={16} />
            </Link>
          </li>
          <li className="ml-[12px] me-0 [@media(max-width:1199.96px)]:ml-[7px]">
            <Link
              href="#"
              className="p-0 flex leading-normal text-[#092c4c] border-0 items-center justify-center bg-[#f7f7f7] rounded-[8px] w-[32px] h-[32px] relative hover:text-[#0076f9]"
            >
              <GoGear size={16} />
            </Link>
          </li>
          <li className="ml-[12px] me-o relative [@media(max-width:1199.96px)]:ml-[7px]" ref={profileRef}>
            <Link href="#" className="p-0 flex leading-normal text-[#092c4c] border-0 items-center rounded-[5px] font-semibold" onClick={handleProfileClick}>
              <span className="flex items-center justify-center p-0 relative">
                <span className="flex items-center justify-center text-white w-[32px] h-[32px] rounded-[10px] font-semibold text-[15px]">
                  <Image src="/avator1.jpg" fill className="rounded-[6px] max-w-full h-auto !align-middle" alt="Avatar User" />
                </span>
              </span>
            </Link>
            <div
              className={`p-[8px] min-w-[200px] transition-all duration-[.5s] ease-in translate-y-[100px] shadow-[0_4px_60px_0_rgba(231,231,231,.47)] border-0 !mt-[55px] text-[.875rem] text-[#646b72] bg-white z-10 rounded-[8px] ${
                showProfile ? "opacity-100 visible pointer-events-auto translate-y-0" : "opacity-0 invisible pointer-events-none -translate-y-1"
              } absolute inset-[0px_0px_auto_auto] m-0 translate-[(0px,34px)]`}
            >
              <div className="p-0">
                <div className="bg-[#f9fafb] rounded-[5px] p-[16px] mb-[8px] flex">
                  <span className="inline-block relative">
                    <Image
                      src="/avator1.jpg"
                      alt="Avatar"
                      width={40}
                      height={40}
                      className="w-[40px] h-[40px] mt-0 rounded-[50%] align-middle max-w-full relative"
                    />
                    <span className="bottom-[10px] border-2 border-white h-[10px] w-[10px] m-0 absolute right-0 rounded-[50%] inline-block bg-[#3eb788]" />
                  </span>
                  <div className="ml-[10px]">
                    <h6>Jhon Doe</h6>
                    <h5>Super Admin</h5>
                  </div>
                </div>
                <hr className="!m-0 box-content h-0 overflow-visible border-t border-t-[#e6eaed] opacity-[1] text-[#646b72] border-0" />
                <Link
                  href="#"
                  className="font-medium flex items-center p-[8px_5px] text-[#646b72] text-[.8125rem] w-full text-left bg-transparent border-0 gap-2"
                >
                  <FiUser size={16} className="text-[#67748e]" />
                  My Profile
                </Link>
                <Link
                  href="#"
                  className="font-medium flex items-center p-[8px_5px] text-[#646b72] text-[.8125rem] w-full text-left bg-transparent border-0 gap-2"
                >
                  <GoGear size={16} className="text-[#67748e]" />
                  Settings
                </Link>
                <hr className="!m-0 box-content h-0 overflow-visible border-t border-t-[#e6eaed] opacity-[1] text-[#646b72] border-0" />
                <button
                  type="button"
                  onClick={handleLogout}
                  className="font-medium flex items-center p-[8px_5px] text-rose-500 text-[.8125rem] w-full text-left bg-transparent border-0 gap-2 cursor-pointer"
                >
                  <RiLogoutCircleLine size={16} className="text-rose-500" />
                  Logout
                </button>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Header;
