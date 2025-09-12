import React from "react";

const Content = () => {
  return (
    <>
      <div className="gap-4 mb-[.5rem] items-center flex justify-between flex-wrap">
        <div className="mb-[1rem]">
          <h1 className="font-bold !mb-[.25rem] text-[1.75rem] text-[#212b36]">Welcome, Admin</h1>
          <p className="font-medium text-sm text-[#646b72] leading-[1.5]">
            You have <span className="text-[#0076f9]">200+</span> Orders, today
          </p>
        </div>
      </div>
    </>
  );
};

export default Content;
