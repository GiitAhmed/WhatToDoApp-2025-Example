import { Routes, Route, BrowserRouter } from "react-router-dom";
import Dashboard from "./routes/Dashboard";
import ErrorPage from "./routes/ErrorPage";
import Root from "./routes/Root";
import Tasks from "./routes/Tasks";

const App = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Root />}>
            <Route index element={<Dashboard />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="*" element={<ErrorPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
