import { Scene } from 'phaser';

export class Game extends Scene {
    constructor() {
        super('Game');
    }

    preload() {
        this.load.tilemapTiledJSON('map', '/assets/map.tmj');

        // Load tileset images
        const tilesets = ['sheepHex', 'woodHex', 'clayHex', 'desertHex', 'oreHex', 'wheatHex', 'waterHex'];
        tilesets.forEach(name => this.load.image(name, `/assets/${name}.gif`));
    }

    create() {
        this.cameras.main.setBackgroundColor(0x000000);
        const map = this.make.tilemap({ key: 'map' });

        // Load tilesets dynamically
        const loadedTilesets = ['sheepHex', 'woodHex', 'clayHex', 'desertHex', 'oreHex', 'wheatHex', 'waterHex']
            .map(name => map.addTilesetImage(name, name));

        // Create the layer and store it in `this.layer`
        this.layer = map.createLayer('Tile Layer 1', loadedTilesets, 0, 0);

        // ✅ Initialize owned tiles list
        this.ownedTiles = [];

        // ✅ Enable tile interaction (clickable tiles)
        this.input.on('pointerdown', (pointer) => {
            const worldPoint = pointer.positionToCamera(this.cameras.main);

            // Convert world coordinates to tile coordinates
            const tile = this.layer.getTileAtWorldXY(worldPoint.x, worldPoint.y);

            if (tile) {
                console.log(`🎯 Tile clicked at (${tile.x}, ${tile.y})`);
                this.handleTileClick(tile);
            } else {
                console.log("❌ No tile detected at click position.");
            }
        });

        // ✅ Create a mapping of tile indexes to resources
        this.tileResourceMap = {
            1: { type: "food", amount: 1, cost: 5 },
            2: { type: "wood", amount: 1, cost: 5 },
            3: { type: "metal", amount: 1, cost: 5 },
            4: { type: "none", amount: 0, cost: 0 },
            5: { type: "metal", amount: 1, cost: 5 },
            6: { type: "food", amount: 1, cost: 5 },
            7: { type: "metal", amount: 1, cost: 5 },
            8: { type: "none", amount: 0, cost: 0 },
            9: { type: "none", amount: 0, cost: 0 }
        };

        // ✅ Initialize starting resources
        this.resources = { food: 10, wood: 10, metal: 10, tech: 0 };

        console.log("✅ Game initialized!");
    }

    generateResources() {
        if (!this.layer) {
            console.error("🚨 Layer is not defined!");
            return;
        }

        let newResources = { food: 0, wood: 0, metal: 0, tech: 0 };

        this.layer.forEachTile(tile => {
            const resourceData = this.tileResourceMap[tile.index];
            if (resourceData && resourceData.type !== 'none') {
                newResources[resourceData.type] += resourceData.amount;
            }
        });

        this.resources.food += newResources.food;
        this.resources.wood += newResources.wood;
        this.resources.metal += newResources.metal;

        console.log("🔄 Resources Updated:", this.resources);
    }

    handleTileClick(tile) {
        const x = tile.x;
        const y = tile.y;

        console.log(`📌 Handling tile click at (${x}, ${y})`);

        // ✅ Check if tile is already owned
        if (this.isTileOwned(x, y)) {
            console.log("❌ Tile already owned!");
            return;
        }

        // ✅ Check if the tile is adjacent to an owned tile
        if (!this.isTileAdjacent(x, y)) {
            console.log("❌ You can only claim adjacent tiles!");
            return;
        }

        // ✅ Check if player has enough resources
        const tileType = this.tileResourceMap[tile.index];
        if (!this.hasEnoughResources(tileType)) {
            console.log("❌ Not enough resources to claim this tile!");
            return;
        }

        // ✅ Deduct resources
        this.deductResources(tileType);

        // ✅ Claim the tile (change color to indicate ownership)
        tile.setTint(0xADD8E6); // Light blue tint
        this.ownedTiles.push({ x, y });

        console.log(`✅ Tile at (${x}, ${y}) claimed!`);
    }

    isTileOwned(x, y) {
        return this.ownedTiles.some(tile => tile.x === x && tile.y === y);
    }

    isTileAdjacent(x, y) {
        if (this.ownedTiles.length === 0) return true; // First tile can be claimed

        for (let tile of this.ownedTiles) {
            const dx = Math.abs(tile.x - x);
            const dy = Math.abs(tile.y - y);

            if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
                return true;
            }
        }
        return false;
    }

    hasEnoughResources(tileType) {
        return this.resources.food >= tileType.cost ||
               this.resources.wood >= tileType.cost ||
               this.resources.metal >= tileType.cost;
    }

    deductResources(tileType) {
        if (this.resources.food >= tileType.cost) {
            this.resources.food -= tileType.cost;
        } else if (this.resources.wood >= tileType.cost) {
            this.resources.wood -= tileType.cost;
        } else if (this.resources.metal >= tileType.cost) {
            this.resources.metal -= tileType.cost;
        }

        console.log("💰 Resources after spending:", this.resources);
    }
}
