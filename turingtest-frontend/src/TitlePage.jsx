import React from "react";
import { useNavigate } from "react-router-dom";

function TitlePage() {
  const navigate = useNavigate();

  return (
    <div className="title-page">
      <div className="title-content">
        <h1>Are You Human?</h1>
        <h3>
          Porozmawiaj z kimś przez dwie minuty i spróbuj ustalić, czy był to
          inny człowiek, czy bot AI.
        </h3>
        <h3>Myślisz, że potrafisz to odróżnić?</h3>
        <button onClick={() => navigate("/MainView")}>Przejdź do czatu</button>
        <button onClick={() => navigate("/TuringTest")}>
          O Teście Turinga
        </button>
        <button onClick={() => navigate("/Results")}>Zobacz Wyniki</button>
      </div>
    </div>
  );
}

export default TitlePage;
