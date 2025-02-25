import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { Game } from './scenes/Game.js';

export const PhaserGame = () => {
    const gameContainer = useRef(null);
    console.log("📌 Mounting PhaserGame.jsx...");

    useEffect(() => {
        // 🛑 Save game state before destroying Phaser
        if (window.phaserGame) {
            console.warn("🛑 Saving game state before destroying Phaser...");
            const gameScene = window.phaserGame.scene.scenes[0];

            if (gameScene) {
                const savedState = {
                    ownedTiles: gameScene.ownedTiles,
                    resources: gameScene.resources,
                };
                localStorage.setItem("gameState", JSON.stringify(savedState));
            }

            console.warn("🛑 Destroying previous Phaser instance...");
            window.phaserGame.destroy(true);
            window.phaserGame = null;
        }

        if (!gameContainer.current) return;

        console.log("Initializing Phaser...");
        window.phaserGame = new Phaser.Game({
            type: Phaser.AUTO,
            width: 1100,
            height: 500,
            parent: gameContainer.current,
            scene: [Game],
        });

        console.log("✅ Phaser game is fully initialized!");

        return () => {
            console.log("♻️ Cleaning up Phaser instance...");
            if (window.phaserGame) {
                const gameScene = window.phaserGame.scene.scenes[0];

                if (gameScene) {
                    const savedState = {
                        ownedTiles: gameScene.ownedTiles,
                        resources: gameScene.resources,
                    };
                    localStorage.setItem("gameState", JSON.stringify(savedState));
                }

                window.phaserGame.destroy(true);
                window.phaserGame = null;
            }
        };
    }, []);

    return <div ref={gameContainer} id="game-container" />;
};
