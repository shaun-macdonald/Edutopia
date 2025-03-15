import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { Game } from './scenes/Game.js';

// Global variable to track if we've already created a game instance
let gameInstance = null;

export const PhaserGame = () => {
    const gameContainer = useRef(null);
    console.log("📌 Mounting PhaserGame.jsx...");

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
            });
            
            window.phaserGame = gameInstance;
            console.log("✅ Phaser game is fully initialized!");
        } 
        // If we already have a game instance, just reparent it
        else {
            console.log("Reusing existing Phaser instance");
            
            // Reparent the canvas to our new container
            if (gameInstance.canvas && gameInstance.canvas.parentNode !== gameContainer.current) {
                gameInstance.canvas.parentNode.removeChild(gameInstance.canvas);
                gameContainer.current.appendChild(gameInstance.canvas);
            }
        }

        // Only clean up the game when the component is truly unmounting
        return () => {
            // Don't destroy the game instance on normal navigation
            console.log("Component unmounting, but preserving game instance");
            
            // Save game state just in case
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
    }, []);

    return <div ref={gameContainer} id="game-container" />;
};