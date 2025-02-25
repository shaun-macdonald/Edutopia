import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { PhaserGame } from "./game/PhaserGame.jsx";
import QuizPage from "./QuizPage.jsx";

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

        gameScene.generateResources();
    };

    return (
        <Router>
            <div id="app">
                <nav style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                    <Link to="/"><button>🏠 Game</button></Link>
                    <Link to="/quiz"><button>🧠 Take Quiz</button></Link>
                </nav>

                <Routes>
                    <Route path="/" element={
                        <>
                            <div className="resource-bar">
                                <span>🍞 Food: {resources.food}</span>
                                <span>🌲 Wood: {resources.wood}</span>
                                <span>🏗 Metal: {resources.metal}</span>
                                <span>🧠 Tech: {resources.tech}</span>
                            </div>
                            <button className="end-turn-button" onClick={handleEndTurn}>End Turn</button>
                            <PhaserGame />
                        </>
                    } />
                    <Route path="/quiz" element={<QuizPage updateTech={updateTech} />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
