import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const StartScreen = () => {
  const [playerName, setPlayerName] = useState("");
  const [gameMode, setGameMode] = useState("standard");
  const navigate = useNavigate();
  
  const handleStartGame = () => {
    // Clear localStorage to start fresh
    localStorage.removeItem("gameState");
    console.log("Starting new game - cleared saved state");
    
    // Force a complete reload before navigating to ensure clean state
    // This is more reliable than just navigating
    window.location.href = `/game?mode=${gameMode}&t=${Date.now()}`;
    
    // The navigate won't be reached due to the page reload
    // navigate(`/game?mode=${gameMode}`);
  };
  
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
        
        <div className="game-mode-selection">
          <label>Select Game Mode:</label>
          <div className="mode-options">
            <label className="mode-option">
              <input 
                type="radio" 
                name="gameMode" 
                value="standard" 
                checked={gameMode === "standard"}
                onChange={() => setGameMode("standard")}
              />
              <span>Standard Mode</span>
              <p className="mode-description">Resources from tiles and quizzes</p>
            </label>
            
            <label className="mode-option">
              <input 
                type="radio" 
                name="gameMode" 
                value="quiz" 
                checked={gameMode === "quiz"}
                onChange={() => setGameMode("quiz")}
              />
              <span>Quiz Mode</span>
              <p className="mode-description">Resources only from quiz answers</p>
            </label>
            
            <label className="mode-option">
              <input 
                type="radio" 
                name="gameMode" 
                value="reduced" 
                checked={gameMode === "reduced"}
                onChange={() => setGameMode("reduced")}
              />
              <span>Challenge Mode</span>
              <p className="mode-description">Reduced resources from tiles</p>
            </label>
          </div>
        </div>
        
        <div className="start-buttons">
          <button 
            className="start-button" 
            onClick={handleStartGame}
          >
            Start Game
          </button>
          
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

export default StartScreen;