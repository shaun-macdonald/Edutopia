import React, { useState, useEffect } from "react";

const QuizPage = ({ updateTech }) => {
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [selectedOption, setSelectedOption] = useState("");
    const [code, setCode] = useState("");
    const [output, setOutput] = useState("");
    const [feedback, setFeedback] = useState("");

    // Fetch questions from JSON
    useEffect(() => {
        fetch("/questions.json")
            .then((res) => res.json())
            .then((data) => {
                setQuestions(data);
                setCurrentQuestion(data[Math.floor(Math.random() * data.length)]); // Pick a random question
            });
    }, []);

    // Handle MCQ selection
    const handleOptionChange = (event) => {
        setSelectedOption(event.target.value);
    };

    // Function to check the user's answer
    const checkAnswer = () => {
        if (!currentQuestion) return;

        if (currentQuestion.type === "code") {
            if (output.trim() === currentQuestion.correctOutput) {
                setFeedback("✅ Correct! You earned 5 Tech.");
                updateTech(5);
            } else {
                setFeedback("❌ Incorrect. Try again!");
            }
        } else if (currentQuestion.type === "mcq") {
            if (selectedOption === currentQuestion.correctAnswer) {
                setFeedback("✅ Correct! You earned 5 Tech.");
                updateTech(5);
            } else {
                setFeedback("❌ Incorrect. The correct answer is: " + currentQuestion.correctAnswer);
            }
        }
    };

    return (
        <div>
            <h1>Quiz Challenge</h1>
            {currentQuestion && <p>{currentQuestion.question}</p>}

            {/* Display Multiple-Choice Question */}
            {currentQuestion?.type === "mcq" && (
                <div>
                    {currentQuestion.options.map((option, index) => (
                        <label key={index} style={{ display: "block", margin: "5px 0" }}>
                            <input
                                type="radio"
                                name="mcq"
                                value={option}
                                checked={selectedOption === option}
                                onChange={handleOptionChange}
                            />
                            {option}
                        </label>
                    ))}
                </div>
            )}

            {/* Display Python Code Editor */}
            {currentQuestion?.type === "code" && (
                <>
                    <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        rows={5}
                        cols={50}
                    />
                    <button onClick={checkAnswer}>Submit</button>
                </>
            )}

            <br />
            <button onClick={checkAnswer}>Submit Answer</button>
            <p>{feedback}</p>
        </div>
    );
};

export default QuizPage;
