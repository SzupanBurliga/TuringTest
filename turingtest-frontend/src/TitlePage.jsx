import React from "react";
import { useNavigate } from "react-router-dom";


function TitlePage() {
    const navigate = useNavigate();

    return (
        <div className="title-page">
            <div className="title-content">
                <h1>Are You Human?</h1>
                <h3>Chat with someone for two minutes,
                    and try to figure out if it was a fellow human or an AI bot.</h3>
                <h3>Think you can tell the difference?</h3>
                <button onClick={() => navigate("/MainView")}>Go to Chat</button>
                <button onClick={() => navigate("/TuringTest")}>About Turing Test</button>
            </div>
        </div>

    );
}

export default TitlePage;
