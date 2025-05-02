

# Edutopia

Edutopia is a gamified educational web application built using React and JavaScript to help users learn Python through interactive gameplay. Designed for research into learning motivation and retention, the game adapts question difficulty, tracks performance, and offers insight into gamified learning effectiveness.

---

## File Structure Overview

- `/template-react/`: Main project directory containing the front-end code.
- `/template-react/src/App.jsx`: Entry point of the app where main components are initialized.
- `/template-react/src/components/`: Contains all core visual/gameplay components:
  - `GameBoard.jsx`: Displays the grid of tiles.
  - `QuestionBox.jsx`: Manages quiz question interactions.
  - `ResourceBar.jsx`: Shows current resource counts.
- `/template-react/src/data/questions.json`: The editable question bank.
- `/template-react/src/utils/`: Utility scripts for logic such as scoring, tile updates, and storage.
- `/admin`: Hidden password-protected page to export browser-stored game data (enter `/admin` in browser with password `research123`).
- `/figures/`: Stores exported figures and codebase visuals used for documentation.

---

## 🛠 Installation and Setup

To set up and maintain the Edutopia application, ensure the following software is installed:

### Requirements

-  [Node.js](https://nodejs.org/en) – Install the latest stable version.
-  A modern browser – Chrome, Firefox, or Edge recommended.

---

### 🔧 Setup Steps

1. **Clone the Repository**

   ```bash
   git clone https://github.com/shaun-macdonald/Edutopia.git
   cd Edutopia/template-react
   npm install

   NOTE: If you see an error about scripts being disabled, run:  Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force
   
   RUN npm run dev
   Follow instructions in terminal and open the local host it shows you

## 🎮 Study Modes
For marking or data review:

Navigate to: http://localhost:5173/admin

Password: research123

## 🎮 Study Modes

Edutopia has three modes:
- **Mode 1 (Standard Gamified):** Fixed difficulty questions.
- **Mode 2 (Challenging Gamified):** Difficulty adapts based on performance.
- **Mode 3 (Traditional):** Quiz-only study without game elements.

Modes were assigned randomly to participants for research comparison.
