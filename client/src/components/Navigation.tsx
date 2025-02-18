import { Link } from "react-router-dom";

const Navigation = () => {
  return (
    <>
      <div className="navigation">
        <h1>WhatToDoApp</h1>
        <div className="links">
          <Link to="/">Dashboard</Link>
          <Link to="/tasks">Tasks</Link>
        </div>
      </div>
    </>
  );
};

export default Navigation;
