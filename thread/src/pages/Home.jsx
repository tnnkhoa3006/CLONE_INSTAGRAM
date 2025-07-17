import React, { useEffect, useState } from "react";
import LeftSide from "../components/home.component/leftSide";
import RightSide from "../components/home.component/rightSide";
import CenterSide from "../components/home.component/centerSide";
import { useSelector } from "react-redux"; // Thêm useSelector để lấy state

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lấy dữ liệu từ Redux store
  const { user, following } = useSelector((store) => store.auth); // Giả sử user và following ở đây
  const { posts } = useSelector((store) => store.post);

  useEffect(() => {
    const checkData = () => {
      try {
        // Kiểm tra xem dữ liệu đã sẵn sàng chưa
        if (!user || !posts) {
          throw new Error("Data not loaded");
        }
        setLoading(false);
      } catch (error) {
        console.error("home error ", error);
        setError(error.message);
        setLoading(false);
      }
    };
    checkData();
  }, [user, posts]); // Theo dõi sự thay đổi của user và posts

  // Early returns
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div>Error: {error}</div>
      </div>
    );
  }

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