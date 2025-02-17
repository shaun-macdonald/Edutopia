import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom"; // ✅ Import React Router
import { PhaserGame } from "./game/PhaserGame.jsx";
import QuizPage from "./QuizPage.jsx";

function App() {
    const [resources, setResources] = useState({ food: 0, wood: 0, metal: 0, tech: 0 });

    useEffect(() => {
        const interval = setInterval(() => {
            if (
                window.phaserGame &&
                window.phaserGame.scene &&
                window.phaserGame.scene.scenes.length > 0
            ) {
                console.log("✅ Phaser is ready! Updating resources...");
                setResources({ ...window.phaserGame.scene.scenes[0].resources });
                clearInterval(interval); // ✅ Stop checking once Phaser is initialized
            } else {
                console.warn("⏳ Waiting for Phaser to initialize...");
            }
        }, 500); // ✅ Check every 500ms instead of 1000ms for faster response
    
        return () => clearInterval(interval); // ✅ Clean up interval when unmounting
    }, []);
    

    const handleEndTurn = () => {
        if (!window.phaserGame || !window.phaserGame.scene || !window.phaserGame.scene.scenes[0]) {
            console.error("🚨 Phaser game or scenes not initialized properly.");
            return;
        }

        const gameScene = window.phaserGame.scene.scenes[0];

        if (!gameScene.generateResources) {
            console.error("🚨 generateResources() function is missing in Game.js!");
            return;
        }

        gameScene.generateResources();
        setResources({ ...gameScene.resources });

        console.log("✅ End turn processed. New resources:", gameScene.resources);
    };

    return (
        <Router> {/* ✅ Wrap in Router to enable navigation */}
            <div id="app">
                {/* Navigation Buttons */}
                <nav style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                    <Link to="/"><button>🏠 Game</button></Link>
                    <Link to="/quiz"><button>🧠 Take Quiz</button></Link>
                </nav>

                {/* Routes to Switch Between Game and Quiz */}
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
                    }/>
                    <Route path="/quiz" element={<QuizPage />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
