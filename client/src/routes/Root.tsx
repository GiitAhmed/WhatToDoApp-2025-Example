import { Outlet } from "react-router-dom";
import Navigation from "../components/Navigation";

const Root = () => {
  return (
    <>
      <div className="root-container">
        <Navigation />

        <div className="content-container">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default Root;
