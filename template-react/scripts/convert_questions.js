console.log("🟢 Running convert_questions.js...");

import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
    // Define correct paths relative to the script's location
    const csvFilePath = path.join(__dirname, '../public/data/questionSheet.csv');
    const jsonFilePath = path.join(__dirname, '../public/data/questions.json');

    // Check if CSV file exists
    if (!fs.existsSync(csvFilePath)) {
        throw new Error(`❌ ERROR: CSV file not found at ${csvFilePath}`);
    }

    // Load the CSV file
    const workbook = xlsx.readFile(csvFilePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert sheet to JSON
    const jsonData = xlsx.utils.sheet_to_json(sheet);

    if (jsonData.length === 0) {
        throw new Error("❌ ERROR: No questions found in the CSV file.");
    }

    console.log(`📊 Loaded ${jsonData.length} questions from CSV.`);

    const formattedQuestions = jsonData.map(row => {
        const options = [
            row["Option A"],
            row["Option B"],
            row["Option C"],
            row["Option D"]
        ].filter(opt => opt); // Remove any empty options

        return {
            id: row["Question ID"],
            type: row.Type,
            difficulty: row.Difficulty,
            question: row.Question,
            options,
            correctAnswer: row[["Option A", "Option B", "Option C", "Option D"][row["Correct Answer"].charCodeAt(0) - 65]] // Converts A/B/C/D to the actual text answer
        };
    });

    // Save formatted questions as JSON
    fs.writeFileSync(jsonFilePath, JSON.stringify(formattedQuestions, null, 2));

    console.log(`✅ Successfully updated ${formattedQuestions.length} questions.`);
} catch (error) {
    console.error(error.message);
}

console.log("✅ Script finished running!");
