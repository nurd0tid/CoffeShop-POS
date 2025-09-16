"use client";
import Image from "next/image";
import { AiOutlineTransaction } from "react-icons/ai";
import { GrPowerReset } from "react-icons/gr";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { IoCartOutline } from "react-icons/io5";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Link from "next/link";
import { useRef, useState } from "react";
import categories from "@/data/categories.json";
import { MenuItem } from "@/types/menu";
import InnerContent from "./InnerContent";
import Sidebar from "./Sidebar";

export default function PosContent() {
  const sliderRef = useRef<Slider | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState(categories[0].id);
  const [selectedMenus, setSelectedMenus] = useState<MenuItem[]>([]);

  const handleDeleteMenu = (id: string) => {
    setSelectedMenus((prev) => prev.filter((menu) => menu.id !== id));
  };

  const handleClearMenus = () => {
    setSelectedMenus([]);
  };

  return (
    <>
      <div className="[@media(max-width:991.96)]:m-0 [@media(max-width:991.96)]:p-[65px_0_0] relative left-0 transition-all duration-[.2s] ease-in !ml-0 m-[0_0_0_252px] p-[65px_0_0]">
        <div className="[@media(max-width:991.98)]:flex [@media(max-width:991.98)]:flex-col [@media(max-width:991.98)]:flex-wrap [@media(max-width:991.96)]:p-[15px] min-h-[calc(100vh-105px)] !p-0">
          <div className="grid grid-cols-12 items-start">
            <div className="col-span-12 lg:col-span-7 xl:col-span-8">
              <div className="relative bg-[#f9fafb] p-6 border-collapse !pb-0 [@media(min-width:992px)]:h-[calc(100vh-65px)] [@media(min-width:992px)]:overflow-y-auto ">
                {/* Buttons */}
                <div className="rounded-[10px] p-[10px_10px_0px] mb-[1.5rem] bg-white transition-all duration-[.5s] ease-in-out relative border border-[#e6eaed] shadow-none text-inherit">
                  <div className="items-center flex-wrap flex">
                    <button className="m-[0_10px_10px_0] bg-[#0e9384] border border-[#0e9384] text-white shadow-[0_4px_20px_rgba(14,147,132,.15)] p-[7px_12px] text-[13px] rounded-[5px] font-semibold transition-all duration-[.5s] flex items-center hover:bg-[#0c7a6f] hover:border-[#0c7a6f] cursor-pointer gap-2">
                      <IoCartOutline className="leading-[1]" /> View Orders
                    </button>
                    <button className="m-[0_10px_10px_0] bg-[#3538CD] border border-[#3538CD] text-white shadow-[0_4px_20px_rgba(14,147,132,.15)] p-[7px_12px] text-[13px] rounded-[5px] font-semibold transition-all duration-[.5s] flex items-center hover:bg-[#2c2fb2] hover:border-[#2c2fb2] cursor-pointer gap-2">
                      <GrPowerReset className="leading-[1]" /> Reset
                    </button>
                    <button className="m-[0_10px_10px_0] bg-[#155EEF] border border-[#155EEF] text-white shadow-[0_4px_20px_rgba(14,147,132,.15)] p-[7px_12px] text-[13px] rounded-[5px] font-semibold transition-all duration-[.5s] flex items-center hover:bg-[#0e50d2] hover:border-[#0e50d2]  cursor-pointer gap-2">
                      <AiOutlineTransaction className="leading-[1]" /> Transaction
                    </button>
                  </div>
                </div>

                {/* Title + Arrows */}
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[1.125rem] text-[#212b36] font-semibold">Categories</h4>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => sliderRef.current?.slickPrev()}
                      className="flex items-center justify-center bg-white w-7 h-7 rounded-[28px] border border-[#e6eaed] hover:bg-[#0076f9] text-xs font-semibold text-[#092c4c] cursor-pointer"
                      aria-label="Previous"
                    >
                      <IoIosArrowBack />
                    </button>
                    <button
                      onClick={() => sliderRef.current?.slickNext()}
                      className="flex items-center justify-center bg-white w-7 h-7 rounded-[28px] border border-[#e6eaed] hover:bg-[#0076f9] text-xs font-semibold text-[#092c4c] cursor-pointer"
                      aria-label="Next"
                    >
                      <IoIosArrowForward />
                    </button>
                  </div>
                </div>

                <Slider
                  ref={sliderRef}
                  dots={false}
                  infinite={categories.length > 6}
                  speed={500}
                  slidesToShow={Math.min(6, categories.length)}
                  slidesToScroll={1}
                  arrows={false}
                  swipe
                  draggable
                  swipeToSlide
                  touchThreshold={8}
                  waitForAnimate={false}
                  className="mb-6 pb-6 border-b border-[#e6eaed]"
                  responsive={[
                    { breakpoint: 1024, settings: { slidesToShow: 6, slidesToScroll: 1 } },
                    { breakpoint: 640, settings: { slidesToShow: 5, slidesToScroll: 1 } },
                    { breakpoint: 480, settings: { slidesToShow: 2, slidesToScroll: 1 } },
                    { breakpoint: 360, settings: { slidesToShow: 1, slidesToScroll: 1 } },
                  ]}
                >
                  {categories.map((category, index) => (
                    <div key={index} className="pr-[10px]">
                      <div
                        className={`group w-full bg-white inline-block p-[15px_0] text-center cursor-pointer border rounded-[10px] shadow-[0_4px_54px_0_rgba(224,224,224,.25)] transition-colors duration-300 ease-in-out max-h-[130px] max-w-[185px] ${
                          activeCategoryId === category.id ? "border-[#0076f9]" : "border-[#e6eaed] hover:border-[#0076f9]"
                        }`}
                        onClick={() => setActiveCategoryId(category.id)}
                      >
                        <Link href="#" className="block">
                          <Image
                            src={`/${category.image}`}
                            alt={category.name}
                            width={40}
                            height={40}
                            className="mx-auto block transition-transform duration-300 ease-in-out group-hover:-translate-y-1 group-hover:scale-[1.05]"
                          />
                        </Link>
                        <h6 className="mt-[10px] mb-[5px]">
                          <Link
                            href="#"
                            className={`font-semibold transition-colors duration-300 group-hover:text-[#0076f9] ${
                              activeCategoryId === category.id ? "text-[#0076f9]" : "text-[#092c4c]"
                            }`}
                          >
                            {category.name}
                          </Link>
                        </h6>
                        <span className="text-[#667085]">{category.count} Items</span>
                      </div>
                    </div>
                  ))}
                </Slider>

                {/* Content */}
                <InnerContent activeCategoryId={activeCategoryId} onSelectMenus={setSelectedMenus} />
              </div>
            </div>

            <Sidebar selectedMenus={selectedMenus} onDeleteMenu={handleDeleteMenu} onClearMenus={handleClearMenus} />
          </div>
        </div>
      </div>
    </>
  );
}
