import React, { useEffect, useState } from "react";
import LeftSide from "../components/home.component/leftSide";
import RightSide from "../components/home.component/rightSide";
import CenterSide from "../components/home.component/centerSide";
import { useSelector } from "react-redux"; // Thêm useSelector để lấy state

const Home = () => {
  return (
    <div className="flex flex-col md:flex-row h-screen bg-black text-white overflow-hidden overflow-y-auto">
      {/* Left Sidebar */}
      <div className="w-[240px] hidden md:block">
        <LeftSide />
      </div>
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row mx-auto w-full max-w-[100%] md:max-w-5xl justify-center gap-2 md:gap-4 p-2 md:p-0 md:ml-[-120px]">

        <div className="w-full md:max-w-2xl">
          <CenterSide />
        </div>
        <div className="w-[360px] hidden md:block">
          <RightSide />
        </div>
      </div>
    </div>
  );
};

export default Home;