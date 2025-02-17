import React, { useState } from "react";

// Load Skulpt when the component mounts
const loadSkulpt = () => {
    if (!window.Sk) {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/gh/skulpt/skulpt@master/skulpt.min.js"; // ✅ Alternative Skulpt source
        script.async = true;
        document.body.appendChild(script);

        const script2 = document.createElement("script");
        script2.src = "https://cdn.jsdelivr.net/gh/skulpt/skulpt@master/skulpt-stdlib.js"; // ✅ Alternative Skulpt source
        script2.async = true;
        document.body.appendChild(script2);
    }
};

const QuizPage = ({ updateTech }) => {
    const [code, setCode] = useState('print("Hello, World!")');
    const [output, setOutput] = useState("");
    const [feedback, setFeedback] = useState("");

    // Function to execute Python code in Skulpt
    const runPython = () => {
        if (!window.Sk) {
            setOutput("⚠ Skulpt is still loading, please wait...");
            return;
        }

        try {
            window.Sk.configure({
                output: (text) => setOutput(prev => prev + text),
                read: (x) => {
                    if (window.Sk.builtinFiles === undefined || window.Sk.builtinFiles["files"][x] === undefined)
                        throw "File not found: " + x;
                    return window.Sk.builtinFiles["files"][x];
                }
            });

            setOutput(""); // Clear previous output
            window.Sk.misceval.asyncToPromise(() => window.Sk.importMainWithBody("<stdin>", false, code));
        } catch (err) {
            setOutput("Error: " + err.toString());
        }
    };

    // Function to check if the user's code is correct
    const checkAnswer = () => {
        if (output.trim() === "42") {
            setFeedback("✅ Correct! You earned 5 Tech.");
            updateTech(5); // Reward Tech points
        } else {
            setFeedback("❌ Incorrect. Try again!");
        }
    };

    return (
        <div>
            <h1>Python Coding Challenge</h1>
            <p>Write a Python function that prints "42".</p>

            {/* Python Code Editor */}
            <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={5}
                cols={50}
            ></textarea>
            <br />
            <button onClick={runPython}>Run Code</button>

            {/* Display Python Output */}
            <h3>Output:</h3>
            <pre>{output}</pre>

            {/* Check Answer Button */}
            <button onClick={checkAnswer}>Submit Answer</button>
            <p>{feedback}</p>
        </div>
    );
};

// Load Skulpt once when the page opens
loadSkulpt();

export default QuizPage;
