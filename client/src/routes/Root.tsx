import { Outlet } from "react-router-dom";
import Navigation from "../components/Navigation";

const Root = () => {
  return (
    <>
      <div className="flex h-screen">
        <Navigation />

        <div className="w-3/4 p-6">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default Root;
