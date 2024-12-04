// loader.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import "./Loader.css";

const Loader = ({ delay = 3000 }) => {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate("/MainView");
        }, delay);

        return () => clearTimeout(timer);
    }, [delay, navigate]);

    return (
        <div className="loader">
            <div className="spinner"></div>
            <div className="loader-text">Ładowanie...</div>
        </div>
    );
};

export default Loader;