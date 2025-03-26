import { useState } from "react";
import { Link } from "react-router-dom";
import "./StartScreen.css";

function StartScreen() {
    const [selectedMode, setSelectedMode] = useState("standard");

    const handleNewGame = () => {
        // Clear localStorage for a fresh start
        localStorage.removeItem("gameState");
        console.log("Local storage cleared for new game");
    };

    return (
        <div className="start-screen">
            <h1>Edutopia</h1>
            <h2>Learn & Build</h2>
            
            <div className="mode-selection">
                <h3>Select Game Mode:</h3>
                <div className="mode-buttons">
                    <button 
                        className={`mode-button ${selectedMode === 'standard' ? 'selected' : ''}`}
                        onClick={() => setSelectedMode('standard')}
                    >
                        Standard Mode
                    </button>
                    <button 
                        className={`mode-button ${selectedMode === 'challenging' ? 'selected' : ''}`}
                        onClick={() => setSelectedMode('challenging')}
                    >
                        Challenging Mode
                    </button>
                    <button 
                        className={`mode-button ${selectedMode === 'quiz' ? 'selected' : ''}`}
                        onClick={() => setSelectedMode('quiz')}
                    >
                        Quiz Mode
                    </button>
                </div>
            </div>
            
            <div className="mode-description">
                {selectedMode === 'standard' && (
                    <p>Standard Mode: Start with easy questions and gradually progress to harder ones.</p>
                )}
                {selectedMode === 'challenging' && (
                    <p>Challenging Mode: Start with medium difficulty questions and advance faster.</p>
                )}
                {selectedMode === 'quiz' && (
                    <p>Quiz Mode: Focus only on questions without gameplay.</p>
                )}
            </div>
            
            <div className="start-buttons">
                <Link to={selectedMode === 'quiz' ? `/quiz?mode=${selectedMode}` : `/game?mode=${selectedMode}`} onClick={handleNewGame}>
                    <button className="new-game-button">New Game</button>
                </Link>
                <Link to={selectedMode === 'quiz' ? `/quiz` : `/game`}>
                    <button className="continue-button">Continue</button>
                </Link>
                <Link to="/instructions">
                    <button className="instructions-button">Instructions</button>
                </Link>
            </div>
        </div>
    );
}

export default StartScreen;