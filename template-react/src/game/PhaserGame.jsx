import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import Phaser from "phaser";
import { Game } from "./scenes/Game.js";

let gameInstance = null;

export const PhaserGame = () => {
    const gameContainer = useRef(null);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const gameMode = queryParams.get("mode") || "standard"; 
    const [isInitialized, setIsInitialized] = useState(false);  

    console.log("📌 Selected Game Mode:", gameMode);

    // Set initial quiz difficulty based on game mode
    useEffect(() => {
        if (gameMode === "challenging") {
            // For challenging mode, ensure quiz difficulty starts at medium and persists
            if (localStorage.getItem("quizDifficulty") === "easy" || !localStorage.getItem("quizDifficulty")) {
                localStorage.setItem("quizDifficulty", "medium");
                console.log("Setting initial quiz difficulty to medium for challenging mode");
            }
        }
    }, [gameMode]);

    useEffect(() => {
        if (!gameContainer.current) return;

        // Game instance creation and updating
        if (!gameInstance) {
            console.log("Creating new Phaser instance");

            const config = {
                type: Phaser.AUTO,
                width: 1100,
                height: 500,
                parent: gameContainer.current,
                scene: [Game],
                physics: { default: "arcade" },
                data: { gameMode: gameMode } 
            };

            gameInstance = new Phaser.Game(config);
            window.phaserGame = gameInstance;
            console.log("✅ Phaser game initialized!");
            setIsInitialized(true);
        } else {
            console.log("Reusing existing Phaser instance");
            
            if (gameInstance.canvas && gameInstance.canvas.parentNode !== gameContainer.current) {
                gameInstance.canvas.parentNode.removeChild(gameInstance.canvas);
                gameContainer.current.appendChild(gameInstance.canvas);
            }
            
            if (gameInstance.scene && gameInstance.scene.scenes[0]) {
                const gameScene = gameInstance.scene.scenes[0];
                if (gameScene && gameScene.gameMode !== gameMode) {
                    gameScene.gameMode = gameMode;
                    console.log("Updated game mode in existing scene:", gameMode);
                    
                    if (gameScene.scene.isActive() && !gameScene.scene.isPaused()) {
                        gameScene.scene.restart({ gameMode });
                        console.log("Restarted scene with new game mode");
                    }
                }
            }
        }
        
        const handleResize = () => {
            if (gameInstance && gameInstance.scale) {
                gameInstance.scale.resize(
                    Math.min(1100, window.innerWidth - 20),
                    500
                );
            }
        };

        window.addEventListener('resize', handleResize);
        
        return () => {
            console.log("Component unmounting, preserving game instance");
            window.removeEventListener('resize', handleResize);

            if (gameInstance && gameInstance.scene && gameInstance.scene.scenes[0]) {
                const gameScene = gameInstance.scene.scenes[0];
                if (gameScene && gameScene.saveGameState) {
                    gameScene.saveGameState();
                    console.log("Game state saved on unmount");
                }
            }
        };
    }, [gameMode]);

    return (
        <div ref={gameContainer} id="game-container" className="phaser-container">
            {/* Game renders here */}
        </div>
    );
};

export default PhaserGame;