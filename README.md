# ATE! Nutrition Tracking App

A comprehensive nutrition tracking application with real-time food search, meal logging, weekly analytics, and personalized recommendations.

## 🚀 Getting Started

This application uses a **Python/Flask backend** and **React frontend**.

## Installation & Setup

### Prerequisites
- Python 3.8 or higher
- Node.js 14 or higher
- npm or yarn

### 1. Backend Setup (Python/Flask)

#### Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### Configure Environment (Optional)
Create a `.env` file in the `backend` directory:
```bash
# Use JSON database (default)
USE_JSON_DB=true

# Or configure MySQL (if not using JSON)
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=nutrition_db
```

#### Run the Backend
```bash
cd backend
python3 server.py
```

The backend will start on **http://localhost:5001**

**Note:** The Python backend uses the USDA FoodData Central database (`usda_foods.json`) with 7,327+ foods.

### 2. Frontend Setup (React)

#### Install Node Dependencies
```bash
# From the root directory
npm install
```

#### Run the Frontend
```bash
npm start
```

The app will open at **http://localhost:3000**

## Project Structure

```
ATE-_Nutrition_Tracking_App/
├── backend/
│   ├── server.py              # Python Flask API server
│   ├── json_db.py            # JSON database handler
│   ├── requirements.txt       # Python dependencies
│   └── usda_foods.json       # Food nutrition database
├── src/
│   └── App.js                # React frontend application
└── public/
    └── index.html            # HTML template
```

## Running in Production

### Build Frontend
```bash
npm run build
```

### Run Backend
```bash
cd backend
python3 server.py
```
