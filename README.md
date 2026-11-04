# AlgoVerse: Interactive Computer Science Learning & AI Architecture Visualizer

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat&logo=python)](https://www.python.org)
[![JavaScript](https://img.shields.io/badge/Frontend-Vanilla%20ES6-F7DF1E?style=flat&logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/Tests-14%20Passing-brightgreen.svg)]()

AlgoVerse is a full-stack educational engineering platform designed to teach Computer Science concepts and Modern AI Architectures through **step-by-step, state-driven execution animations**, live graph traversals, and AI tutoring.

---

## 🌟 Key Features

### 1. 🤖 RAG & LangGraph Architecture Studio (New!)
A dedicated, professional dark-mode interactive laboratory to explore, step through, and understand the 8 leading modern **Retrieval-Augmented Generation (RAG)** paradigms and LangGraph workflows:

- **🟢 Simple RAG (Naive Linear Flow)**: Document chunking, vector embedding, similarity search, prompt synthesis, and final generation.
- **🔵 Advanced RAG (Pre & Post Retrieval)**: Multi-query expansion, hybrid retrieval, cross-encoder re-ranking, and dynamic score threshold filtering.
- **🟣 Self-RAG (Self-Correction & Reflection)**: LangGraph cyclic state graph with dynamic document relevance grading, hallucination detection, answer utility grading, and rewrite loops.
- **🛡️ CRAG (Corrective RAG)**: Confidence evaluator scoring internal vector results; automatically triggers live web search fallback when document confidence is low.
- **🤖 Agentic RAG (Autonomous Multi-Tool ReAct)**: LLM reasoning agent deciding dynamically whether to retrieve, which tools to call (PostgreSQL DB, Python Code Sandbox, Vector DB, Web Search), and evaluating stop conditions.
- **🕸️ Graph RAG (Knowledge Graph Network)**: Entity-relation triplet extraction, Leiden community clustering, and dual global/local graph traversal.
- **🖼️ Multimodal RAG (ColPali Vision Late-Interaction)**: Patch-level visual embeddings for diagrams, schematics, and financial tables with MaxSim token-to-patch scoring.
- **🌳 Vectorless RAG (AST & Hierarchical Summary Trees)**: Codebase and legal corpus navigation using Tree-sitter AST syntax trees and BM25 lexical scopes without vector databases.

#### 💡 Features of the RAG Studio:
- **Beginner-Friendly Definitions**: Jargon-free *"In Simple Words"* callouts for every architecture and every single execution step.
- **Structured Specification Cards**: Clear breakdowns of *Why We Need This Step*, *Inputs*, *Under The Hood Algorithm*, *Outputs*, and *Key Gotchas*.
- **Live LangGraph Memory Inspector**: Real-time visualization of the `TypedDict GraphState` dictionary as tokens flow.
- **Production LangGraph Python Snippets**: Code for every node with a 1-click **"Copy Snippet"** action.
- **Full Paradigm Comparison Matrix**: Side-by-side benchmark of topologies, latencies, accuracy, and best use cases.
- **Interactive Keyboard Controls**: Spacebar for Play/Pause, Arrow keys for step navigation, and number keys (`1` through `8`) for rapid architecture switching.

---

### 2. 📚 60+ Master Computer Science Algorithm Catalog
Comprehensive interactive visualizers spanning 6 core CS subjects:

- **Data Structures & Algorithms**: BFS, DFS, Dijkstra's Shortest Path, Bubble Sort, Selection Sort, Insertion Sort, Binary Search, Linear Search, Quick Sort, DP.
- **Cybersecurity & Cryptography**: Caesar Cipher, RSA Public Key Encryption/Decryption, Hashing & Digital Signatures.
- **Operating Systems**: FCFS/SJF/Round-Robin CPU Scheduling, LRU/FIFO Memory Page Replacement.
- **Computer Networks**: TCP 3-Way Handshake, DNS Hierarchy Resolution.
- **DBMS Internals**: SQL Query Execution Engine, Cost-Based Optimizer, and execution plan trees.
- **Machine Learning & Deep Learning**: Linear Regression Gradient Descent, Neural Network Forward Propagation and Backpropagation.

---

### 3. ⚙️ Standardized Execution Engine
- Pure Python backend execution engines implement `BaseAlgorithmEngine` to generate deterministic `ExecutionState` timeline snapshots.
- Uniform JSON schema decoupling UI visualization from execution logic, allowing instant plug-and-play for new algorithms.

---

### 4. 🎨 Modular Visualizer Canvas Suite (Vanilla JS + SVG/Canvas)
- **RagGraphVisualizer**: SVG node-edge graph renderer with glowing active states, curved bezier connectors, dynamic badges, and particle animation.
- **GraphVisualizer**: Node-link force layouts, visited paths, and queue/stack status containers.
- **ArrayVisualizer**: Height-scaled bars and memory boxes with multi-pointer tracking (`low`, `mid`, `high`, `i`, `j`).
- **GridVisualizer**: Gantt charts for CPU scheduling, tabular relational views for DBMS, and frame inspectors for OS page replacement.
- **MLVisualizer**: Real-time 2D Cartesian coordinate plots with live regression lines and multi-layer neural network activation graphs.

---

### 5. 🧠 Groq AI Tutor & Practice Suite
- Context-aware explanations powered by Groq's high-speed inference (`llama-3.3-70b-versatile`).
- Seamless offline heuristic fallback when API keys are unconfigured.
- Interactive practice challenges, code sandboxes, and timed assessment quizzes with instant scoring.

---

## 🛠️ Architecture & Project Structure

```
algorithm/
├── backend/
│   ├── algorithms/              # Modular Algorithm Execution Engines
│   │   ├── base.py              # BaseAlgorithmEngine abstract class
│   │   ├── rag_engine.py        # All 8 RAG & LangGraph Architecture Engines
│   │   ├── bfs.py, dfs.py       # Graph Search Algorithms
│   │   ├── dijkstra.py          # Shortest Path Engine
│   │   ├── bubble_sort.py, ...  # Sorting & Searching Engines
│   │   ├── rsa.py, caesar_cipher.py # Cryptography Engines
│   │   ├── cpu_scheduling.py    # OS CPU Schedulers
│   │   ├── page_replacement.py  # OS Memory Virtual Page Allocator
│   │   ├── tcp_handshake.py     # Networking Handshake Simulator
│   │   ├── sql_engine.py        # Relational DBMS Query Engine
│   │   └── linear_regression.py, neural_network.py # ML & Neural Nets
│   ├── api/                     # FastAPI REST API Routers
│   │   ├── algorithms.py        # /api/algorithms & /api/execute/{id}
│   │   ├── subjects.py          # /api/subjects & topic groupings
│   │   └── ai.py                # /api/ai/chat & /api/ai/hint
│   ├── database/                # SQLAlchemy Models, SQLite DB, Seeding Script
│   │   ├── db.py                # Database connection & sessionmaker
│   │   ├── models.py            # Subject, Topic, Algorithm, Quiz models
│   │   └── init_db.py           # Master DB seeder (60+ algorithms)
│   ├── engine/                  # Global Algorithm Execution Registry
│   │   └── execution_engine.py  # Registry singleton dispatching engines
│   ├── schemas/                 # Pydantic Schemas for API validation
│   ├── services/                # Groq AI Service & Offline Fallback Tutor
│   ├── tests/                   # Automated Unit Tests (14 passing tests)
│   │   └── test_algorithms.py   # Unit tests for all engine executions
│   └── main.py                  # FastAPI Application Entrypoint
├── frontend/
│   ├── css/                     # Design System (Dark Glassmorphism)
│   │   ├── style.css            # Global theme variables & base styles
│   │   ├── layout.css           # Header, sidebar, container layouts
│   │   ├── components.css       # Buttons, cards, badges, tabs
│   │   └── responsive.css       # Mobile & tablet media queries
│   ├── js/
│   │   ├── api.js               # REST API HTTP Client
│   │   ├── state.js             # Global Playback State Machine
│   │   ├── components/          # PlayerControls, StepPanel, AITutor, Toast
│   │   └── visualizations/      # Visualization Canvas Renderers
│   │       ├── ragGraphVisualizer.js # LangGraph SVG Canvas & particle flows
│   │       ├── ragData.js       # Complete 8-RAG dataset & step specifications
│   │       ├── graphVisualizer.js    # Graph traversal renderer
│   │       ├── arrayVisualizer.js    # Array & sorting animator
│   │       ├── gridVisualizer.js     # Gantt & Table renderer
│   │       └── mlVisualizer.js       # Regression & Neural Net canvas
│   ├── rag_visualizer.html      # Interactive RAG & LangGraph Studio
│   ├── index.html               # AlgoVerse Landing & Showcase Page
│   ├── algorithms.html          # Full Algorithm Catalog Explorer
│   ├── algorithm.html           # Interactive Algorithm Workspace
│   ├── practice.html            # Practice Coding Challenges
│   ├── quiz.html                # Timed Knowledge Assessment Quiz
│   └── dashboard.html           # User Learning Progress Dashboard
├── Dockerfile                   # Production Docker Container Specification
├── docker-compose.yml           # Multi-container orchestration
├── requirements.txt             # Python Package Dependencies
└── README.md                    # Platform Documentation
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.10 or higher
- Modern web browser (Chrome, Edge, Firefox, Safari)

### 2. Installation & Setup

```bash
# Clone the repository
git clone https://github.com/GauravHandge/Algorithm.git
cd Algorithm

# Create and activate a Python virtual environment
python -m venv venv

# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install required dependencies
pip install -r requirements.txt
```

### 3. Initialize the Database
Seed the SQLite database with all 60+ master computer science algorithms and RAG architectures:

```bash
python -m backend.database.init_db
```

### 4. Optional: Configure AI Tutor (Groq API)
To enable real-time Groq LLM tutoring, set your API key in an environment variable or `.env` file:

```bash
# Windows PowerShell
$env:GROQ_API_KEY="your_groq_api_key_here"

# Linux / macOS
export GROQ_API_KEY="your_groq_api_key_here"
```
*(Note: If no API key is provided, AlgoVerse automatically uses its built-in offline educational tutor).*

### 5. Launch the Application

```bash
# Start the FastAPI server on port 8080 (or 8000)
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8080 --reload
```

Open your browser and navigate to:
- **RAG & LangGraph Studio**: [http://127.0.0.1:8080/static/rag_visualizer.html](http://127.0.0.1:8080/static/rag_visualizer.html)
- **Home Landing Page**: [http://127.0.0.1:8080/static/index.html](http://127.0.0.1:8080/static/index.html)
- **Algorithm Catalog**: [http://127.0.0.1:8080/static/algorithms.html](http://127.0.0.1:8080/static/algorithms.html)
- **Swagger Interactive API Docs**: [http://127.0.0.1:8080/docs](http://127.0.0.1:8080/docs)

---

## 🧪 Running Automated Unit Tests

Run the full automated test suite covering all algorithm execution engines, state transitions, and the 8 RAG architectures:

```bash
python -m unittest discover backend/tests
```

Expected output:
```
..............
----------------------------------------------------------------------
Ran 14 tests in 0.007s

OK
```

---

## 🐳 Docker Deployment

Run the complete AlgoVerse platform inside an isolated Docker container:

```bash
# Build and launch using Docker Compose
docker-compose up --build

# Or run standalone via Dockerfile
docker build -t algoverse .
docker run -p 8080:8000 algoverse
```

---

## ⌨️ RAG Visualizer Shortcuts & Navigation

| Key | Action |
| :--- | :--- |
| **`Space`** | Play / Pause continuous step-by-step flow |
| **`Right Arrow` (`→`)** | Step forward to the next execution stage |
| **`Left Arrow` (`←`)** | Step backward to the previous execution stage |
| **`1`** | Switch to **Simple RAG** |
| **`2`** | Switch to **Advanced RAG** |
| **`3`** | Switch to **Self-RAG (LangGraph)** |
| **`4`** | Switch to **CRAG (Corrective RAG)** |
| **`5`** | Switch to **Agentic RAG** |
| **`6`** | Switch to **Graph RAG** |
| **`7`** | Switch to **Multimodal RAG** |
| **`8`** | Switch to **Vectorless RAG** |
| **`Node Click`** | Click any node on the SVG graph to inspect its step breakdown |

---

## 💻 Tech Stack

- **Backend**: Python 3.11+, FastAPI, SQLAlchemy, Pydantic v2, SQLite
- **AI Acceleration**: Groq Cloud API (`llama-3.3-70b-versatile`) with heuristic offline fallback
- **Frontend Architecture**: Modern HTML5, Custom Vanilla CSS3 (Dark Glassmorphic UI), ES6 JavaScript Modules
- **Data Visualization**: Dynamic SVG Paths & Canvas, Bezier curves, particle flow animations
- **Testing & Quality Assurance**: Python `unittest` test suite

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
