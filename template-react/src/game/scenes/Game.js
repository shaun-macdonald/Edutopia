import { Scene } from 'phaser';

export class Game extends Scene {
    constructor() {
        super('Game');
    }


    init(data) {
        // Initialize scene with data passed from PhaserGame component
        console.log("Scene init with data:", data);
        if (data && data.gameMode) {
            this.gameMode = data.gameMode;
            console.log("Game mode set from init data:", this.gameMode);
        }
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
        const map = this.make.tilemap({ key: "map" });
    
        const loadedTilesets = [
            "sheepHex", "woodHex", "clayHex", "desertHex",
            "oreHex", "wheatHex", "waterHex", "village"
        ].map(name => map.addTilesetImage(name, name));
    
        this.layer = map.createLayer("Tile Layer 1", loadedTilesets, 0, 0);
    
        // Get game mode from game instance data
        // Get game mode from config data if not already set
        if (!this.gameMode) {
            this.gameMode = this.game.config.data?.gameMode || "standard";
        }
        console.log("Final game mode set to:", this.gameMode);
        console.log("Game mode set to:", this.gameMode);
        
        // Define playerStartTile first
        this.playerStartTile = { x: 1, y: 8 };
        
        // ✅ Always start fresh (resources reset to 0)
        this.resources = { food: 0, wood: 0, metal: 0, tech: 0 };
        
        // Initialize owned tiles with health property
        this.ownedTiles = [{ 
            x: this.playerStartTile.x, 
            y: this.playerStartTile.y,
            health: 100  // Full health for starting tile
        }];

        // Initialize tile count based on healthy owned tiles
        this.tileCount = this.countHealthyTiles();

        // Create a base resource cap and a storage value increase 
        this.baseResourceCap = 50; 
        //this.resourceCapPerTech = 10; 
    
        console.log("🆕 New game started - Resources reset to 0");
    
        // Load saved state if available
        const savedState = localStorage.getItem("gameState");
        if (savedState) {
            try {
                const parsedState = JSON.parse(savedState);
                if (parsedState.ownedTiles && parsedState.ownedTiles.length > 0) {
                    this.ownedTiles = parsedState.ownedTiles;
                    console.log("♻️ Restored owned tiles:", this.ownedTiles);
                }

                if (parsedState.resources) {
                    this.resources = parsedState.resources;
                    console.log("♻️ Restored resources:", this.resources);
                }

                if (parsedState.baseResourceCap) {
                    this.baseResourceCap = parsedState.baseResourceCap;
                    console.log("♻️ Restored base resource cap:", this.baseResourceCap);
                }

                if (parsedState.tileCount !== undefined) {
                    this.tileCount = parsedState.tileCount;
                    console.log("♻️ Restored tile count:", this.tileCount);
                } else {
                    // Fallback: count healthy owned tiles
                    this.tileCount = this.countHealthyTiles();
                }

                // Update React with restored resources and caps
                if (window.updateReactResources) {
                    const resourceCaps = this.calculateResourceCaps();
                    window.updateReactResources({
                        ...this.resources,
                        caps: resourceCaps
                    });
                }

                // Update React with tile count
                if (window.updateTileCount) {
                    window.updateTileCount(this.tileCount);
                }
            } catch (e) {
                console.error("Error parsing saved state:", e);
            }
        }
    
        this.input.on("pointerdown", (pointer) => {
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
    
        console.log("Game initialized with owned tiles:", this.ownedTiles);
    
        // Apply visual effects to owned tiles
        this.updateTileVisuals();
    
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
    
        this.village = this.add.image(worldX, worldY, "village")
            .setOrigin(0.5, 0.5)
            .setScale(0.9)
            .setDepth(100);
    }
    
    // Method to apply visual effects based on tile health
    updateTileVisuals() {
        if (!this.layer) return;
        
        this.ownedTiles.forEach(({ x, y, health }) => {
            const tile = this.layer.getTileAt(x, y);
            if (tile) {
                // Set alpha for ownership indication
                tile.alpha = 0.7;
                
                // Apply tint based on health
                if (health <= 0) {
                    // Red for disabled tiles (no production)
                    tile.tint = 0xFF0000;
                } else if (health < 50) {
                    // Orange for warning state
                    tile.tint = 0xFFA500;
                } else {
                    // No tint (default color) for healthy tiles
                    tile.tint = 0xFFFFFF;
                }
            }
        });
    }
    
    // Alias for updateTileVisuals for backward compatibility
    reapplyTileVisuals() {
        this.updateTileVisuals();
    }
    
    generateResources() {
        if (!this.layer) {
            console.error("Layer is not defined!");
            return;
        }
        
        // Calculate resource caps
        const resourceCaps = this.calculateResourceCaps();
        
        let newResources = { 
            food: 0, 
            wood: 0, 
            metal: 0, 
            tech: this.resources.tech // Preserve tech points 
        };
        
        // Debug all tiles
        console.log("DEBUG: All owned tiles:", JSON.stringify(this.ownedTiles));
        
        // In quiz-only mode, don't generate resources from tiles
        if (this.gameMode !== "quiz") {
            // Apply degradation to tiles and generate resources
            this.ownedTiles.forEach((tile, index) => {
                console.log(`DEBUG: Processing tile at (${tile.x}, ${tile.y}) with health ${tile.health}`);
                
                // Village handling - special case
                if (tile.x === this.playerStartTile.x && tile.y === this.playerStartTile.y) {
                    console.log("DEBUG: This is the village tile, generating resources");
                    // Village doesn't degrade and always produces at full capacity
                    newResources.food += Math.floor(1 * (this.gameMode === "reduced" ? 0.5 : 1));
                    newResources.wood += Math.floor(1 * (this.gameMode === "reduced" ? 0.5 : 1));
                    newResources.metal += Math.floor(1 * (this.gameMode === "reduced" ? 0.5 : 1));
                    console.log("DEBUG: Village generated resources:", newResources);
                    return; // Skip degradation for village
                }
                
                // Degrade tile by 10 points per turn
                this.ownedTiles[index].health = Math.max(0, tile.health - 10);
                console.log(`DEBUG: After degradation, health is now ${this.ownedTiles[index].health}`);
                
                // Tiles only produce resources if they have health
                if (this.ownedTiles[index].health > 0) {
                    const mapTile = this.layer.getTileAt(tile.x, tile.y);
                    console.log(`DEBUG: Map tile at this location:`, mapTile ? mapTile.index : "none");
                    
                    if (mapTile) {
                        const resourceData = this.tileResourceMap[mapTile.index];
                        console.log(`DEBUG: Resource data for this tile:`, resourceData);
                        
                        // Apply resource multiplier based on game mode and tile health
                        const modeMultiplier = this.gameMode === "reduced" ? 0.5 : 1;
                        const healthMultiplier = this.ownedTiles[index].health / 100; // 0-100% based on health
                        
                        if (resourceData && resourceData.type !== 'none') {
                            // Calculate raw amount based on health and mode
                            const amount = resourceData.amount * modeMultiplier * healthMultiplier;
                            
                            // For amounts less than 1, have at least a chance of producing 1 resource
                            if (amount > 0 && amount < 1) {
                                // This gives a proportional chance based on health
                                if (Math.random() < amount) {
                                    newResources[resourceData.type] += 1;
                                    console.log(`DEBUG: Generated 1 ${resourceData.type} by chance`);
                                } else {
                                    console.log(`DEBUG: No ${resourceData.type} generated this turn (${Math.round(amount*100)}% chance)`);
                                }
                            } else {
                                // For amounts >= 1, round to nearest integer instead of flooring
                                const roundedAmount = Math.round(amount);
                                newResources[resourceData.type] += roundedAmount;
                                console.log(`DEBUG: Generated ${roundedAmount} ${resourceData.type}`);
                            }
                        } else {
                            console.log("DEBUG: This tile doesn't produce resources");
                        }
                    } else {
                        console.log("DEBUG: No map tile found at this location");
                    }
                } else {
                    console.log("DEBUG: Tile health too low to produce resources");
                }
            });
        }
        
        // Update visuals to reflect degradation
        this.updateTileVisuals();
        
        // Recalculate healthy tile count after degradation
        this.tileCount = this.countHealthyTiles();
        
        // Update the React UI with the new tile count
        if (window.updateTileCount) {
            window.updateTileCount(this.tileCount);
            console.log("Updated healthy tile count after degradation:", this.tileCount);
        }
        
        console.log("DEBUG: New resources to be added:", newResources);
    
        // Calculate new total values
        const totalFood = this.resources.food + newResources.food;
        const totalWood = this.resources.wood + newResources.wood;
        const totalMetal = this.resources.metal + newResources.metal;
    
        // Apply caps to the totals
        this.resources.food = Math.min(totalFood, resourceCaps.food);
        this.resources.wood = Math.min(totalWood, resourceCaps.wood);
        this.resources.metal = Math.min(totalMetal, resourceCaps.metal);
        this.resources.tech = newResources.tech; // Keep accumulated tech points
    
        // Optional: log if resources were capped
        if (totalFood > resourceCaps.food || totalWood > resourceCaps.wood || totalMetal > resourceCaps.metal) {
            console.log("⚠️ Some resources reached their cap!");
        }
    
        console.log("🔄 Resources Updated:", this.resources);
        console.log("Using game mode:", this.gameMode);
    
        if (window.updateReactResources) {
            window.updateReactResources({
                ...this.resources,
                caps: resourceCaps
            });
        }
        
        // Save the state after generating resources
        this.saveGameState();
    }
    
    saveGameState() {
        // Calculate current healthy tile count
        const healthyTileCount = this.countHealthyTiles();
        
        const savedState = {
            ownedTiles: this.ownedTiles,
            resources: this.resources,
            baseResourceCap: this.baseResourceCap,
            tileCount: healthyTileCount // Save the count of healthy tiles
        };
        localStorage.setItem("gameState", JSON.stringify(savedState));
        console.log("💾 Game state saved with healthy tile count:", healthyTileCount);
    }

    // Method to handle tile repair
    repairTile(x, y) {
        // Find the tile in ownedTiles
        const tileIndex = this.ownedTiles.findIndex(tile => tile.x === x && tile.y === y);
        
        if (tileIndex === -1) {
            console.log("Tile not found in owned tiles!");
            return false;
        }
        
        // Check if tile needs repair
        if (this.ownedTiles[tileIndex].health >= 100) {
            console.log("Tile is already at full health!");
            return false;
        }
        
        // Check if player has tech points
        if (this.resources.tech < 1) {
            console.log("Not enough tech points to repair tile!");
            return false;
        }
        
        // Check if this tile was previously red (no health)
        const wasRed = this.ownedTiles[tileIndex].health <= 0;
        
        // Deduct tech point and repair tile
        this.resources.tech -= 1;
        this.ownedTiles[tileIndex].health = 100;
        
        // Update visuals
        this.updateTileVisuals();
        
        // If the tile was previously red, recalculate healthy tile count
        if (wasRed) {
            this.tileCount = this.countHealthyTiles();
            
            // Update the React UI with the new tile count
            if (window.updateTileCount) {
                window.updateTileCount(this.tileCount);
                console.log("Updated healthy tile count after repair:", this.tileCount);
            }
        }
        
        // Save game state
        this.saveGameState();
        
        console.log(`Tile at (${x}, ${y}) repaired!`);
        
        // Update React with new resources
        if (window.updateReactResources) {
            const resourceCaps = this.calculateResourceCaps();
            window.updateReactResources({
                ...this.resources,
                caps: resourceCaps
            });
        }
        
        return true;
    }

    handleTileClick(tile) {
        const x = tile.x;
        const y = tile.y;
        
        console.log(`Handling tile click at (${x}, ${y})`);
        
        // Check if the tile is owned and needs repair
        const ownedTile = this.ownedTiles.find(t => t.x === x && t.y === y);
        if (ownedTile) {
            if (ownedTile.health < 100) {
                // Tile needs repair
                const repaired = this.repairTile(x, y);
                if (repaired) {
                    console.log(`Tile at (${x}, ${y}) repaired!`);
                }
                return;
            } else {
                console.log("Tile already owned and in good condition!");
                return;
            }
        }
        
        // Original tile claiming logic continues here...
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
        
        // Add the new tile with full health (once, not twice)
        this.ownedTiles.push({ x, y, health: 100 });
        
        // Update tile count - only count healthy tiles
        this.tileCount = this.countHealthyTiles();
        
        // Update the React UI with the new tile count
        if (window.updateTileCount) {
            window.updateTileCount(this.tileCount);
            console.log("Updated healthy tile count:", this.tileCount);
        }
        
        // Apply visual effects
        this.updateTileVisuals();
        
        console.log(`Tile at (${x}, ${y}) claimed! Total healthy tiles: ${this.tileCount}`);
        
        // Save state after claiming a tile
        this.saveGameState();
    }
    
    isTileOwned(x, y) {
        return this.ownedTiles.some(tile => tile.x === x && tile.y === y);
    }

    isTileAdjacent(x, y) {
        if (this.ownedTiles.length === 0) {
            console.log("No owned tiles yet, allowing first tile claim");
            return true;
        }
    
        for (let tile of this.ownedTiles) {
            const dx = Math.abs(tile.x - x);
            const dy = Math.abs(tile.y - y);
            
            console.log(`Checking adjacency: owned(${tile.x},${tile.y}) to target(${x},${y})`);
            console.log(`dx=${dx}, dy=${dy}`);
    
            if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
                console.log("Found adjacent tile!");
                return true;
            }
        }
        console.log("No adjacent tiles found");
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
        
        // Update React with updated resources
        if (window.updateReactResources) {
            const resourceCaps = this.calculateResourceCaps();
            window.updateReactResources({
                ...this.resources,
                caps: resourceCaps
            });
        }
    }

    calculateResourceCaps() {
        const caps = {
            food: this.baseResourceCap,
            wood: this.baseResourceCap,
            metal: this.baseResourceCap
        };
        console.log("Resource caps calculated:", caps);
        return caps;
    }
    
    upgradeResourceStorage() {
        if (this.resources.tech < 1) {
            console.log("Not enough tech points!");
            return false;
        }
    
        this.resources.tech -= 1;
        this.baseResourceCap += 20; // Manually increases base cap
    
        console.log("Storage capacity upgraded! New base cap:", this.baseResourceCap);
    
        const resourceCaps = this.calculateResourceCaps();
    
        if (window.updateReactResources) {
            window.updateReactResources({
                ...this.resources,
                caps: resourceCaps
            });
        }
    
        this.saveGameState();
        return true;
    }

    countHealthyTiles() {
        // Count tiles that have health > 0 (non-red tiles)
        const healthyTileCount = this.ownedTiles.filter(tile => tile.health > 0).length;
        console.log(`Healthy tiles: ${healthyTileCount} out of ${this.ownedTiles.length} total tiles`);
        return healthyTileCount;
    }
}