// TimerDisplay.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataManager from './ResearchDataFeatures';

// Timer Service f  unctions
export function initTimer(durationMinutes) {
  // Set the end time
  const now = Date.now();
  const endTime = now + (durationMinutes * 60 * 1000);
  
  // Save to localStorage to persist between refreshes
  localStorage.setItem("timerEndTime", endTime.toString());
  
  return getTimeRemaining();
}

export function getTimeRemaining() {
  const now = Date.now();
  const stored = localStorage.getItem("timerEndTime");
  
  if (!stored) return 0;
  
  const end = parseInt(stored);
  const remaining = Math.max(0, Math.floor((end - now) / 1000));
  
  return remaining;
}

export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function isTimerExpired() {
  return getTimeRemaining() <= 0;
}

export function clearTimer() {
  localStorage.removeItem("timerEndTime");
}

// Timer Display Component
function TimerDisplay() {
  const [timeString, setTimeString] = useState(formatTime(getTimeRemaining()));
  const navigate = useNavigate();
  
  useEffect(() => {
    // Update every half second
    const interval = setInterval(() => {
      const remaining = getTimeRemaining();
      setTimeString(formatTime(remaining));
      
      // Check if timer expired
      if (remaining <= 0) {
        // Export data and navigate to completion
        DataManager.exportResearchData();
        localStorage.setItem("sessionCompleted", "true");
        navigate('/session-complete');
        clearInterval(interval);
      }
    }, 500);
    
    return () => clearInterval(interval);
  }, [navigate]);
  
  // color based on time remaining
  const getColor = () => {
    const seconds = getTimeRemaining();
    if (seconds <= 60) return "#ff0000"; 
    if (seconds <= 300) return "#ff9900"; 
    return "#00cc00"; 
  };
  
  return (
    <div style={{
      padding: '8px 15px',
      backgroundColor: 'rgba(0,0,0,0.15)',
      borderRadius: '4px',
      fontWeight: 'bold',
      color: getColor(),
      position: 'fixed',
      top: '15px',
      right: '15px',
      zIndex: 1000,
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
    }}>
      ⏱️ {timeString}
    </div>
  );
}

export default TimerDisplay;