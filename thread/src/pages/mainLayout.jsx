import { Outlet } from "react-router-dom";
import LeftSide from "../components/home.component/leftSide"

const MainLayout = () => {
    return (
        <>
            <div className="fixed left-0 top-0 h-screen w-[240px] bg-black text-white z-20">
                <LeftSide />
            </div>
            <div>
                <Outlet />
            </div>
        </>
    )
}

export default MainLayout
