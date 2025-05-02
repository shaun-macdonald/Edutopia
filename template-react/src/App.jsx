    import { useState, useEffect } from "react";
    import { BrowserRouter as Router, Route, Routes, Link, Navigate } from "react-router-dom";
    import { PhaserGame } from "./game/PhaserGame.jsx";
    import QuizPage from "./QuizPage.jsx";
    import StartScreen from "./StartScreen.jsx";
    import InstructionsPage from "./InstructionsPage.jsx";
    import SessionCompleteScreen from "./SessionCompleteScreen.jsx";
    import "./StartScreen.css";
    import './GameStyle.css';
    import { 
        UserNameEntry,  
        TimerDisplay, 
        DataManager, 
        ResearchAdmin,
        initGlobalTimer, 
        stopGlobalTimer  
    } from './ResearchDataFeatures.jsx';

    

    function App() {
        const [resources, setResources] = useState({ food: 0, wood: 0, metal: 0, tech: 0 });
        const [tileCount, setTileCount] = useState(0);
        
        
        //  Load saved resources when the component mounts
        useEffect(() => {
            const savedState = localStorage.getItem("gameState");
            if (savedState) {
                try {
                    const { resources, tileCount } = JSON.parse(savedState);
                    if (resources) {
                        setResources(resources);
                    }
                    if (tileCount !== undefined) {
                        setTileCount(tileCount);
                    }
                } catch (e) {
                    console.error("Error parsing saved state:", e);
                }
            }

            // Make DataManager available to Phaser
            window.DataManager = DataManager;

            window.updateReactResources = (newResources) => {
                setResources({ ...newResources });

                // Save the updated resources to localStorage
                const currentState = localStorage.getItem("gameState");
                const parsedState = currentState ? JSON.parse(currentState) : { ownedTiles: [] };
                localStorage.setItem("gameState", JSON.stringify({ ...parsedState, resources: newResources }));
            };

            // Add handler for tile count updates
            window.updateTileCount = (count) => {
                setTileCount(count);
                console.log("Updated tile count in React:", count);
                
                // Save tile count to game state
                if (window.DataManager) {
                    window.DataManager.saveTileCount(count);
                }
            };

            return () => {
                window.updateReactResources = null;
                window.DataManager = null;
                window.updateTileCount = null;
            };
            // Old code, not in use but not deleting now
            if (localStorage.getItem("researchMode") === "true") {
                initGlobalTimer();
                console.log("Global timer initialized");
            }
            
            return () => {
                stopGlobalTimer();
            };
            }, []);

        const updateTech = (points, otherResources = 0) => {
            setResources(prevResources => {
                const newResources = { ...prevResources };
                newResources.tech += points;
                
                // Add other resources if specified (for quiz mode)
                if (otherResources > 0) {
                    newResources.food += otherResources;
                    newResources.wood += otherResources;
                    newResources.metal += otherResources;
                }
                            // sync updated tech into the Phaser game scene
                if (window.phaserGame && window.phaserGame.scene && window.phaserGame.scene.scenes[0]) {
                    const gameScene = window.phaserGame.scene.scenes[0];
                    if (gameScene.resources) {
                    gameScene.resources.tech = newResources.tech;
                    }
                }
    
                
                console.log(`Earned ${points} Tech${otherResources ? ` and ${otherResources} of other resources` : ''}! New totals:`, newResources);

                // Update localStorage
                const currentState = localStorage.getItem("gameState");
                const parsedState = currentState ? JSON.parse(currentState) : { ownedTiles: [] };
                localStorage.setItem("gameState", JSON.stringify({ 
                    ...parsedState, 
                    resources: newResources 
                }));

                return newResources;
            });
        };

        const handleEndTurn = () => {
            // Check if Phaser game exists and is running
            if (!window.phaserGame || !window.phaserGame.scene) {
                console.error("Phaser game not initialized properly.");
                return;
            }
            
            try {
                // Get the game scene
                const gameScene = window.phaserGame.scene.scenes[0];
                
                if (!gameScene || !gameScene.generateResources) {
                    console.error("Game scene or generateResources function is missing.");
                    return;
                }
                
                // Synchronze Reacts tech points to the game scene before generating resources
                if (gameScene.resources) {
                    gameScene.resources.tech = resources.tech;
                }
                
                // Generate resources without directly updating React state
                gameScene.generateResources();
                
                // After resources are generated, manually update React state
                // Use setTimeout to break the potential render cycle
                setTimeout(() => {
                    // Calculate the current resource caps
                    const resourceCaps = gameScene.calculateResourceCaps();
                    
                    // Create a new object with resources and caps
                    const newResources = { 
                        food: gameScene.resources.food,
                        wood: gameScene.resources.wood, 
                        metal: gameScene.resources.metal,
                        tech: gameScene.resources.tech,
                        caps: resourceCaps
                    };
                    
                    console.log("Updated resources from game:", newResources);
                    console.log("Current resource caps:", resourceCaps);
                    
                    setResources(newResources);
                }, 50);
                
            } catch (error) {
                console.error("Error in handleEndTurn:", error);
            }
        };

        const handleUpgradeStorage = () => {
            // Check if Phaser game exists and is running
            if (!window.phaserGame || !window.phaserGame.scene) {
                console.error("Phaser game not initialized properly.");
                return;
            }
            
            try {
                // Get the game scene
                const gameScene = window.phaserGame.scene.scenes[0];
                
                if (!gameScene || !gameScene.upgradeResourceStorage) {
                    console.error("Game scene or upgradeResourceStorage function is missing.");
                    return;
                }
                
                // Call the upgrade function
                gameScene.upgradeResourceStorage();
                
            } catch (error) {
                console.error("Error in handleUpgradeStorage:", error);
            }
        };

        // renders the game interface with resources and navigation
    const GameScreen = () => {
        // Check if research mode is active
        const isResearchMode = localStorage.getItem("researchMode") === "true";
        
        return (
        <>
            {/* Show timer if in research mode */}
            {isResearchMode && <TimerDisplay />}
            
            <div className="resource-bar">
            <span className={resources.food >= (resources.caps?.food || 50) ? 'resource-at-cap' : 
                            resources.food >= (resources.caps?.food || 50) * 0.8 ? 'resource-near-cap' : ''}>
                🍞 Food: {resources.food}/{resources.caps?.food || 50}
            </span>
            
            <span className={resources.wood >= (resources.caps?.wood || 50) ? 'resource-at-cap' : 

                            resources.wood >= (resources.caps?.wood || 50) * 0.8 ? 'resource-near-cap' : ''}>
                🌲 Wood: {resources.wood}/{resources.caps?.wood || 50}
            </span>
            
            <span className={resources.metal >= (resources.caps?.metal || 50) ? 'resource-at-cap' : 
                            resources.metal >= (resources.caps?.metal || 50) * 0.8 ? 'resource-near-cap' : ''}>
                🏗 Metal: {resources.metal}/{resources.caps?.metal || 50}
                
            </span>
            
            <span>🧠 Tech: {resources.tech}</span>
            <span className="tile-count">🏆 Tiles: {tileCount}</span>
            </div>
            <nav className="game-nav">
            <Link to="/"><button className="menu-button">Main Menu</button></Link>
            <Link to={`/quiz?mode=${new URLSearchParams(window.location.search).get('mode') || 'standard'}`}>
                <button className="quiz-button">🧠 Take Quiz</button>
            </Link>
            <button className="upgrade-button" onClick={handleUpgradeStorage}>Upgrade Storage (1 Tech)</button>
            <button className="end-turn-button" onClick={handleEndTurn}>End Turn</button>
            

            <Link to="/instructions">
                        <button className="instructions-button">Instructions</button>
                    </Link>
            </nav>
            <PhaserGame />
        </>
        );
    };

        return (
            <Router>
                <div id="app">
                    <Routes>
                        {/* Start Screen (new home route) */}
                        <Route path="/" element={<StartScreen />} />
                        
                        {/* User Name Entry */}
                        <Route path="/enter-name" element={<UserNameEntry />} />
                        
                        {/* Instructions Page */}
                        <Route path="/instructions" element={<InstructionsPage />} />
                        
                        {/* Game Screen with mode param - check for username in research mode */}
                        <Route path="/game" element={
                            localStorage.getItem("researchMode") === "true" && !localStorage.getItem("userName") ? 
                                <Navigate to={`/enter-name?destination=game&mode=${new URLSearchParams(window.location.search).get('mode') || 'standard'}`} replace /> : 
                                <GameScreen />
                        } />
                        
                        {/* Quiz Page ,check for username in research mode */}
                        <Route path="/quiz" element={
                            localStorage.getItem("researchMode") === "true" && !localStorage.getItem("userName") ? 
                                <Navigate to={`/enter-name?destination=quiz&mode=${new URLSearchParams(window.location.search).get('mode') || 'standard'}`} replace /> : 
                                <QuizPage updateTech={updateTech} />
                        } />
                        
                        {/* Session complete route */}
                        <Route path="/session-complete" element={<SessionCompleteScreen />} />
                        
                        {/* Admin route */}
                        <Route path="/admin" element={
                            <div className="admin-route-wrapper">
                                <ResearchAdmin />
                            </div>
                        } />
                        
                        {/* For backward compatibility, redirect /start to / */}
                        <Route path="/start" element={<Navigate to="/" replace />} />
                    </Routes>
                </div>
            </Router>
        );
    }

    export default App;