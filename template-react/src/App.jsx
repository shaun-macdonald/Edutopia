import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from "react-router-dom";
import { PhaserGame } from "./game/PhaserGame.jsx";
import QuizPage from "./QuizPage.jsx";
import StartScreen from "./StartScreen.jsx";
import InstructionsPage from "./InstructionsPage.jsx";
import "./StartScreen.css";

function App() {
    const [resources, setResources] = useState({ food: 0, wood: 0, metal: 0, tech: 0 });

    // 🌟 Load saved resources when the component mounts
    useEffect(() => {
        const savedState = localStorage.getItem("gameState");
        if (savedState) {
            const { resources } = JSON.parse(savedState);
            if (resources) {
                setResources(resources);
            }
        }

        window.updateReactResources = (newResources) => {
            setResources({ ...newResources });

            // 🌟 Save the updated resources to localStorage
            const currentState = localStorage.getItem("gameState");
            const parsedState = currentState ? JSON.parse(currentState) : { ownedTiles: [] };
            localStorage.setItem("gameState", JSON.stringify({ ...parsedState, resources: newResources }));
        };

        return () => {
            window.updateReactResources = null; // Clean up when component unmounts
        };
    }, []);

    const updateTech = (points) => {
        setResources(prevResources => {
            const newTech = prevResources.tech + points;
            console.log(`Earned ${points} Tech! New total: ${newTech}`);

            // 🌟 Update localStorage
            const currentState = localStorage.getItem("gameState");
            const parsedState = currentState ? JSON.parse(currentState) : { ownedTiles: [] };
            localStorage.setItem("gameState", JSON.stringify({ ...parsedState, resources: { ...prevResources, tech: newTech } }));

            return { ...prevResources, tech: newTech };
        });
    };

    // Add this to your App.jsx in the handleEndTurn function:

const handleEndTurn = () => {
    if (!window.phaserGame || !window.phaserGame.scene || !window.phaserGame.scene.scenes[0]) {
        console.error("Phaser game or scenes not initialized properly.");
        return;
    }

    const gameScene = window.phaserGame.scene.scenes[0];

    if (!gameScene.generateResources) {
        console.error("generateResources() function is missing in Game.js!");
        return;
    }

    // IMPORTANT: Sync React's tech points to the game scene before generating resources
    if (gameScene.resources) {
        gameScene.resources.tech = resources.tech;
    }

    gameScene.generateResources();
};

    // Define the game screen component
const GameScreen = () => (
    <div className="game-screen">
      <div className="game-header">
        <h1 className="game-title-small">EDUTOPIA</h1>
        <nav className="game-nav">
          <Link to="/"><button className="menu-button">🏠 Main Menu</button></Link>
          <Link to="/quiz"><button className="quiz-button">🧠 Take Quiz</button></Link>
          <button className="end-turn-button" onClick={handleEndTurn}>⏩ End Turn</button>
        </nav>
      </div>
      
      <div className="resource-bar">
        <span className="resource food">🍞 Food: {resources.food}</span>
        <span className="resource wood">🌲 Wood: {resources.wood}</span>
        <span className="resource metal">🏗 Metal: {resources.metal}</span>
        <span className="resource tech">🧠 Tech: {resources.tech}</span>
      </div>
      
      <PhaserGame />
      
      <div className="game-footer">
        <p>Build your EDUTOPIA by claiming tiles and gathering resources!</p>
      </div>
    </div>
  );

    return (
        <Router>
            <div id="app">
                <Routes>
                    {/* Make StartScreen the landing page */}
                    <Route path="/" element={<StartScreen />} />
                    
                    {/* Move the game to /game */}
                    <Route path="/game" element={<GameScreen />} />
                    
                    {/* Other routes */}
                    <Route path="/instructions" element={<InstructionsPage />} />
                    <Route path="/quiz" element={
                        <>
                            <Link to="/game"><button className="back-to-game">↩ Back to Game</button></Link>
                            <QuizPage updateTech={updateTech} />
                        </>
                    } />
                    
                    {/* For backward compatibility, redirect /start to / */}
                    <Route path="/start" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;