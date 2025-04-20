import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./StartScreen.css";

function StartScreen() {
    const navigate = useNavigate();
    const [selectedMode, setSelectedMode] = useState("standard");
    const [isResearchMode, setIsResearchMode] = useState(
        localStorage.getItem("researchMode") === "true"
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
            // Always set to 10 minutes (no options)
            localStorage.setItem("sessionDuration", "10");
        } else {
            localStorage.removeItem("researchMode");
            localStorage.removeItem("sessionDuration");
        }
    };
    
    // Navigate to instructions with current path as state
    const goToInstructions = () => {
        navigate("/instructions", { state: { from: "/" } });
    };

    // Common button styles
    const buttonStyle = {
        padding: '12px 24px',
        fontSize: '16px',
        fontWeight: 'bold',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        margin: '0 10px',
        minWidth: '160px'
    };

    // Style for game mode buttons
    const modeButtonStyle = (isSelected) => ({
        padding: '10px 20px',
        fontSize: '15px',
        backgroundColor: isSelected ? '#2c5282' : '#334155',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        margin: '0 6px',
        boxShadow: isSelected ? '0 0 0 2px #63b3ed, 0 4px 6px rgba(0, 0, 0, 0.1)' : '0 4px 6px rgba(0, 0, 0, 0.1)',
        transform: isSelected ? 'translateY(-2px)' : 'none'
    });

    return (
        <div className="start-screen">
            <h1>Edutopia</h1>
            <h2>Learn & Build</h2>

            <div className="mode-selection">
                <h3>Select Game Mode:</h3>
                <div className="mode-buttons" style={{
                    display: 'flex',
                    justifyContent: 'center',
                    margin: '15px 0'
                }}>
                    <button
                        style={modeButtonStyle(selectedMode === 'standard')}
                        onClick={() => setSelectedMode('standard')}
                    >
                        Game Mode 1
                    </button>
                    <button
                        style={modeButtonStyle(selectedMode === 'challenging')}
                        onClick={() => setSelectedMode('challenging')}
                    >
                        Game Mode 2
                    </button>
                    <button
                        style={modeButtonStyle(selectedMode === 'quiz')}
                        onClick={() => setSelectedMode('quiz')}
                    >
                        Game Mode 3
                    </button>
                </div>
            </div>

            <div className="mode-description">
                <p>You have selected a game mode. Each mode offers a unique gameplay experience.</p>
            </div>

            <div className="research-toggle" style={{ 
                marginTop: '20px',
                backgroundColor: isResearchMode ? 'rgba(44, 82, 130, 0.2)' : 'transparent',
                padding: '10px',
                borderRadius: '8px',
                transition: 'background-color 0.3s ease'
            }}>
                <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontWeight: isResearchMode ? 'bold' : 'normal',
                    color: isResearchMode ? '#2c5282' : 'inherit' 
                }}>
                    <input
                        type="checkbox"
                        checked={isResearchMode}
                        onChange={(e) => setIsResearchMode(e.target.checked)}
                        style={{ 
                            marginRight: '8px',
                            width: '18px',
                            height: '18px'
                        }}
                    />
                    Research Mode (10 Minutes)
                </label>
            </div>

            <div className="start-buttons" style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '30px',
                flexWrap: 'wrap',
                gap: '15px'
            }}>
                <Link
                    to={
                        isResearchMode
                            ? `/enter-name?destination=${selectedMode === 'quiz' ? 'quiz' : 'game'}&mode=${selectedMode}`
                            : (selectedMode === 'quiz'
                                ? `/quiz?mode=${selectedMode}`
                                : `/game?mode=${selectedMode}`)
                    }
                    onClick={handleNewGame}
                    style={{ textDecoration: 'none' }}
                >
                    <button style={{
                        ...buttonStyle,
                        backgroundColor: '#27ae60',
                        color: 'white',
                        position: 'relative',
                        overflow: 'hidden',
                        zIndex: 1,
                    }}>
                        Start Game
                    </button>
                </Link>

                <button 
                    style={{
                        ...buttonStyle,
                        backgroundColor: '#718096',
                        color: 'white'
                    }}
                    onClick={goToInstructions}
                >
                    Instructions
                </button>
            </div>
        </div>
    );
}

export default StartScreen;