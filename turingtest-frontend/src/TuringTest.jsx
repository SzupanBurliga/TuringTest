import React from "react";
import { useNavigate } from "react-router-dom";
import "./turing.css";

function TuringTest() {
  const navigate = useNavigate();
  return (

      <div className="MainTuring">

          <h1>O Teście Turinga</h1>
          <h3>
              Test Turinga to koncepcja wprowadzona przez brytyjskiego matematyka i
              informatyka Alana Turinga w 1950 roku, mająca na celu ocenę zdolności maszyny
              do wykazywania inteligentnego zachowania, które nie różni się od zachowania człowieka.
          </h3>
          <h2>Jak to działa?</h2>
          <img src="/fota.jpg" alt="Zdjęcie" />
          <h3>
              Test przeprowadzany jest w formie rozmowy: sędzia (człowiek) angażuje się w wymianę tekstową zarówno z maszyną
              (zwykle sztuczną inteligencją), jak i z innym człowiekiem, nie wiedząc, kto jest kim.
              Jeśli sędzia nie jest w stanie wiarygodnie odróżnić człowieka od maszyny wyłącznie na podstawie ich odpowiedzi,
              uważa się, że maszyna "zdała" test Turinga.
          </h3>

          <h3>
              Test Turinga stał się podstawową ideą w dziedzinie sztucznej inteligencji (AI),
              reprezentując jedną z pierwszych formalnych prób zbadania inteligencji maszyn.
              Test nie polega na bezpośrednim mierzeniu inteligencji, lecz na ocenie zdolności maszyny
              do przekonującego naśladowania ludzkich odpowiedzi. Chociaż niektóre systemy AI
              dziś radzą sobie dobrze w ograniczonych zadaniach konwersacyjnych, Test Turinga pozostaje
              wysokim wyzwaniem, szczególnie pod względem osiągnięcia subtelnych, kontekstowo odpowiednich
              odpowiedzi na różnorodne tematy.
          </h3>
          <button onClick={() => navigate("/TitlePage")}>Wróć</button>
      </div>
  );
}
export default TuringTest;
