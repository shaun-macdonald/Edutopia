import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function SessionCompleteScreen() {
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const [totalTiles, setTotalTiles] = useState(0);
  const [dataExported, setDataExported] = useState(false);
  
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
    
    // Try to get the most accurate count
    if (window.phaserGame && window.phaserGame.scene && window.phaserGame.scene.scenes[0]) {
      const gameScene = window.phaserGame.scene.scenes[0];
      
      if (gameScene.ownedTiles) {
        totalTileCount = gameScene.ownedTiles.length;
        
        if (gameScene.countHealthyTiles) {
          healthyTileCount = gameScene.countHealthyTiles();
        } else {
          healthyTileCount = gameScene.ownedTiles.filter(tile => tile.health > 0).length;
        }
      }
    } else {
      if (gameState.ownedTiles && gameState.ownedTiles.length > 0) {
        totalTileCount = gameState.ownedTiles.length;
        healthyTileCount = gameState.ownedTiles.filter(tile => tile.health > 0).length;
      } else {
        // Fallback to the stored tileCount
        healthyTileCount = gameState.tileCount || 0;
        totalTileCount = healthyTileCount; // Best guess
      }
    }
    
    setScore(healthyTileCount);
    setTotalTiles(totalTileCount);
    
    // Manually export data if possible
    if (window.DataManager && window.DataManager.exportResearchData) {
      try {
        window.DataManager.exportResearchData();
        console.log("Research data exported automatically");
        setDataExported(true);
      } catch (e) {
        console.error("Error exporting research data:", e);
        setDataExported(false);
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
  
  const handleManualExport = () => {
    if (window.DataManager && window.DataManager.exportResearchData) {
      try {
        localStorage.removeItem("dataExported");
        
        window.DataManager.exportResearchData();
        console.log("Research data exported manually");
        setDataExported(true);
      } catch (e) {
        console.error("Error exporting research data manually:", e);
      }
    }
  };
  
  // Even if we can't calculate a score, show something
  const displayScore = score || 0;
  
  return (
    <div className="session-complete-screen" style={{
      textAlign: 'center',
      padding: '50px 20px',
      maxWidth: '600px',
      margin: '0 auto',
      color: '#ffffff'
    }}>
      <h1>Session Complete!</h1>
      
      <div className="score-display" style={{
        backgroundColor: '#2c3e50',
        padding: '20px',
        borderRadius: '8px',
        margin: '30px auto',
        maxWidth: '400px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
      }}>
        <h2 style={{ color: '#ffffff', marginTop: '0' }}>Your Final Score</h2>
        <div style={{ 
          fontSize: '48px', 
          fontWeight: 'bold',
          color: '#2ecc71',
          margin: '20px 0'
        }}>
          {displayScore}
        </div>
        <p style={{ color: '#ecf0f1' }}>
          Healthy Tiles Remaining
        </p>
        {totalTiles > displayScore && (
          <p style={{ fontSize: '14px', color: '#bdc3c7', marginTop: '10px' }}>
            (Out of {totalTiles} total tiles claimed)
          </p>
        )}
      </div>
      
      {/* Research mode data export options */}
      {localStorage.getItem("researchMode") === "true" && (
        <div className="research-data-section" style={{
          marginTop: '30px',
          backgroundColor: '#1a365d',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #2c5282',
          color: '#ffffff'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#ffffff' }}>Research Data Export</h3>
          
          {dataExported ? (
            <p>Your research data has been automatically exported. If you didn't receive the file, please use the button below.</p>
          ) : (
            <p>Please ensure your research data is exported using the button below:</p>
          )}
          
          <button 
            onClick={handleManualExport}
            style={{
              padding: '12px 24px',
              backgroundColor: '#4299e1',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              margin: '15px 0',
              fontWeight: 'bold'
            }}
          >
            Download Research Data
          </button>
          
          <p style={{
            marginTop: '15px',
            padding: '10px',
            backgroundColor: '#2c5282',
            color: '#ffffff',
            borderRadius: '4px',
            border: '1px solid #4299e1',
            fontWeight: 'bold'
          }}>
            Please email your downloaded file to: <span style={{color: '#90cdf4'}}>u21sm21@abdn.ac.uk</span>
          </p>
        </div>
      )}
      
      <p style={{ marginTop: '25px' }}>Thank you for participating! Your results have been saved.</p>
      
      <div className="complete-buttons" style={{marginTop: '40px'}}>
        <button 
          className="new-participant-button"
          onClick={startNewSession}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: '#27ae60',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          New Participant
        </button>
      </div>
    </div>
  );
}

export default SessionCompleteScreen;