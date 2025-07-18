import { Outlet } from 'react-router-dom';
import LeftSide from '../components/home.component/leftSide';

const MainLayout = () => {
  return (
    <>
      {/* Left Sidebar (Desktop) and Bottom Navigation (Mobile) */}
      <div className="fixed left-0 top-0 h-screen w-[240px] bg-black text-white z-20 md:block hidden">
        <LeftSide />
      </div>
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-black text-white z-20">
        <LeftSide />
      </div>
      {/* Main Content Area */}
      <div className="ml-0 md:ml-[240px] flex-1 min-h-screen bg-black text-white">
        <Outlet />
      </div>
    </>
  );
};

export default MainLayout;