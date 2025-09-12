"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { IoMailOutline } from "react-icons/io5";

const ForgotPasswordContent = () => {
  return (
    <div className="w-1/2 bg-[hsla(0,0%,100%,.8)] backdrop-blur-[17px] h-screen p-[24px] overflow-auto flex items-center justify-center flex-wrap [@media(max-width:991.96px)]:w-full">
      <form className="w-[70%] [@media(max-width:991.96px)]:w-full">
        <div>
          <div className="block max-w-[150px] m-auto">
            <Image src="/logo.png" width={80} height={80} alt="Bagi Kopi Idonesia" className="max-w-full h-auto mb-[25px]" />
          </div>
          <div className="m-[0_0_24px]">
            <h3 className="text-[24px] font-bold m-[0_0_10px] text-black">Forgot password?</h3>
            <h4 className="text-[#092c4c] leading-[1.4] text-[1rem]">
              If you forgot your password, well, then we’ll email you instructions to reset your password.
            </h4>
          </div>
          <div className="mb-4">
            <label className="text-sm font-medium text-[#212b36]">
              Email <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex flex-nowrap items-stretch w-full">
              <input className="relative grow shrink basis-auto w-[1%} min-w-0 border border-[#e6eaed] text-[#212b36] bg-white text-[.875rem] leading-[1.6] rounded-[.35rem] p-[.45rem_.85rem] border-r-0 focus:ring-0 focus:outline-none" />
              <span className="ml-[calc(-1*1px)] bg-white p-[2px_10px] border-[#e6eaed] flex items-center text-[1rem] leading-[1.5] text-[#212529] text-center whitespace-nowrap">
                <IoMailOutline size={16} />
              </span>
            </div>
          </div>
          <div className="mb-[15px]">
            <button className="bg-[#155eef] border border-[#155eef] text-white shadow-[0_4px_20px_rgba(21,94,239,.15)] rounded-[5px] p-[.4rem_.85rem] text-[.85rem] transition-all duration-[.5s] font-semibold w-full hover:bg-[#0e50d2] hover:border-[#0e50d2] hover:shdaow-[0_3px_10px_rgba(21,94,239,.5)] cursor-pointer">
              Forgot Password
            </button>
          </div>
          <div className="mb-[23px] text-center">
            <h4 className="text-[15px] text-[#092c4c]">
              Return to{" "}
              <Link href="/auth/signin" className="text-sm font-bold">
                login
              </Link>
            </h4>
          </div>
          <div className="mb-6 mt-[50px] flex items-center justify-center">
            <p className="text-sm text-[#092c4c]">Copyright © {new Date().getFullYear()} BagiKopi</p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ForgotPasswordContent;
