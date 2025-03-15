import { useState } from "react";
import { Link } from "react-router-dom";

const StartScreen = () => {
  const [playerName, setPlayerName] = useState("");
  
  return (
    <div className="start-screen">
      <div className="start-content">
        <h1 className="game-title">EDUTOPIA</h1>
        
        <p className="game-description">
          Build your ideal society by expanding your territory, 
          gathering resources, and testing your knowledge of 
          AI, Cloud Computing, Data Science and Cyber Security.
        </p>
        
        <div className="name-input">
          <label htmlFor="player-name">Enter Your Name:</label>
          <input 
            type="text" 
            id="player-name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Player Name"
          />
        </div>
        
        <div className="start-buttons">
          <Link to="/game">
            <button className="start-button">
              Start Game
            </button>
          </Link>
          
          <Link to="/instructions">
            <button className="instructions-button">
              How to Play
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

// This export statement is critical
export default StartScreen;