import { useState, useEffect } from "react";

const QuizPage = ({ updateTech }) => {
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [selectedOption, setSelectedOption] = useState("");
    const [feedback, setFeedback] = useState("");

    // ✅ Fetch questions from JSON
    useEffect(() => {
        fetch("/data/questions.json")  // Load from public/data/questions.json
            .then(res => res.json())
            .then(data => {
                setQuestions(data);
                setCurrentQuestion(data[Math.floor(Math.random() * data.length)]); // Pick a random question
            })
            .catch(err => console.error("❌ Error loading questions:", err));
    }, []);

    // ✅ Handle answer selection
    const handleOptionChange = (event) => {
        setSelectedOption(event.target.value);
    };

    // ✅ Check the answer
    const checkAnswer = () => {
        if (!currentQuestion) return;

        if (selectedOption === currentQuestion.correctAnswer) {
            setFeedback("✅ Correct! You earned 5 Tech.");
            updateTech(5); // ✅ Award 5 Tech points
        } else {
            setFeedback(`❌ Incorrect. The correct answer is: ${currentQuestion.correctAnswer}`);
        }

        // ✅ Move to next question after 2 seconds
        setTimeout(() => {
            const newQuestion = questions[Math.floor(Math.random() * questions.length)];
            setCurrentQuestion(newQuestion);
            setSelectedOption("");  // Reset selection
            setFeedback("");  // Clear feedback
        }, 2000);
    };

    return (
        <div>
            <h1>Quiz Challenge</h1>
            {currentQuestion && (
                <>
                    <p><strong>{currentQuestion.question}</strong></p>
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
                    <br />
                    <button onClick={checkAnswer}>Submit Answer</button>
                    <p>{feedback}</p>
                </>
            )}
        </div>
    );
};

export default QuizPage;
