// loader.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Loader.css";

const Loader = ({ delay = 3000 }) => {
    const navigate = useNavigate();
    const [isPastTime, setIsPastTime] = useState(false);

    //TU ZMIEŃ GODZINĘ I MINUTĘ NA KTÓRĄ MA SIĘ OTWORZYĆ CHAT
    const godzina = 13;
    const minuta = 10;

    useEffect(() => {
        const checkTime = () => {
            const currentTime = new Date();
            const currentHour = currentTime.getHours();
            const currentMinute = currentTime.getMinutes();


            if (currentHour === godzina && currentMinute === minuta) {
                navigate("/MainView");
            } else if (currentHour > godzina || (currentHour === godzina && currentMinute > minuta)) {
                setIsPastTime(true);
            }
        };

        const timer = setInterval(checkTime, 1000);

        return () => clearInterval(timer);
    }, [navigate]);

    return (
        <div className="loader">
            {!isPastTime && (
                <>
                    <div className="spinner"></div>
                    <div className="loader-text">Ładowanie...</div>
                </>
            )}
            <div className="loader-text">
                {isPastTime
                    ? `Chat został otwarty o ${godzina}:${minuta < 10 ? `0${minuta}` : minuta}`
                    : `Chat zostanie otwarty o ${godzina}:${minuta < 10 ? `0${minuta}` : minuta}`}
            </div>
        </div>
    );
};

export default Loader;