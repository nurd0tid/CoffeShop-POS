"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";
import { GoShieldLock } from "react-icons/go";
import { RxDashboard } from "react-icons/rx";
import { TbJumpRope } from "react-icons/tb";

const Sidebar = () => {
  const pathname = usePathname();

  const linkCls = (href: string) =>
    `flex items-center font-medium text-sm relative w-full p-[8px_12px] rounded-[5px] gap-2 ${
      pathname === href ? "bg-[#e6f0ff] text-[#0076f9]" : "text-[#646b72] hover:text-[#0076f9] hover:bg-[#e6f0ff]"
    }`;

  return (
    <div className="ml-0 top-[0] [@min-width:992px]:top-[65px] block bg-white mt-0 z-[1001] fixed bottom-0 left-0 transition-all duration-[.5s] ease-in border-r border-r-[#e6eaed] w-[252px]  [@max-width(991.96px)]:ml-[-575px] [@max-width(991.96px)]:transition-all [@max-width(991.96px)]:duration-[.5s] [@max-width(991.96px)]:ease-in [@max-width(991.96px)]:bg-[#fff] [@max-width(991.96px)]:z-[1041] [@max-width(574.98px)]:w-full">
      <div className="flex items-center p-[0_24px] h-[65px] border-b border-b-[#e6eaed] [@max-width(768px)]:hidden [@max-width(991.96px)]:hidden">
        <Link href="/dashboard">
          <Image src="/logo-wide.png" alt="Logo" width={60} height={40} className="w-[60px] align-middle border-none object-contain max-w-full h-auto" />
        </Link>
      </div>

      <div className="relative h-full !overflow-hidden [overflow-anchor:none]">
        <div className="p-[24px]">
          <ul className="mt-0 mb-[1em]">
            <li className="mb-[16px]">
              <h6 className="font-bold text-xs text-[#092c4c] m-[0_0_8px]">Main</h6>
              <ul className="border-b border-b-[#e6eaed] pb-[16px] block">
                <li className="mb-[4px]">
                  <Link href="/dashboard" className={linkCls("/dashboard")}>
                    <RxDashboard size={14} className="text-inherit" />
                    <span className="whitespace-nowrap text-inherit">Dashboard</span>
                  </Link>
                </li>
              </ul>
            </li>

            <li className="mb-[16px]">
              <h6 className="font-bold text-xs text-[#092c4c] m-[0_0_8px]">User Management</h6>
              <ul className="border-b border-b-[#e6eaed] pb-[16px] block">
                <li className="mb-[4px]">
                  <Link href="/dashboard/users" className={linkCls("/dashboard/users")}>
                    <GoShieldLock size={14} className="text-inherit" />
                    <span className="whitespace-nowrap text-inherit">Users</span>
                  </Link>
                </li>
                <li className="mb-[4px]">
                  <Link href="/dashboard/roles-permissions" className={linkCls("/dashboard/roles-permissions")}>
                    <TbJumpRope size={14} className="text-inherit" />
                    <span className="whitespace-nowrap text-inherit">Roles & Permissions</span>
                  </Link>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
