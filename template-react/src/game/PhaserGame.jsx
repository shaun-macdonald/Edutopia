import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { Game } from './scenes/Game.js';

export const PhaserGame = () => {
    const gameContainer = useRef(null);

    useEffect(() => {
        // 🛑 Prevent Phaser from reinitializing if it already exists
        if (window.phaserGame) {
            console.warn("⚠️ Phaser is already initialized! Skipping new instance.");
            return;
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
            // 🛑 Remove this line to prevent Phaser from being destroyed
            // console.log("Destroying Phaser game...");
            // window.phaserGame.destroy(true);
            // window.phaserGame = null;
        };
    }, []);

    return <div ref={gameContainer} id="game-container" />;
};
