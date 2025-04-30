#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('===== Edutopia Setup Script =====');
console.log('This script will help you set up the Edutopia application.');

// Check if Node.js and npm are installed
try {
  const nodeVersion = execSync('node --version').toString().trim();
  const npmVersion = execSync('npm --version').toString().trim();
  console.log(`Node.js version: ${nodeVersion}`);
  console.log(`npm version: ${npmVersion}`);
} catch (error) {
  console.error('Error: Node.js or npm is not installed. Please install Node.js from https://nodejs.org/');
  process.exit(1);
}

// Function to install dependencies
function installDependencies() {
  console.log('\nInstalling dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('Dependencies installed successfully!');
  } catch (error) {
    console.error('Error installing dependencies:', error.message);
    process.exit(1);
  }
}

// Function to setup research mode if needed
function setupResearchMode() {
  rl.question('\nDo you want to enable research mode for data collection? (y/n): ', (answer) => {
    const enableResearch = answer.toLowerCase() === 'y';
    
    console.log(`Research mode ${enableResearch ? 'enabled' : 'disabled'}.`);
    
    if (enableResearch) {
      console.log('Setting up research mode for data collection...');
      // Create a file that will set research mode to true when loaded
      const researchModeScript = `
// This script enables research mode in Edutopia
// It will be loaded automatically when the application starts
window.addEventListener('load', function() {
  localStorage.setItem('researchMode', 'true');
  console.log('Research mode enabled automatically');
});
      `;
      
      try {
        fs.writeFileSync(path.join(process.cwd(), 'public', 'research-mode.js'), researchModeScript);
        
        // Update index.html to include this script if it doesn't already
        const indexHtmlPath = path.join(process.cwd(), 'index.html');
        if (fs.existsSync(indexHtmlPath)) {
          let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
          if (!indexHtml.includes('research-mode.js')) {
            indexHtml = indexHtml.replace(
              '</head>',
              '  <script src="/research-mode.js"></script>\n</head>'
            );
            fs.writeFileSync(indexHtmlPath, indexHtml);
          }
        }
        
        console.log('Research mode setup complete. Data will be collected and can be exported from the admin panel.');
      } catch (err) {
        console.error('Error setting up research mode:', err.message);
        console.log('You can manually enable research mode by opening the browser console and running:');
        console.log('localStorage.setItem("researchMode", "true")');
      }
    }
    
    runInitialSetup();
  });
}

// Function to run initial setup
function runInitialSetup() {
  console.log('\nRunning initial setup...');
  try {
    // Check if questions conversion script exists
    const convertScriptPath = path.join(process.cwd(), 'scripts', 'convert_questions.js');
    if (fs.existsSync(convertScriptPath)) {
      // Run the question conversion script
      console.log('Converting questions data...');
      execSync('node scripts/convert_questions.js', { stdio: 'inherit' });
      console.log('Questions data prepared successfully!');
    } else {
      console.log('Questions conversion script not found, skipping this step.');
    }
    
    // Create game state folder if it doesn't exist
    const localDataPath = path.join(process.cwd(), 'data');
    if (!fs.existsSync(localDataPath)) {
      fs.mkdirSync(localDataPath);
      console.log('Created data directory for local game saves.');
    }
    
    finishSetup();
  } catch (error) {
    console.error('Error during setup:', error.message);
    process.exit(1);
  }
}

// Function to finish setup
function finishSetup() {
  console.log('\n===== Setup Complete! =====');
  console.log('To start the development server, run:');
  console.log('  npm run dev');
  console.log('\nFor a cleaner development experience without debug logs:');
  console.log('  npm run dev-nolog');
  console.log('\nTo build for production, run:');
  console.log('  npm run build');
  console.log('\nTo access the admin panel in research mode, navigate to:');
  console.log('  http://localhost:5173/admin');
  console.log('  (The default password is "research123")');
  console.log('\nThank you for installing Edutopia!');
  rl.close();
}

// Start the installation process
console.log('\nStarting installation...');
installDependencies();
setupResearchMode();