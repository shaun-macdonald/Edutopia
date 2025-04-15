import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

// Global timer state
let globalTimerInterval = null;

// Initialize the global timer if it's not already running
export function initGlobalTimer() {
  // Only start if research mode is active and not already running
  if (localStorage.getItem("researchMode") === "true" && !globalTimerInterval) {
    const updateTimer = () => {
      const currentTime = localStorage.getItem("sessionTimeRemaining");
      if (!currentTime) return;
      
      const timeNumber = parseInt(currentTime);
      if (timeNumber <= 0) {
        // Time's up - handle session end
        clearInterval(globalTimerInterval);
        globalTimerInterval = null;
        
        // Check if already completed to prevent multiple exports
        if (localStorage.getItem("sessionCompleted") !== "true") {
          // Export data automatically
          DataManager.exportResearchData();
          
          // Mark as completed and exported
          localStorage.setItem("sessionCompleted", "true");
          localStorage.setItem("dataExported", "true");
        }
        return;
      }
      
      // Update timer
      localStorage.setItem("sessionTimeRemaining", (timeNumber - 1).toString());
    };
    
    // Start interval (run every second)
    globalTimerInterval = setInterval(updateTimer, 1000);
    
    // Setup cleanup on page unload
    window.addEventListener('beforeunload', () => {
      if (globalTimerInterval) {
        clearInterval(globalTimerInterval);
      }
    });
  }
}

// Stop the global timer
export function stopGlobalTimer() {
  if (globalTimerInterval) {
    clearInterval(globalTimerInterval);
    globalTimerInterval = null;
  }
}

// ==========================================
// DATA MANAGEMENT FUNCTIONS
// ==========================================

export const DataManager = {
  // Save user name and start session
  saveUserName: (name) => {
    localStorage.setItem("userName", name.trim());
    localStorage.setItem("sessionStartTime", Date.now().toString());
    
    // Clear any existing question timings for a fresh start
    localStorage.removeItem("questionTimings");
    
    // Clear any previous session flags
    localStorage.removeItem("sessionCompleted");
    localStorage.removeItem("dataExported");
    
    // Initialize timer when starting a new session - always 10 minutes for research
    const sessionDuration = parseInt(localStorage.getItem("sessionDuration") || "10");
    localStorage.setItem("sessionTimeRemaining", (sessionDuration * 60).toString());
    
    // Start the global timer
    initGlobalTimer();
    
    return name;
  },
  
  // Get current user name
  getUserName: () => {
    return localStorage.getItem("userName") || "Anonymous";
  },
  
  // Save question timing data
  saveQuestionTiming: (questionId, timeSpentMs, wasCorrect) => {
    const timingData = { questionId, timeSpentMs, wasCorrect };
    const existingData = JSON.parse(localStorage.getItem("questionTimings") || "[]");
    localStorage.setItem("questionTimings", JSON.stringify([...existingData, timingData]));
  },
  
  // Update tile count
  saveTileCount: (count) => {
    // Update existing game state with new count
    const gameState = JSON.parse(localStorage.getItem("gameState") || "{}");
    gameState.tileCount = count;
    localStorage.setItem("gameState", JSON.stringify(gameState));
    console.log("Saved tile count to localStorage:", count);
    return count;
  },
  
  // Export all data as a JSON file
  exportResearchData: () => {
    // Check if we've already exported data in this session
    if (localStorage.getItem("dataExported") === "true") {
      console.log("Data already exported for this session");
      return;
    }
    
    const userName = localStorage.getItem("userName") || "Anonymous";
    const gameState = JSON.parse(localStorage.getItem("gameState") || "{}");
    const questionTimings = JSON.parse(localStorage.getItem("questionTimings") || "[]");
    const sessionStartTime = localStorage.getItem("sessionStartTime");
    const sessionDuration = localStorage.getItem("sessionDuration") || "10";
    
    // Get the current tile counts directly from the game scene if possible
    let totalTileCount = 0;
    let healthyTileCount = 0;
    
    if (window.phaserGame && window.phaserGame.scene && window.phaserGame.scene.scenes[0]) {
      const gameScene = window.phaserGame.scene.scenes[0];
      if (gameScene.ownedTiles) {
        // Total tiles bought (all tiles)
        totalTileCount = gameScene.ownedTiles.length;
        
        // Healthy tiles (only non-red tiles)
        healthyTileCount = gameScene.countHealthyTiles ? 
          gameScene.countHealthyTiles() : 
          gameScene.ownedTiles.filter(tile => tile.health > 0).length;
          
        console.log("Getting tile counts directly from game scene - Total:", totalTileCount, "Healthy:", healthyTileCount);
      }
    } else {
      // Fallback to stored data
      if (gameState.ownedTiles) {
        totalTileCount = gameState.ownedTiles.length;
        healthyTileCount = gameState.ownedTiles.filter(tile => tile.health > 0).length;
        console.log("Using stored tiles data - Total:", totalTileCount, "Healthy:", healthyTileCount);
      } else {
        // Use whatever is stored in tileCount (should be healthy tiles count)
        healthyTileCount = gameState.tileCount || 0;
        totalTileCount = healthyTileCount; // Best guess if we don't have owned tiles data
        console.log("Fallback to stored tileCount:", healthyTileCount);
      }
    }
    
    const currentTime = Date.now();
    const totalTimeMs = sessionStartTime ? currentTime - parseInt(sessionStartTime) : 0;
    const sessionTimestamp = new Date().toISOString();
    
    const exportData = {
      participant: userName,
      sessionDate: sessionTimestamp,
      sessionDuration: parseInt(sessionDuration),
      totalTimeSpentMs: totalTimeMs,
      totalTilesBought: totalTileCount,
      healthyTilesRemaining: healthyTileCount,
      finalResources: gameState.resources || {},
      questionData: questionTimings,
    };
    
    console.log("Exporting research data with tile counts - Total:", totalTileCount, "Healthy:", healthyTileCount);
    
    // Create downloadable file
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    // Save to localStorage with unique key for this session
    const sessionKey = `edutopia_session_${userName}_${sessionTimestamp.replace(/[:.]/g, '-')}`;
    localStorage.setItem(sessionKey, dataStr);
    
    // Create download
    const link = document.createElement('a');
    link.download = `edutopia_data_${userName}_${sessionTimestamp.slice(0,10)}.json`;
    link.href = url;
    link.click();
    
    // Mark as exported
    localStorage.setItem("dataExported", "true");
    
    return sessionKey;
  },
  
  // Email data forwarding function
  emailResearchData: () => {
    const userName = localStorage.getItem("userName") || "Anonymous";
    const gameState = JSON.parse(localStorage.getItem("gameState") || "{}");
    const questionTimings = JSON.parse(localStorage.getItem("questionTimings") || "[]");
    
    // Calculate tile counts as you already do in exportResearchData
    let totalTileCount = 0;
    let healthyTileCount = 0;
    
    if (window.phaserGame && window.phaserGame.scene && window.phaserGame.scene.scenes[0]) {
      const gameScene = window.phaserGame.scene.scenes[0];
      if (gameScene.ownedTiles) {
        totalTileCount = gameScene.ownedTiles.length;
        healthyTileCount = gameScene.countHealthyTiles ? 
          gameScene.countHealthyTiles() : 
          gameScene.ownedTiles.filter(tile => tile.health > 0).length;
      }
    } else if (gameState.ownedTiles) {
      totalTileCount = gameState.ownedTiles.length;
      healthyTileCount = gameState.ownedTiles.filter(tile => tile.health > 0).length;
    } else {
      healthyTileCount = gameState.tileCount || 0;
      totalTileCount = healthyTileCount;
    }
    
    const sessionTimestamp = new Date().toISOString();
    
    // Create the JSON data
    const exportData = {
      participant: userName,
      sessionDate: sessionTimestamp,
      totalTilesBought: totalTileCount,
      healthyTilesRemaining: healthyTileCount,
      finalResources: gameState.resources || {},
      questionData: questionTimings,
    };
    
    // Convert to a string with nice formatting
    const dataStr = JSON.stringify(exportData, null, 2);
    
    // Create a mailto link with the data
    const subject = `Edutopia Research Data - ${userName} - ${new Date().toLocaleDateString()}`;
    const emailBody = `Here is my Edutopia game data:\n\n${dataStr}\n\nThis data was automatically generated by the Edutopia game.`;
    
    // URL encode the body and subject
    const mailtoUrl = `mailto:YOUR_UNIVERSITY_EMAIL@example.edu?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
    
    // Open the email client
    window.location.href = mailtoUrl;
    
    return true;
  },
  
  // Export all sessions as a single file
  exportAllSessions: () => {
    const sessions = [];
    
    // Find all session keys in localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('edutopia_session_')) {
        try {
          const sessionData = JSON.parse(localStorage.getItem(key));
          sessions.push(sessionData);
        } catch (e) {
          console.error("Error parsing session data:", e);
        }
      }
    }
    
    // Create downloadable file with all sessions
    const dataStr = JSON.stringify(sessions, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.download = `edutopia_all_sessions_${new Date().toISOString().slice(0,10)}.json`;
    link.href = url;
    link.click();
  }
};

// ==========================================
// USER NAME ENTRY COMPONENT
// ==========================================

export function UserNameEntry() {
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (userName.trim()) {
      // Save user name and start session
      DataManager.saveUserName(userName);
      
      // Get URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const destination = urlParams.get("destination") || "game";
      const mode = urlParams.get("mode") || "standard";
      
      // Navigate to the appropriate destination with the selected mode
      navigate(`/${destination}?mode=${mode}`);
    }
  };
  
  return (
    <div className="user-entry-container">
      <h2>Welcome to Edutopia</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="userName">Please enter your name:</label>
          <input 
            type="text" 
            id="userName" 
            value={userName} 
            onChange={(e) => setUserName(e.target.value)}
            required
            placeholder="Your name"
            className="name-input"
          />
        </div>
        <button type="submit" className="start-button">Start Game</button>
      </form>
    </div>
  );
}

// ==========================================
// EXPORT DATA BUTTON COMPONENT
// ==========================================

export function ExportDataButton() {
  return (
    <button 
      className="export-data-button" 
      onClick={DataManager.exportResearchData}
      title="Export research data as JSON file"
    >
      Export Research Data
    </button>
  );
}

// ==========================================
// SESSION COMPLETE COMPONENT
// ==========================================

export function SessionCompleteScreen() {
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const [totalTiles, setTotalTiles] = useState(0);
  
  useEffect(() => {
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
        healthyTileCount = gameScene.countHealthyTiles ? 
          gameScene.countHealthyTiles() : 
          gameScene.ownedTiles.filter(tile => tile.health > 0).length;
      }
    } else if (gameState.ownedTiles) {
      totalTileCount = gameState.ownedTiles.length;
      healthyTileCount = gameState.ownedTiles.filter(tile => tile.health > 0).length;
    } else {
      // Fallback to the stored tileCount
      healthyTileCount = gameState.tileCount || 0;
      totalTileCount = healthyTileCount; // Best guess
    }
    
    setScore(healthyTileCount);
    setTotalTiles(totalTileCount);
    
    // Export data if not already done
    if (localStorage.getItem("dataExported") !== "true") {
      if (window.DataManager && window.DataManager.exportResearchData) {
        window.DataManager.exportResearchData();
        localStorage.setItem("dataExported", "true");
      }
    }
    
    // Stop the timer if it's still running
    stopGlobalTimer();
  }, []);
  
  const startNewSession = () => {
    // Clear current user data but keep completed sessions
    localStorage.removeItem("userName");
    localStorage.removeItem("sessionStartTime");
    localStorage.removeItem("sessionTimeRemaining");
    localStorage.removeItem("gameState");
    localStorage.removeItem("sessionCompleted");
    localStorage.removeItem("dataExported");
    localStorage.removeItem("questionTimings"); // Clear question timings for new session
    
    // Navigate to start screen
    navigate("/");
  };
  
  const handleEmailData = () => {
    if (window.DataManager && window.DataManager.emailResearchData) {
      window.DataManager.emailResearchData();
    }
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
      
      <div className="send-data-section" style={{
        marginTop: '30px',
        padding: '15px',
        backgroundColor: '#f0f7ff',
        borderRadius: '8px',
        border: '1px solid #d0e3ff'
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#2c5282' }}>Share Your Results</h3>
        <p style={{ fontSize: '14px', marginBottom: '15px' }}>
          Please share your results with the research team by clicking the button below:
        </p>
        <button 
          onClick={handleEmailData}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3182ce',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Email My Results
        </button>
      </div>
      
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
    </div>
  );
}

// ==========================================
// RESEARCH ADMIN COMPONENT
// ==========================================

export function ResearchAdmin() {
  const [sessions, setSessions] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isAdmin) {
      // Find all session data
      const sessionData = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('edutopia_session_')) {
          try {
            const data = JSON.parse(localStorage.getItem(key));
            sessionData.push({
              key,
              participant: data.participant,
              date: data.sessionDate,
              duration: data.sessionDuration,
              questions: data.questionData?.length || 0,
              healthyTiles: data.healthyTilesRemaining || data.tileCount || 0,
              totalTiles: data.totalTilesBought || data.tileCount || 0
            });
          } catch (e) {
            console.error("Error parsing session:", e);
          }
        }
      }
      setSessions(sessionData);
    }
  }, [isAdmin]);
  
  const handleLogin = (e) => {
    e.preventDefault();
    // Simple password for research admin
    if (password === 'research123') {
      setIsAdmin(true);
    } else {
      alert('Incorrect password');
    }
  };
  
  const handleBack = () => {
    navigate("/");
  };
  
  if (!isAdmin) {
    return (
      <div className="research-login" style={{
        maxWidth: '400px',
        margin: '100px auto',
        padding: '20px',
        textAlign: 'center'
      }}>
        <h2>Research Admin</h2>
        <form onSubmit={handleLogin}>
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter research password"
            style={{
              padding: '8px 12px',
              width: '100%',
              marginBottom: '20px'
            }}
          />
          <button 
            type="submit"
            style={{
              padding: '10px 20px',
              backgroundColor: '#48a',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            Login
          </button>
          <button 
            type="button" 
            onClick={handleBack}
            style={{
              padding: '10px 20px',
              backgroundColor: '#aaa',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Back
          </button>
        </form>
      </div>
    );
  }
  
  return (
    <div className="research-admin" style={{
      padding: '20px',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h2>Research Data Management</h2>
      
      <div className="admin-info">
        <p>Research sessions are set to a fixed 10 minute duration.</p>
      </div>
      
      <div className="admin-actions" style={{
        marginBottom: '30px'
      }}>
        <button 
          className="export-all-button"
          onClick={DataManager.exportAllSessions}
          style={{
            padding: '10px 20px',
            backgroundColor: '#48a',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Export All Sessions
        </button>
        
        <button 
          className="back-button"
          onClick={handleBack}
          style={{
            padding: '10px 20px',
            backgroundColor: '#aaa',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Back to Main Menu
        </button>
      </div>
      
      <div className="session-list">
        <h3>Completed Sessions ({sessions.length})</h3>
        {sessions.length === 0 ? (
          <p>No completed sessions found.</p>
        ) : (
          <table style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}>
            <thead>
              <tr style={{backgroundColor: '#f2f2f2'}}>
                <th style={{padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd'}}>Participant</th>
                <th style={{padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd'}}>Date</th>
                <th style={{padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd'}}>Duration</th>
                <th style={{padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd'}}>Questions</th>
                <th style={{padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd'}}>Healthy Tiles</th>
                <th style={{padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd'}}>Total Tiles</th>
                <th style={{padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map(session => (
                <tr key={session.key} style={{borderBottom: '1px solid #ddd'}}>
                  <td style={{padding: '8px'}}>{session.participant}</td>
                  <td style={{padding: '8px'}}>{new Date(session.date).toLocaleString()}</td>
                  <td style={{padding: '8px'}}>{session.duration} min</td>
                  <td style={{padding: '8px'}}>{session.questions}</td>
                  <td style={{padding: '8px'}}>{session.healthyTiles}</td>
                  <td style={{padding: '8px'}}>{session.totalTiles}</td>
                  <td style={{padding: '8px'}}>
                    <button 
                      onClick={() => {
                        const data = localStorage.getItem(session.key);
                        const blob = new Blob([data], {type: 'application/json'});
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `${session.key}.json`;
                        link.click();
                      }}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#4a8',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer'
                      }}
                    >
                      Export
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ==========================================
// TIMER DISPLAY COMPONENT
// ==========================================

export function TimerDisplay() {
  const [timeDisplay, setTimeDisplay] = useState(() => {
    // Initialize with current time to avoid flashing
    const currentTime = localStorage.getItem("sessionTimeRemaining");
    if (!currentTime) return "00:00";
    
    const timeNumber = parseInt(currentTime);
    const minutes = Math.floor(timeNumber / 60);
    const seconds = timeNumber % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  });
  
  const [color, setColor] = useState("#00cc00");
  const navigate = useNavigate();

  useEffect(() => {
    // Make sure the global timer is running
    initGlobalTimer();
    
    // Update display every 500ms (more frequent than the actual timer)
    const displayInterval = setInterval(() => {
      const currentTime = localStorage.getItem("sessionTimeRemaining");
      if (!currentTime) return;
      
      const timeNumber = parseInt(currentTime);
      
      // Format time
      const minutes = Math.floor(timeNumber / 60);
      const seconds = timeNumber % 60;
      setTimeDisplay(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      
      // Update color
      if (timeNumber <= 60) {
        setColor("#ff0000"); // Red in last minute
      } else if (timeNumber <= 300) {
        setColor("#ff9900"); // Orange in last 5 minutes
      } else {
        setColor("#00cc00"); // Green otherwise
      }
      
      // Check if time is up
      if (timeNumber <= 0 && localStorage.getItem("sessionCompleted") === "true") {
        clearInterval(displayInterval);
        // Navigate to completion screen
        navigate("/session-complete");
      }
    }, 500);
    
    return () => {
      clearInterval(displayInterval);
    };
  }, [navigate]);

  return (
    <div className="timer-display" style={{
      padding: '8px 15px',
      backgroundColor: 'rgba(0,0,0,0.15)',
      borderRadius: '4px',
      fontWeight: 'bold',
      color: color,
      position: 'fixed',
      top: '15px',
      right: '15px',
      zIndex: 1000,
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
    }}>
      ⏱️ {timeDisplay}
    </div>
  );
}

// ==========================================
// QUESTION TIMER HOOK
// ==========================================

export function useQuestionTimer() {
  const [questionStartTime, setQuestionStartTime] = useState(null);
  
  // Reset timer when used
  const resetTimer = () => {
    setQuestionStartTime(Date.now());
  };
  
  // Record answer timing
  const recordAnswer = (questionId, wasCorrect) => {
    const endTime = Date.now();
    const timeSpentMs = endTime - questionStartTime;
    
    // Save timing data
    DataManager.saveQuestionTiming(questionId, timeSpentMs, wasCorrect);
    
    return timeSpentMs;
  };
  
  // Initialize on first render
  useEffect(() => {
    resetTimer();
  }, []);
  
  return { resetTimer, recordAnswer };
}

// Make DataManager available as default export too
export default DataManager;