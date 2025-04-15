import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataManager from './ResearchDataFeatures.jsx';

export function useSessionTimer(duration) {
  const [timeRemaining, setTimeRemaining] = useState(duration * 60); // Convert minutes to seconds
  const [isActive, setIsActive] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isActive || timeRemaining <= 0) return;
    
    const timerId = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerId);
          handleSessionEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timerId);
  }, [timeRemaining, isActive]);
  
  const handleSessionEnd = () => {
    // Export research data automatically
    DataManager.exportResearchData();
    
    // Set session as completed
    localStorage.setItem("sessionCompleted", "true");
    
    // Navigate to completion screen
    navigate("/session-complete");
  };
  
  const pauseTimer = () => setIsActive(false);
  const resumeTimer = () => setIsActive(true);
  
  const formatTime = () => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  return { 
    timeRemaining, 
    formatTime, 
    isActive, 
    pauseTimer, 
    resumeTimer,
    handleSessionEnd 
  };
}

// Timer display component
export function TimerDisplay({ duration }) {
  const { formatTime, timeRemaining } = useSessionTimer(duration);
  
  // Define color based on time remaining
  const getTimerColor = () => {
    if (timeRemaining <= 60) return "#ff0000"; // Red in last minute
    if (timeRemaining <= 300) return "#ff9900"; // Orange in last 5 minutes
    return "#00cc00"; // Green otherwise
  };
  
  return (
    <div className="timer-display" style={{ 
      padding: '8px 15px',
      backgroundColor: 'rgba(0,0,0,0.15)',
      borderRadius: '4px',
      fontWeight: 'bold',
      color: getTimerColor(),
      position: 'fixed',
      top: '15px',
      right: '15px',
      zIndex: 1000,
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
    }}>
      ⏱️ {formatTime()}
    </div>
  );
}