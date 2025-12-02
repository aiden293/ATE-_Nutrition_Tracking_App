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

For production deployment, consider using **gunicorn** or **uwsgi** to serve the Flask application.

---

## Original Create React App Documentation

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
