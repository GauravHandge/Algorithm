# AlgoVerse: Interactive Computer Science Learning & Algorithm Visualization Platform

AlgoVerse is a full-stack educational platform designed to teach Computer Science concepts across 6 core domains through **step-by-step, state-driven execution animations** and AI tutoring.

---

## 🌟 Key Features

1. **Multi-Subject CS Catalog**:
   - **Data Structures & Algorithms**: BFS, DFS, Bubble Sort, Binary Search, Dijkstra, Quick Sort, DP.
   - **Cybersecurity & Cryptography**: Caesar Cipher, RSA Public Key Encryption, Hashing.
   - **Operating Systems**: FCFS/SJF CPU Scheduling, LRU/FIFO Memory Page Replacement.
   - **Computer Networks**: TCP 3-Way Handshake, DNS Resolution.
   - **DBMS Internals**: SQL Query Execution Engine & Execution Plan tables.
   - **AI / ML & Deep Learning**: Linear Regression Gradient Descent, Neural Network Forward & Backpropagation.

2. **Standardized Execution Engine**:
   - Every algorithm produces a consistent `ExecutionState` JSON timeline (`step`, `action`, `message`, `array`/`pointers`/`variables`).
   - Enables frontends to render any algorithm cleanly with zero tight coupling.

3. **Multi-Type Visualizer Engine (Vanilla JS)**:
   - **GraphVisualizer**: SVG node-edge layout with visited badges, active highlights, queue/stack status box.
   - **ArrayVisualizer**: Bar/box array animator with multi-pointer tracking (`low`, `mid`, `high`, `compare`, `swap`).
   - **GridVisualizer**: Gantt chart renderer for OS scheduling, table renderer for DBMS/DP, frame inspector for page replacement.
   - **MLVisualizer**: Canvas/SVG 2D coordinate plot for regression lines & Neural Network node activation/weight graphs.

4. **Groq AI Tutor & Practice Suite**:
   - Step explanation, targeted hints, code breakdown, and contextual Q&A chat with automatic offline fallback when API key is unconfigured.
   - Practice questions with instant answer evaluation & timed subject assessment quizzes.

---

## 🛠️ Architecture

```
algorithm/
├── backend/
│   ├── algorithms/       # Modular Algorithm Execution State Generators
│   ├── api/              # FastAPI REST Endpoints (/api/subjects, /api/algorithms, /api/ai, etc.)
│   ├── database/         # SQLAlchemy DB models, SQLite config, seed script
│   ├── engine/           # Global Execution Registry & Fallback handler
│   ├── schemas/          # Pydantic Request/Response models
│   ├── services/         # Groq AI Provider & Fallback service
│   ├── tests/            # Automated Unit Test Suite (13 passing tests)
│   └── main.py           # FastAPI entrypoint
├── frontend/
│   ├── css/              # Design System, Layout, Components, Responsive CSS
│   ├── js/
│   │   ├── components/   # PlayerControls, StepPanel, AITutor, Toast
│   │   ├── visualizations/# GraphVisualizer, ArrayVisualizer, GridVisualizer, MLVisualizer
│   │   ├── api.js        # REST API client
│   │   └── state.js      # Global Player State Machine
│   ├── index.html        # Landing page
│   ├── algorithms.html   # Catalog explorer page
│   ├── algorithm.html    # Interactive visualizer workspace
│   ├── practice.html     # Practice questions page
│   ├── quiz.html         # Quiz assessment mode
│   └── dashboard.html    # Progress tracking dashboard
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── .env.example
```

---

## 🚀 Getting Started

### 1. Install Dependencies & Run Backend Server

```bash
# Install Python packages
pip install -r requirements.txt

# Set Groq API key (optional for online AI tutor)
export GROQ_API_KEY="your_groq_api_key"

# Run FastAPI Dev Server
python -m backend.main
```

The web application will be accessible at:
- **Frontend App**: `http://localhost:8000/`
- **Swagger API Docs**: `http://localhost:8000/docs`

### 2. Run Automated Unit Tests

```bash
python -m unittest backend/tests/test_algorithms.py
```

### 3. Run via Docker Compose

```bash
docker-compose up --build
```

---

## 💻 Tech Stack
- **Backend**: Python 3.11, FastAPI, SQLAlchemy, Pydantic, SQLite
- **AI Service**: Groq API (`llama-3.3-70b-versatile`) with offline fallback engine
- **Frontend**: HTML5, Vanilla CSS3 (Dark Educational SaaS design), Vanilla JS (ES6 modules), SVG/Canvas
- **Testing**: Python `unittest` framework
