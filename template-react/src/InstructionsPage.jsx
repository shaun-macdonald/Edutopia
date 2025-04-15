// InstructionsPage.jsx
import { Link } from "react-router-dom";

const InstructionsPage = () => {
  return (
    <div className="instructions-page">
      <h1>How to Play Edutopia</h1>
      
      <div className="instructions-content">
        <section>
          <h2>Game Objective</h2>
          <p>
            Build and expand your village into a thriving metropolis by 
            gathering resources and managing your tiles efficiently.
          </p>
        </section>
        
        <section>
          <h2>Resources</h2>
          <ul>
            <li><strong>🍞 Food</strong> - Found in grassland hexes</li>
            <li><strong>🌲 Wood</strong> - Harvested from forest hexes</li>
            <li><strong>🏗 Metal</strong> - Mined from rocky/sandy hexes</li>
            <li><strong>🧠 Tech</strong> - Earned by answering quiz questions correctly</li>
          </ul>
        </section>
        
        <section>
          <h2>Gameplay</h2>
          <ol>
            <li><strong>Claiming Tiles</strong>: Click on hexes adjacent to your territory to claim them (Youor start point is the bottom left, dark tile)
              <ul>
                <li>Each hex costs 5 resources of its type to claim (e.g., food tiles cost 5 food)</li>
              </ul>
            </li>
            <li><strong>Resource Generation</strong>: Press "End Turn" to collect resources from your owned tiles, click end turn 5 times at the start to have enough for your first tile.
              <ul>
                <li>Each healthy tile produces 1 resource per turn</li>
                <li>Village tile always produces 1 of each resource type</li>
              </ul>
            </li>
            <li><strong>Tile Maintenance</strong>:
              <ul>
                <li>Tiles degrade by 10% health each turn</li>
                <li>When a tile reaches 0 health, it turns red and stops producing resources</li>
                <li>You can repair damaged tiles with Tech points by clicking on them</li>
              </ul>
            </li>
            <li><strong>Tech Points</strong>:
              <ul>
                <li>Earn Tech points by answering quiz questions correctly</li>
                <li>Use Tech points to repair damaged tiles or upgrade storage capacity</li>
              </ul>
            </li>
            <li><strong>Storage</strong>:
              <ul>
                <li>Each resource has a storage limit - resources collected beyond this limit are lost</li>
                <li>Click "Upgrade Storage" to increase storage capacity (costs 1 Tech point)</li>
              </ul>
            </li>
          </ol>
        </section>
        
        <section>
          <h2>Scoring</h2>
          <p>Your final score is determined by the number of healthy (non-red) tiles you have at the end of the game.</p>
        </section>
        
        <section>
          <h2>Research Mode</h2>
          <p>In research mode, you have 10 minutes to build your Edutopia. Use your time wisely!</p>
        </section>
        
        <section>
          <h2>Important Notes</h2>
          <ul>
            <li>Please do not return to the main screen once the game has started.</li>
            <li>If you try to buy or fix a tile and you have the required resources but nothing happens, click "End Turn" to update the game state.</li>
          </ul>
        </section>
      </div>
      
      <div className="nav-buttons">
        <Link to="/">
          <button className="back-button">Back to Start</button>
        </Link>
      </div>
    </div>
  );
};

export default InstructionsPage;