# ATE! Nutrition Tracking App - Backend Guide

## Dual Backend Architecture

This project now supports **TWO backends** that you can switch between:

1. **Node.js/Express** (Original) - Port 5000
2. **Python/Flask** (New) - Port 5001

Both backends are **100% functionally equivalent** and support:
- ✅ MySQL database mode
- ✅ JSON database mode (USDA FDC format)
- ✅ All API endpoints (`/api/foods`, `/api/suggest-meals`, etc.)
- ✅ CORS enabled
- ✅ Same data format
- ✅ Micronutrient support

## Quick Start

### Option 1: Node.js Backend (Default)
```bash
# Start Node.js server
./start-backend.sh node

# Or manually:
cd backend
npm install
node server.js
```

### Option 2: Python Backend
```bash
# Start Python server
./start-backend.sh python

# Or manually:
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python server.py
```

### Windows Users
```cmd
REM Node.js backend
start-backend.bat node

REM Python backend
start-backend.bat python
```

## Configuration

Both backends use the same `.env` file in the `backend/` directory:

```env
# Database Mode (true = JSON, false = MySQL)
USE_JSON_DB=true

# MySQL Configuration (if USE_JSON_DB=false)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=nutrition_db

# Server Port
PORT=5000  # Node.js uses this
# Python server uses PORT=5001 by default to avoid conflicts
```

## Frontend Configuration

Update `src/App.js` to point to whichever backend you're using:

```javascript
// For Node.js backend (port 5000)
const API_URL = 'http://localhost:5000/api';

// For Python backend (port 5001)
const API_URL = 'http://localhost:5001/api';
```

## API Endpoints (Both Backends)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check & backend info |
| `/api/foods` | GET | Get all foods (limited) |
| `/api/foods/search/:query` | GET | Search foods by name |
| `/api/suggest-meals` | POST | Get meal suggestions based on deficiencies |

## Testing Both Backends

### Test Node.js Backend
```bash
# Start Node.js server
cd backend
node server.js

# In another terminal:
curl http://localhost:5000/api/health
curl "http://localhost:5000/api/foods/search/spinach"
```

### Test Python Backend
```bash
# Start Python server
cd backend
source venv/bin/activate
python server.py

# In another terminal:
curl http://localhost:5001/api/health
curl "http://localhost:5001/api/foods/search/spinach"
```

## Switching Backends

### Method 1: Stop one, start the other
```bash
# Stop current backend (Ctrl+C)
# Start different backend
./start-backend.sh python  # or node
```

### Method 2: Run both simultaneously (different ports)
```bash
# Terminal 1: Node.js on port 5000
cd backend
node server.js

# Terminal 2: Python on port 5001
cd backend
python server.py

# Update frontend API_URL to switch between them
```

## File Structure

```
backend/
├── server.js              # Node.js/Express server (port 5000)
├── server.py              # Python/Flask server (port 5001)
├── jsonDb.js              # Node.js JSON database module
├── json_db.py             # Python JSON database module
├── package.json           # Node.js dependencies
├── requirements.txt       # Python dependencies
├── .env                   # Shared configuration
└── usda_foods.json        # Optional JSON database file
```

## Dependencies

### Node.js Dependencies
```bash
cd backend
npm install
# Installs: express, mysql2, cors, dotenv
```

### Python Dependencies
```bash
cd backend
pip install -r requirements.txt
# Installs: Flask, flask-cors, mysql-connector-python, python-dotenv
```

## Troubleshooting

### Port Already in Use
- Node.js uses port 5000
- Python uses port 5001
- They can run simultaneously without conflicts
- Change ports in `.env` (Node) or `server.py` (Python) if needed

### Python Virtual Environment Issues
```bash
# Recreate virtual environment
cd backend
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### MySQL Connection Issues
- Ensure MySQL is running
- Check credentials in `.env`
- Switch to JSON mode: `USE_JSON_DB=true`

### JSON Database Not Found
- Create `backend/usda_foods.json` with USDA FDC data
- Or use MySQL mode: `USE_JSON_DB=false`

## Performance Comparison

| Feature | Node.js | Python |
|---------|---------|--------|
| Startup Speed | ⚡ Fast | ⚡ Fast |
| Memory Usage | Low | Low-Medium |
| JSON Parsing | Native | Native |
| Async I/O | Excellent | Good |
| Ecosystem | npm | pip |
| Best For | Real-time apps | Data processing |

## Which Backend Should I Use?

### Use Node.js if:
- ✅ You're already comfortable with JavaScript
- ✅ Your project is primarily JavaScript/React
- ✅ You want the fastest possible async I/O
- ✅ You're deploying to Node-friendly platforms (Vercel, etc.)

### Use Python if:
- ✅ You need advanced data analysis features
- ✅ You want to integrate ML/AI in the future
- ✅ You're more comfortable with Python syntax
- ✅ You plan to add scientific computing features
- ✅ Your university/project requires Python

### Bottom Line
**Both backends are production-ready.** Choose based on your comfort level and future requirements. You can always switch later!

## Future Enhancements

Potential additions to both backends:
- [ ] User authentication (JWT)
- [ ] Database connection pooling
- [ ] Caching layer (Redis)
- [ ] Rate limiting
- [ ] Request logging
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Unit tests
- [ ] Docker containers

## Support

For issues or questions:
1. Check this README
2. Review `.env` configuration
3. Test with `curl` commands
4. Check backend logs for errors
