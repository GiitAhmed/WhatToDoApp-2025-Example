import { Link } from "react-router-dom";

const Navigation = () => {
  return (
    <>
      <div className="bg-neutral p-4 w-60">
        <h1 className="text-3xl font-bold mb-8">WhatToDoApp</h1>
        <ul className="menu flex gap-4 w-auto">
          <li>
            <Link className="btn btn-lg" to="/">
              Dashboard
            </Link>
          </li>
          <li>
            <Link className="btn btn-lg " to="/tasks">
              Tasks
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Navigation;
