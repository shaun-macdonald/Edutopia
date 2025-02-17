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

        // Create a mapping of tile indexes to resources
        this.tileResourceMap = {
            1: { type: "food", amount: 1 },  // SheepHex (grassland)
            2: { type: "wood", amount: 1 },  // WoodHex (forest)
            3: { type: "metal", amount: 1 }, // ClayHex (rocky)
            4: { type: "none", amount: 0 },  // DesertHex (empty)
            5: { type: "metal", amount: 1 }, // OreHex (rocky)
            6: { type: "food", amount: 1 },  // WheatHex (grassland)
            7: { type: "metal", amount: 1 }, // OreHex duplicate (rocky)
            8: { type: "none", amount: 0 },  // WaterHex (empty)
            9: { type: "none", amount: 0 }   // DesertHex duplicate (empty)
        };

        this.resources = { food: 0, wood: 0, metal: 0, tech: 0 };

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

        this.resources = {
            food: this.resources.food + newResources.food,
            wood: this.resources.wood + newResources.wood,
            metal: this.resources.metal + newResources.metal,
            tech: this.resources.tech // Tech is gained from answering questions
        };

        console.log("🔄 Resources Updated:", this.resources);
    }
}
