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
            gathering resources and answering educational questions correctly.
          </p>
        </section>
        
        <section>
          <h2>Resources</h2>
          <ul>
            <li><strong>🍞 Food</strong> - Found in grassland hexes</li>
            <li><strong>🌲 Wood</strong> - Harvested from forest hexes</li>
            <li><strong>🏗 Metal</strong> - Mined from rocky/sandy hexes</li>
            <li><strong>🧠 Tech</strong> - Earned by answering quiz questions</li>
          </ul>
        </section>
        
        <section>
          <h2>Gameplay</h2>
          <ol>
            <li>Click on adjacent hexes to your territory to claim them</li>
            <li>Each hex costs resources to claim based on its type</li>
            <li>Press "End Turn" to collect resources from your owned tiles</li>
            <li>Take quizzes to earn valuable Tech points</li>
            <li>Expand your territory to build your Edutopia!</li>
          </ol>
        </section>
      </div>
      
      <div className="nav-buttons">
        <Link to="/">
          <button className="back-button">Back to Start</button>
        </Link>
        
        <Link to="/game">
          <button className="play-button">Play Now</button>
        </Link>
      </div>
    </div>
  );
};

export default InstructionsPage;