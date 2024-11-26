import React from "react";
import "./App.css";
import MainView from "./MainView";
import TitlePage from "./TitlePage";
import TouringTest from "./TuringTest";
import PassPage from "./PassPage";
import Results from "./Results";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<PassPage />} />
          <Route path="/TitlePage" element={<TitlePage />} />
          <Route path="/MainView" element={<MainView />} />
          <Route path="/TuringTest" element={<TouringTest />} />
          <Route path="/Results" element={<Results />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
