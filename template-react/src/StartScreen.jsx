import { useState } from "react";
import { Link } from "react-router-dom";
import "./StartScreen.css";
import { initTimer } from './TimerDisplay';

function StartScreen() {
    const [selectedMode, setSelectedMode] = useState("standard");

    const [isResearchMode, setIsResearchMode] = useState(
        localStorage.getItem("researchMode") === "true"
    );
    const [sessionDuration, setSessionDuration] = useState(
        parseInt(localStorage.getItem("sessionDuration") || "10")
    );

    const handleNewGame = () => {
        localStorage.removeItem("gameState");
        localStorage.removeItem("userName");
        localStorage.removeItem("questionTimings");
        localStorage.removeItem("dataExported");
        localStorage.removeItem("sessionCompleted");
        console.log("Local storage cleared for new game");

        if (isResearchMode) {
            localStorage.setItem("researchMode", "true");
            localStorage.setItem("sessionDuration", sessionDuration.toString());
        } else {
            localStorage.removeItem("researchMode");
            localStorage.removeItem("sessionDuration");
        }
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
                        Game Mode 1
                    </button>
                    <button
                        className={`mode-button ${selectedMode === 'challenging' ? 'selected' : ''}`}
                        onClick={() => setSelectedMode('challenging')}
                    >
                        Game Mode 2
                    </button>
                    <button
                        className={`mode-button ${selectedMode === 'quiz' ? 'selected' : ''}`}
                        onClick={() => setSelectedMode('quiz')}
                    >
                        Game Mode 3
                    </button>
                </div>
            </div>

            <div className="mode-description">
                <p>You have selected a game mode. Each mode offers a unique gameplay experience.</p>
            </div>

            <div className="research-toggle" style={{ marginTop: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <input
                        type="checkbox"
                        checked={isResearchMode}
                        onChange={(e) => setIsResearchMode(e.target.checked)}
                        style={{ marginRight: '8px' }}
                    />
                    Research Mode (10 Minutes)
                </label>
            </div>

            {isResearchMode && (
                <div className="duration-selection" style={{ marginTop: '15px' }}>
                    <h3>Select Session Duration:</h3>
                    <div className="duration-buttons">
                        <button
                            className={`duration-button ${sessionDuration === 10 ? 'selected' : ''}`}
                            onClick={() => setSessionDuration(10)}
                            style={{
                                padding: '8px 15px',
                                backgroundColor: sessionDuration === 10 ? '#4a8' : '#ddd',
                                marginRight: '10px',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            10 Minutes
                        </button>
                        <button
                            className={`duration-button ${sessionDuration === 15 ? 'selected' : ''}`}
                            onClick={() => setSessionDuration(15)}
                            style={{
                                padding: '8px 15px',
                                backgroundColor: sessionDuration === 15 ? '#4a8' : '#ddd',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            15 Minutes
                        </button>
                    </div>
                </div>
            )}

            <div className="start-buttons">
                <Link
                    to={
                        isResearchMode
                            ? `/enter-name?destination=${selectedMode === 'quiz' ? 'quiz' : 'game'}&mode=${selectedMode}`
                            : (selectedMode === 'quiz'
                                ? `/quiz?mode=${selectedMode}`
                                : `/game?mode=${selectedMode}`)
                    }
                    onClick={handleNewGame}
                >
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
