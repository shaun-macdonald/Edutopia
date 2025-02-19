import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { Game } from './scenes/Game.js'; 

export const PhaserGame = () => {               //Used to hold a reference for Phaseers game cont
    const gameContainer = useRef(null);

    useEffect(() => {
        if (!gameContainer.current) return;

        console.log("Initializing Phaser...");
        window.phaserGame = new Phaser.Game({
            type: Phaser.AUTO,
            width: 1100,
            height: 500,
            parent: gameContainer.current,
            scene: [Game],
        });

        console.log("Phaser game is fully initialized!");

        return () => {
            console.log("eDestroying Phaser game...");
            window.phaserGame.destroy(true);
            window.phaserGame = null;
        };
    }, []);

    return <div ref={gameContainer} id="game-container" />;
};
