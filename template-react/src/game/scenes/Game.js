import { Scene } from 'phaser';

export class Game extends Scene {
    constructor() {
        super('Game');
    }

    preload() {
        this.load.tilemapTiledJSON('map', '/assets/map.tmj');
    
        const tilesets = ['sheepHex', 'woodHex', 'clayHex', 'desertHex', 'oreHex', 'wheatHex', 'waterHex', 'village'];
        tilesets.forEach(name => this.load.image(name, `/assets/${name}.gif`));
    
        this.load.once('filecomplete-image-village', () => {
            console.log("Village image loaded successfully!");
        });
    
        this.load.once('loaderror', (file) => {
            console.error(`Failed to load asset: ${file.key}`);
        });
    }
    
    create() {
        this.cameras.main.setBackgroundColor(0x000000);
        const map = this.make.tilemap({ key: 'map' });
    
        const loadedTilesets = ['sheepHex', 'woodHex', 'clayHex', 'desertHex', 'oreHex', 'wheatHex', 'waterHex', 'village']
            .map(name => map.addTilesetImage(name, name));
    
        this.layer = map.createLayer('Tile Layer 1', loadedTilesets, 0, 0);
    
        this.ownedTiles = [];
    
        this.input.on('pointerdown', (pointer) => {
            const worldPoint = pointer.positionToCamera(this.cameras.main);
            const tile = this.layer.getTileAtWorldXY(worldPoint.x, worldPoint.y);
    
            if (tile) {
                console.log(`Tile clicked at (${tile.x}, ${tile.y})`);
                this.handleTileClick(tile);
            }
        });
    
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
    
        this.resources = { food: 0, wood: 0, metal: 0, tech: 0 };
    
        console.log("Game initialized!");
    
        this.playerStartTile = { x: 1, y: 8 };
        this.ownedTiles.push({ x: this.playerStartTile.x, y: this.playerStartTile.y });

        console.log("Player starts with tile:", this.ownedTiles);
    
        console.log("Tile Layer Data:", this.layer);
    
        const tileWidth = map.tileWidth || 55;
        const tileHeight = map.tileHeight || 64;
    
        console.log("Tile Width:", tileWidth, "Tile Height:", tileHeight);
    
        const worldX = (this.playerStartTile.x * tileWidth) + (tileWidth / 2);
        const worldY = (this.playerStartTile.y * tileHeight) + (tileHeight / 2);
    
        console.log(`Placing Village at: X=${worldX}, Y=${worldY} (Tile: ${this.playerStartTile.x}, ${this.playerStartTile.y})`);
    
        this.add.rectangle(worldX, worldY, 50, 50, 0xff0000)
            .setOrigin(0.5, 0.5)
            .setDepth(200);
    
        console.log("Placing test red square at:", worldX, worldY);
    
        this.village = this.add.image(worldX, worldY, 'village')
            .setOrigin(0.5, 0.5)
            .setScale(0.9)
            .setDepth(100);
    }
    
    generateResources() {
        if (!this.layer) {
            console.error("Layer is not defined!");
            return;
        }
    
        let newResources = { food: 0, wood: 0, metal: 0, tech: this.resources.tech };
    
        this.ownedTiles.forEach(({ x, y }) => {
            const tile = this.layer.getTileAt(x, y);
            if (tile) {
                const resourceData = this.tileResourceMap[tile.index];
    
                if (x === this.playerStartTile.x && y === this.playerStartTile.y) {
                    newResources.food += 1;
                    newResources.wood += 1;
                    newResources.metal += 1;
                } else if (resourceData && resourceData.type !== 'none') {
                    newResources[resourceData.type] += resourceData.amount;
                }
            }
        });
    
        this.resources.food += newResources.food;
        this.resources.wood += newResources.wood;
        this.resources.metal += newResources.metal;
    
        console.log("Resources Updated:", this.resources);
    
        if (window.updateReactResources) {
            window.updateReactResources(this.resources);
        }
    }

    handleTileClick(tile) {
        const x = tile.x;
        const y = tile.y;
    
        console.log(`Handling tile click at (${x}, ${y})`);
    
        if (this.isTileOwned(x, y)) {
            console.log("Tile already owned!");
            return;
        }
    
        if (!this.isTileAdjacent(x, y)) {
            console.log("You can only claim adjacent tiles!");
            return;
        }
    
        const tileType = this.tileResourceMap[tile.index];
        if (!tileType || tileType.type === "none") {
            console.log("This tile cannot be claimed!");
            return;
        }
    
        if (!this.hasEnoughResources(tileType)) {
            console.log("Not enough resources to claim this tile!");
            return;
        }
    
        this.deductResources(tileType);
        this.ownedTiles.push({ x, y });
    
        const tileIndex = tile.index;
        this.layer.putTileAt(tileIndex, x, y).alpha = 0.7;
    
        console.log(`Tile at (${x}, ${y}) claimed! Tint applied.`);
    }
    
    isTileOwned(x, y) {
        return this.ownedTiles.some(tile => tile.x === x && tile.y === y);
    }

    isTileAdjacent(x, y) {
        if (this.ownedTiles.length === 0) return true;

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
        return this.resources[tileType.type] >= tileType.cost;
    }

    deductResources(tileType) {
        if (this.resources[tileType.type] >= tileType.cost) {
            this.resources[tileType.type] -= tileType.cost;
        }

        console.log("Resources after spending:", this.resources);
    }
}
