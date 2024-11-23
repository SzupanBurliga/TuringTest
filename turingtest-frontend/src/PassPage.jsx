import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PassPage.css";

const PasswordPanel = () => {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const correctPassword = "ChatToZrytek";

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password === correctPassword) {
            navigate("/TitlePage");
        } else {
            setError("Niepoprawne hasło. Spróbuj ponownie ;)");
        }
    };

    return (
        <div className="password-panel">
            <div className="password-container">
                <h2>Wprowadź hasło</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Podane hasło"
                        className="password-input"
                    />
                    <button type="submit" className="submit-button">
                        Potwierdź
                    </button>
                </form>
                {error && <p className="error-message">{error}</p>}
            </div>
        </div>
    );
};

export default PasswordPanel;