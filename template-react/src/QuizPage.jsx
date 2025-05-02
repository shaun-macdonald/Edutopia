import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuestionTimer, TimerDisplay } from './ResearchDataFeatures.jsx';
import "./quizstyle.css";

function QuizPage({ updateTech }) {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const { resetTimer, recordAnswer } = useQuestionTimer();
  
  // Add these new states for difficulty management
  const [currentDifficulty, setCurrentDifficulty] = useState("easy");
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  
  // Check if research mode is active
  const isResearchMode = localStorage.getItem("researchMode") === "true";

  const selectQuestionByDifficulty = (allQuestions, difficulty) => {
    if (!allQuestions || !Array.isArray(allQuestions) || allQuestions.length === 0) {
      console.error("No questions available to select from");
      return;
    }
    
    // Add this section to ensure challenging mode never shows easy questions
    const urlParams = new URLSearchParams(window.location.search);
    const gameMode = urlParams.get("mode") || "standard";
    
    // For challenging mode, enforce medium as minimum difficulty
    let actualDifficulty = difficulty;
    if (gameMode === "challenging" && difficulty === "easy") {
      actualDifficulty = "medium";
      console.log("Enforcing medium difficulty minimum for challenging mode");
    }
    
    const filteredQuestions = allQuestions.filter(q => q.difficulty === actualDifficulty);
    
    if (filteredQuestions.length === 0) {
      console.warn(`No questions found with difficulty: ${actualDifficulty}`);
      const randomIndex = Math.floor(Math.random() * allQuestions.length);
      setCurrentQuestion(allQuestions[randomIndex]);
    } else {
      const randomIndex = Math.floor(Math.random() * filteredQuestions.length);
      setCurrentQuestion(filteredQuestions[randomIndex]);
    }
    
    // Reset the timer when a new question is selected
    resetTimer();
  };

  // Load questions and set initial difficulty based on game mode
  useEffect(() => {
    // Get game mode from URL
    const urlParams = new URLSearchParams(window.location.search);
    const gameMode = urlParams.get("mode") || "standard"; // Default to standard
    
    // Set initial difficulty based on game mode
    const initialDifficulty = gameMode === "challenging" ? "medium" : "easy";
    setCurrentDifficulty(initialDifficulty);
    
    fetch("/data/questions.json")
      .then((response) => response.json())
      .then((data) => {
        console.log("Loaded questions data:", data); // Debug log
        
        // Check if data is an array (direct questions array)
        if (Array.isArray(data)) {
          console.log("Data is a direct array of questions, using as is");
          setQuestions(data);
          selectQuestionByDifficulty(data, initialDifficulty);
        }
        // or if its an object with a questions property (our expected format)
        else if (data && data.questions && Array.isArray(data.questions)) {
          console.log("Data has questions property, using data.questions");
          setQuestions(data.questions);
          selectQuestionByDifficulty(data.questions, initialDifficulty);
        } 
        
        else {
          console.error("Invalid questions data format:", data);
          setQuestions([]);
        }
      })
      .catch((error) => console.error("Error loading questions:", error));
  }, []);

  const handleOptionSelect = (optionIndex) => {
    setSelectedOption(optionIndex);
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;
    
    // Debug logging
    console.log("=== ANSWER CHECKING DEBUG ===");
    console.log(`You selected option: ${selectedOption} (${typeof selectedOption})`);
    console.log(`Correct answer is: ${currentQuestion.correctAnswer} (${typeof currentQuestion.correctAnswer})`);
    
    // Determine if the answer is correct
    let correct = false;
    
    // If correctnswer is a number or can be converted to a number
    if (!isNaN(Number(currentQuestion.correctAnswer))) {
      // Compare by index
      correct = Number(selectedOption) === Number(currentQuestion.correctAnswer);
    } else {
      // Compare by option text
      correct = currentQuestion.options[selectedOption] === currentQuestion.correctAnswer;
    }
    
    console.log(`RESULT: ${correct ? "CORRECT! ✓" : "INCORRECT! ✗"}`);
    console.log("==========");
    
    // Record timing data for the question
    const questionId = currentQuestion.id || `question-${currentDifficulty}-${currentQuestion.question.substring(0, 20)}`;
    const timeSpent = recordAnswer(questionId, correct);
    console.log(`Question answered in ${timeSpent}ms`);
    
    setIsCorrect(correct);
    
    
    const urlParams = new URLSearchParams(window.location.search);
    const gameMode = urlParams.get("mode") || "standard"; 
    if (correct) {
      // Add tech points for correct answer
      updateTech(1);
      
      // Increment consecutive correct counter
      setConsecutiveCorrect(prev => prev + 1);
      
      // Apply difficulty progression based on game mode
      if (gameMode === "challenging") {
        // Challenging mode: 1 correct medium to hard
        if (currentDifficulty === "medium" && consecutiveCorrect + 1 >= 1) {
          setCurrentDifficulty("hard");
          setConsecutiveCorrect(0); 
          console.log("Advancing to hard difficulty!");
        }
      } else {
        // Standard mode 2 correct easy to medium, 2 correct medium to hard
        if (currentDifficulty === "easy" && consecutiveCorrect + 1 >= 2) {
          setCurrentDifficulty("medium");
          setConsecutiveCorrect(0);
          console.log("Advancing to medium difficulty!");
        } else if (currentDifficulty === "medium" && consecutiveCorrect + 1 >= 2) {
          setCurrentDifficulty("hard");
          setConsecutiveCorrect(0);
          console.log("Advancing to hard difficulty!");
        }
      }
    } else {
      // Handle incorrect answer
      if (gameMode === "challenging") {
        // In challenging mode donnt go below  medium difficulty
        if (currentDifficulty === "hard") {
          setCurrentDifficulty("medium");
          setConsecutiveCorrect(0);
          console.log("Dropping to medium difficulty (minimum for challenging mode)!");
        }
        
      } else {
        // In standard mode, drop one level 
        if (currentDifficulty === "hard") {
          setCurrentDifficulty("medium");
          setConsecutiveCorrect(0);
          console.log("Dropping to medium difficulty!");
        } else if (currentDifficulty === "medium") {
          setCurrentDifficulty("easy");
          setConsecutiveCorrect(0);
          console.log("Dropping to easy difficulty!");
        }
      }
    }
  };

  const handleContinue = () => {
    setSelectedOption(null);
    setIsCorrect(null);
    selectQuestionByDifficulty(questions, currentDifficulty);
  };

  const handleReturn = () => {
    navigate("/game");
  };

  if (!currentQuestion) return <div className="quiz-loading">Loading...</div>;

  return (
    <div className="quiz-container">
      {/* Show timer if in research mode */}
      {isResearchMode && <TimerDisplay />}
    
      <button className="back-to-game" onClick={handleReturn}>
        Back to Game
      </button>
      
      <div style={{
        position: 'absolute', 
        top: '20px', 
        right: '20px', 
        padding: '10px',
        background: 'rgba(0,0,0,0.3)',
        borderRadius: '5px'
      }}>
        Difficulty: {currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1)}
        
      </div>
      
      <div className="question-area">
        <h3 className="question-text">{currentQuestion.question}</h3>
      </div>
      
      <div className="options-area">
        <div className="options-grid">

          {currentQuestion.options.map((option, index) => (
            <div
              key={index}
              className={`option-button ${selectedOption === index ? "selected" : ""}`}
              onClick={() => handleOptionSelect(index)}
            >
              <div className="option-letter">{String.fromCharCode(65 + index)}</div>
              <div className="option-text">{option}</div>
            </div>
          ))}
        </div>
        
        {isCorrect === null ? (
          <button 
            className="submit-button" 
            onClick={handleSubmit}
            disabled={selectedOption === null}
          >
            Submit Answer
          </button>
        ) : (
          <div className={`feedback ${isCorrect ? "correct" : "incorrect"}`}>
            <p>{isCorrect ? "Correct!" : "Incorrect!"}</p>
            <button className="submit-button" onClick={handleContinue}>
              Next Question
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuizPage;