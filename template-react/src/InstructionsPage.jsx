import { Link } from "react-router-dom";

const InstructionsPage = () => {
  return (
    <div className="instructions-page" style={{
      padding: "20px",
      maxWidth: "800px",
      margin: "0 auto",
      fontSize: "16px",
      color: "#ffffff"
    }}>
      <h1 style={{ textAlign: "center" }}>How to Play Edutopia</h1>
      
      <div className="instructions-content">
        <div style={{ 
          backgroundColor: "#2c3e50", 
          padding: "15px", 
          borderRadius: "8px",
          marginBottom: "20px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.3)"
        }}>
          <h2 style={{ fontSize: "1.3em", marginTop: "0", color: "#3498db" }}>Objective & Controls</h2>
          <ul style={{ paddingLeft: "20px" }}>
            <li><strong>Goal:</strong> Build and expand your village by gathering resources and managing tiles</li>
            <li><strong>Starting Point:</strong> Bottom left dark tile is your village</li>
            <li><strong>Claiming Tiles:</strong> Click adjacent hexes (costs 5 resources of the tile's type)</li>
            <li><strong>End Turn:</strong> Click to generate resources (5 turns at start to gather enough)</li>
            <li><strong>Tile Health:</strong> Tiles degrade 10% per turn; repair with Tech points</li>
          </ul>
        </div>

        <div style={{ 
          backgroundColor: "#1a365d", 
          padding: "15px", 
          borderRadius: "8px",
          marginBottom: "20px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.3)"
        }}>
          <h2 style={{ fontSize: "1.3em", marginTop: "0", color: "#63b3ed" }}>Resources</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ flex: "1", minWidth: "180px" }}>
              <p><strong>🍞 Food:</strong> Grassland hexes</p>
              <p><strong>🌲 Wood:</strong> Forest hexes</p>
            </div>
            <div style={{ flex: "1", minWidth: "180px" }}>
              <p><strong>🏗 Metal:</strong> Rocky/sandy hexes</p>
              <p><strong>🧠 Tech:</strong> From quiz questions</p>
            </div>
          </div>
          <p><strong>Note:</strong> Village produces 1 of each resource per turn</p>
        </div>
        
        <div style={{ 
          backgroundColor: "#553c9a", 
          padding: "15px", 
          borderRadius: "8px",
          marginBottom: "20px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.3)"
        }}>
          <h2 style={{ fontSize: "1.3em", marginTop: "0", color: "#d6bcfa" }}>Key Mechanics</h2>
          <ul style={{ paddingLeft: "20px" }}>
            <li><strong>Storage Limits:</strong> Each resource has a cap - upgrade with Tech (1 point)</li>
            <li><strong>Tile Health:</strong> Dark red tiles (0 health) don't produce resources</li>
            <li><strong>Scoring:</strong> Your final score is the number of healthy (non- dark red) tiles</li>
            <li><strong>Tech Points:</strong> Used to repair tiles or upgrade storage</li>
            <li><strong>Tech Points:</strong> Gained By answering question in Quiz Page</li>
          </ul>
        </div>
        
        <div style={{ 
          backgroundColor: "#742a2a", 
          padding: "15px", 
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.3)"
        }}>
          <h2 style={{ fontSize: "1.3em", marginTop: "0", color: "#feb2b2" }}>Important Notes</h2>
          <ul style={{ paddingLeft: "20px" }}>
            <li>Don't return to the main screen once the game has started</li>
            <li>If claiming/repairing doesn't work, try clicking "End Turn"</li>
            <li>Research mode has a 10-minute time limit</li>
          </ul>
        </div>
      </div>
      
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginTop: '30px'
      }}>
        <button 
          onClick={() => window.history.back()} 
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#27ae60',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Return to Game
        </button>
      </div>
    </div>
  );
};

export default InstructionsPage;