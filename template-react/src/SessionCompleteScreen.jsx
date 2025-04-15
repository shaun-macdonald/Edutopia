import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function SessionCompleteScreen() {
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const [totalTiles, setTotalTiles] = useState(0);
  const [debugInfo, setDebugInfo] = useState('');
  
  useEffect(() => {
    console.log("SessionCompleteScreen mounted");
    
    // Ensure we have a completed session flag
    if (!localStorage.getItem("sessionCompleted")) {
      localStorage.setItem("sessionCompleted", "true");
    }
    
    // Get score (healthy tiles) from localStorage or game state
    const gameState = JSON.parse(localStorage.getItem("gameState") || "{}");
    let healthyTileCount = 0;
    let totalTileCount = 0;
    let debugText = '';
    
    // Try to get the most accurate count - with debugging
    if (window.phaserGame && window.phaserGame.scene && window.phaserGame.scene.scenes[0]) {
      const gameScene = window.phaserGame.scene.scenes[0];
      debugText += "Found active game scene. ";
      
      if (gameScene.ownedTiles) {
        totalTileCount = gameScene.ownedTiles.length;
        debugText += `Found ${totalTileCount} total tiles. `;
        
        if (gameScene.countHealthyTiles) {
          healthyTileCount = gameScene.countHealthyTiles();
          debugText += `Used countHealthyTiles() method: ${healthyTileCount} healthy tiles. `;
        } else {
          healthyTileCount = gameScene.ownedTiles.filter(tile => tile.health > 0).length;
          debugText += `Calculated healthy tiles manually: ${healthyTileCount} healthy tiles. `;
        }
      } else {
        debugText += "No ownedTiles in game scene. ";
      }
    } else {
      debugText += "No active game scene found. ";
      
      if (gameState.ownedTiles && gameState.ownedTiles.length > 0) {
        totalTileCount = gameState.ownedTiles.length;
        healthyTileCount = gameState.ownedTiles.filter(tile => tile.health > 0).length;
        debugText += `Using localStorage data: ${healthyTileCount} healthy tiles out of ${totalTileCount} total. `;
      } else {
        // Fallback to the stored tileCount
        healthyTileCount = gameState.tileCount || 0;
        totalTileCount = healthyTileCount; // Best guess
        debugText += `Using fallback tileCount: ${healthyTileCount}. `;
      }
    }
    
    console.log("Final score calculation:", debugText);
    setScore(healthyTileCount);
    setTotalTiles(totalTileCount);
    setDebugInfo(debugText);
    
    // Manually export data if possible
    if (window.DataManager && window.DataManager.exportResearchData) {
      try {
        window.DataManager.exportResearchData();
        console.log("Research data exported");
      } catch (e) {
        console.error("Error exporting research data:", e);
      }
    }
    
    // If we got no score but we know there's a game state, use a default
    if (healthyTileCount === 0 && gameState && Object.keys(gameState).length > 0) {
      setScore(gameState.tileCount || 0);
    }
  }, []);
  
  const startNewSession = () => {
    // Clear current user data but keep completed sessions
    localStorage.removeItem("userName");
    localStorage.removeItem("sessionStartTime");
    localStorage.removeItem("sessionTimeRemaining");
    localStorage.removeItem("gameState");
    localStorage.removeItem("sessionCompleted");
    localStorage.removeItem("questionTimings"); // Clear question timings for new session
    
    // Navigate to start screen
    navigate("/");
  };
  
  // Even if we can't calculate a score, show something
  const displayScore = score || 0;
  
  return (
    <div className="session-complete-screen" style={{
      textAlign: 'center',
      padding: '50px 20px',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <h1>Session Complete!</h1>
      
      <div className="score-display" style={{
        backgroundColor: '#f5f5f5',
        padding: '20px',
        borderRadius: '8px',
        margin: '30px auto',
        maxWidth: '400px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ color: '#2c3e50', marginTop: '0' }}>Your Final Score</h2>
        <div style={{ 
          fontSize: '48px', 
          fontWeight: 'bold',
          color: '#27ae60',
          margin: '20px 0'
        }}>
          {displayScore}
        </div>
        <p style={{ color: '#7f8c8d' }}>
          Healthy Tiles Remaining
        </p>
        {totalTiles > displayScore && (
          <p style={{ fontSize: '14px', color: '#95a5a6', marginTop: '10px' }}>
            (Out of {totalTiles} total tiles claimed)
          </p>
        )}
      </div>
      
      <p>Thank you for participating! Your results have been saved.</p>
      
      <div className="complete-buttons" style={{marginTop: '40px'}}>
        <button 
          className="new-participant-button"
          onClick={startNewSession}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: '#4a8',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          New Participant
        </button>
      </div>
      
      {/* Optional: Debug info that you can comment out in production */}
      {/*
      <div style={{ marginTop: '30px', fontSize: '12px', color: '#999', textAlign: 'left', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
        <strong>Debug Info:</strong><br/>
        {debugInfo}
      </div>
      */}
    </div>
  );
}

export default SessionCompleteScreen;