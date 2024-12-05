// loader.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Loader.css";

const Loader = ({ delay = 3000 }) => {
    const navigate = useNavigate();
    const [isPastTime, setIsPastTime] = useState(false);

    useEffect(() => {
        const checkTime = () => {
            const currentTime = new Date();
            const currentHour = currentTime.getHours();
            const currentMinute = currentTime.getMinutes();

            if (currentHour === 10 && currentMinute === 0) {
                navigate("/MainView");
            } else if (currentHour > 10 || (currentHour === 10 && currentMinute > 7)) {
                setIsPastTime(true);
            }
        };

        const timer = setInterval(checkTime, 1000);

        return () => clearInterval(timer);
    }, [navigate]);

    return (
        <div className="loader">
            <div className="spinner"></div>
            <div className="loader-text">Ładowanie...</div>
            <div className="loader-text">
                {isPastTime ? "Chat został otwarty o 10:00" : "Chat zostanie otwarty o 10:00"}
            </div>
        </div>
    );
};

export default Loader;