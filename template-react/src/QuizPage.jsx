import { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Make sure this import is included
import "./QuizStyle.css";

const QuizPage = ({ updateTech }) => {
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [selectedOption, setSelectedOption] = useState("");
    const [feedback, setFeedback] = useState("");
    const [showFeedback, setShowFeedback] = useState(false);

    // Fetch questions from JSON
    useEffect(() => {
        fetch("/data/questions.json")
            .then(res => res.json())
            .then(data => {
                setQuestions(data);
                setCurrentQuestion(data[Math.floor(Math.random() * data.length)]);
            })
            .catch(err => console.error("Error loading questions:", err));
    }, []);

    // Handle answer selection
    const handleOptionSelect = (option) => {
        setSelectedOption(option);
    };

    // Check the answer
    const checkAnswer = () => {
        if (!currentQuestion || !selectedOption) return;

        setShowFeedback(true);

        if (selectedOption === currentQuestion.correctAnswer) {
            setFeedback("Correct! You earned 5 Tech points.");
            updateTech(5);
        } else {
            setFeedback(`Incorrect. The correct answer is: ${currentQuestion.correctAnswer}`);
        }

        // Move to next question after delay
        setTimeout(() => {
            const newQuestion = questions[Math.floor(Math.random() * questions.length)];
            setCurrentQuestion(newQuestion);
            setSelectedOption("");
            setFeedback("");
            setShowFeedback(false);
        }, 2000);
    };

    if (!currentQuestion) {
        return <div className="quiz-loading">Loading questions...</div>;
    }

    return (
        <div className="quiz-container">
            {/* Back to Game button in the top left */}
            <Link to="/game">
                <button className="back-to-game">← Back to Game</button>
            </Link>
            
            {/* Question at the top center */}
            <div className="question-area">
                <h1 className="question-text">{currentQuestion.question}</h1>
            </div>

            {/* Options at the bottom */}
            <div className="options-area">
                <div className="options-grid">
                    {currentQuestion.options.map((option, index) => (
                        <button
                            key={index}
                            className={`option-button ${selectedOption === option ? 'selected' : ''}`}
                            onClick={() => handleOptionSelect(option)}
                        >
                            <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                            <span className="option-text">{option}</span>
                        </button>
                    ))}
                </div>

                {selectedOption && !showFeedback && (
                    <button className="submit-button" onClick={checkAnswer}>
                        Submit Answer
                    </button>
                )}

                {showFeedback && (
                    <div className={`feedback ${feedback.includes("Correct") ? "correct" : "incorrect"}`}>
                        {feedback}
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizPage;