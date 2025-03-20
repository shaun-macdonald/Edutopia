import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Phaser from "phaser";
import { Game } from "./scenes/Game.js";

// Global variable to track if we've already created a game instance
let gameInstance = null;

export const PhaserGame = () => {
    const gameContainer = useRef(null);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const gameMode = queryParams.get("mode") || "standard"; // Default mode

    console.log("📌 Selected Game Mode:", gameMode); // Debugging

    useEffect(() => {
        if (!gameContainer.current) return;

        // If no game instance exists, create one
        if (!gameInstance) {
            console.log("Creating new Phaser instance");

            gameInstance = new Phaser.Game({
                type: Phaser.AUTO,
                width: 1100,
                height: 500,
                parent: gameContainer.current,
                scene: [Game],
                physics: { default: "arcade" },
                data: { gameMode: gameMode } // Pass gameMode as data
            });

            window.phaserGame = gameInstance;
            console.log("✅ Phaser game initialized!");
        } else {
            console.log("Reusing existing Phaser instance");

            // Reparent the canvas to our new container
            if (gameInstance.canvas && gameInstance.canvas.parentNode !== gameContainer.current) {
                gameInstance.canvas.parentNode.removeChild(gameInstance.canvas);
                gameContainer.current.appendChild(gameInstance.canvas);
            }
            
            // Update the game mode in the existing instance
            if (gameInstance.scene && gameInstance.scene.scenes[0]) {
                const gameScene = gameInstance.scene.scenes[0];
                if (gameScene) {
                    gameScene.gameMode = gameMode;
                    console.log("Updated game mode in existing scene:", gameMode);
                }
            }
        }

        return () => {
            console.log("Component unmounting, but preserving game instance");

            // Save game state before unmounting
            if (gameInstance && gameInstance.scene && gameInstance.scene.scenes[0]) {
                const gameScene = gameInstance.scene.scenes[0];
                if (gameScene) {
                    const savedState = {
                        ownedTiles: gameScene.ownedTiles || [],
                        resources: gameScene.resources || { food: 0, wood: 0, metal: 0, tech: 0 }
                    };
                    localStorage.setItem("gameState", JSON.stringify(savedState));
                }
            }
        };
    }, [gameMode]);

    return <div ref={gameContainer} id="game-container" />;
};