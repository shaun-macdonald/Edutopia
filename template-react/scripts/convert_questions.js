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

    console.log(`Reading CSV from: ${csvFilePath}`);
    console.log(`Will write JSON to: ${jsonFilePath}`);

    // Check if CSV file exists
    if (!fs.existsSync(csvFilePath)) {
        throw new Error(`❌ ERROR: CSV file not found at ${csvFilePath}`);
    }

    // Check if the destination JSON file exists
    if (fs.existsSync(jsonFilePath)) {
        console.log(`Existing file found at ${jsonFilePath}, attempting to delete...`);
        try {
            fs.unlinkSync(jsonFilePath);
            console.log("Successfully deleted existing file.");
        } catch (deleteError) {
            console.error(`Failed to delete existing file: ${deleteError.message}`);
            console.log("Will try to overwrite it instead.");
        }
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
            correctAnswer: row["Correct Answer"]
        };
    });

    // Save formatted questions as JSON, using a temporary file first
    const tempFilePath = jsonFilePath + '.temp';
    fs.writeFileSync(tempFilePath, JSON.stringify(formattedQuestions, null, 2));
    
    // Then rename the temp file to the final filename
    fs.renameSync(tempFilePath, jsonFilePath);

    console.log(`✅ Successfully updated ${formattedQuestions.length} questions.`);
} catch (error) {
    console.error(error);
}

console.log("✅ Script finished running!");