import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Results.css";

function Results() {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3001/api/results");
      const data = await response.json();
      setResults(data.reverse());
      setError(null);
    } catch (err) {
      setError("Nie udało się pobrać wyników");
      console.error("Error fetching results:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const calculateStats = () => {
    if (results.length === 0) return { total: 0, correct: 0, percentage: 0 };

    const correct = results.filter((r) => r.isCorrect).length;
    return {
      total: results.length,
      correct: correct,
      percentage: ((correct / results.length) * 100).toFixed(1),
    };
  };

  const stats = calculateStats();

  if (loading) return <div className="loading">Ładowanie wyników...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="results-page">
      <div className="results-header">
        <h1>Historia Testów Turinga</h1>
        <div className="stats-summary">
          <p>Całkowita liczba testów: {stats.total}</p>
          <p>Poprawne odpowiedzi: {stats.correct}</p>
          <p>Skuteczność: {stats.percentage}%</p>
        </div>
        <button onClick={() => navigate("/TitlePage")} className="back-button">
          Powrót do strony głównej
        </button>
      </div>

      <div className="results-container">
        <div className="results-list">
          {results.map((result, index) => (
            <div
              key={index}
              className={`result-item ${
                selectedChat === index ? "selected" : ""
              }`}
              onClick={() => setSelectedChat(index)}
            ></div>
          ))}
        </div>

        {selectedChat !== null && (
          <div className="chat-history">
            <h3>Historia czatu</h3>
            <div className="chat-messages">
              {results[selectedChat].chatHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`chat-message ${
                    msg.user === "system" ? "system-message" : ""
                  }`}
                >
                  <strong>{msg.user}:</strong> {msg.message}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Results;
