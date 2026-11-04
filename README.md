# AlgoVerse: Interactive Computer Science Learning & AI Architecture Visualizer

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat&logo=python)](https://www.python.org)
[![JavaScript](https://img.shields.io/badge/Frontend-Vanilla%20ES6-F7DF1E?style=flat&logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/Tests-16%20Passing-brightgreen.svg)]()

AlgoVerse is a full-stack educational engineering platform designed to teach Computer Science concepts and Modern AI Architectures through **step-by-step, state-driven execution animations**, live graph traversals, and AI tutoring.

---

## 🌟 Key Features

### 1. 🤖 RAG & LangGraph Architecture Studio
A dedicated, professional dark-mode interactive laboratory to explore, step through, and understand the 8 leading modern **Retrieval-Augmented Generation (RAG)** paradigms and LangGraph workflows:

- **🟢 Simple RAG (Naive Linear Flow)**: Document chunking, vector embedding, similarity search, prompt synthesis, and final generation.
- **🔵 Advanced RAG (Pre & Post Retrieval)**: Multi-query expansion, hybrid retrieval, cross-encoder re-ranking, and dynamic score threshold filtering.
- **🟣 Self-RAG (Self-Correction & Reflection)**: LangGraph cyclic state graph with dynamic document relevance grading, hallucination detection, answer utility grading, and rewrite loops.
- **🛡️ CRAG (Corrective RAG)**: Confidence evaluator scoring internal vector results; automatically triggers live web search fallback when document confidence is low.
- **🤖 Agentic RAG (Autonomous Multi-Tool ReAct)**: LLM reasoning agent deciding dynamically whether to retrieve, which tools to call (PostgreSQL DB, Python Code Sandbox, Vector DB, Web Search), and evaluating stop conditions.
- **🕸️ Graph RAG (Knowledge Graph Network)**: Entity-relation triplet extraction, Leiden community clustering, and dual global/local graph traversal.
- **🖼️ Multimodal RAG (ColPali Vision Late-Interaction)**: Patch-level visual embeddings for diagrams, schematics, and financial tables with MaxSim token-to-patch scoring.
- **🌳 Vectorless RAG (AST & Hierarchical Summary Trees)**: Codebase and legal corpus navigation using Tree-sitter AST syntax trees and BM25 lexical scopes without vector databases.

---

### 2. 📚 Complete AI/ML & Master Computer Science Algorithm Catalog
Comprehensive interactive visualizers spanning Machine Learning, Deep Learning, and Core Data Structures & Algorithms:

- **Machine Learning & Deep Learning Suite**:
  - **K-Means Clustering**: 2D scatter plots with iterative centroid shifting and cluster boundaries.
  - **K-Nearest Neighbors (KNN)**: Query point distance ranking, neighborhood radius circle, and majority voting.
  - **Decision Tree Classifier**: Hierarchical tree branching based on Gini Impurity reduction and pure leaf nodes.
  - **Logistic Regression**: S-shaped Sigmoid probability curve $\sigma(z) = 1/(1+e^{-z})$ with dynamic vertical decision boundary line.
  - **CNN Feature Extraction**: 5x5 grayscale matrix with sliding 3x3 kernel, dot-product feature maps, and 2x2 Max-Pooling.
  - **Optimizers Race**: Multi-ball race (SGD vs Momentum vs Adam) descending the parabolic loss surface $f(w) = w^2$ with live leaderboard.
  - **Linear Regression**: Gradient descent slope $w$ and intercept $b$ optimization with MSE loss overlay.
  - **Neural Network**: Multi-layer perceptron forward activation signals and backpropagation weight adjustments.

- **Data Structures & Advanced Algorithms (DSA)**:
  - **Merge Sort**: Divide-and-conquer recursive halving and two-pointer merging animation.
  - **Quick Sort**: In-place Lomuto partitioning with end-element pivot and subarray tracking.
  - **0/1 Knapsack Problem**: Dynamic programming 2D memoization matrix $DP[i][w]$ with optimal item backtracking.
  - **A\* Search Algorithm**: Informed graph pathfinding combining path cost $g(n)$ and Manhattan heuristic $h(n)$.
  - **Topological Sort**: Kahn's in-degree DAG traversal for task and course prerequisite scheduling.
  - **Trie (Prefix Tree)**: Character-by-character dictionary insertions and prefix autocomplete lookups.
  - **Classic Sorting**: Bubble Sort, Selection Sort, Insertion Sort.
  - **Classic Searching**: Binary Search, Linear Search.
  - **Graph Traversals**: BFS, DFS, Dijkstra's Shortest Path.
  - **Cybersecurity & Cryptography**: Caesar Cipher, RSA Public Key Encryption/Decryption.
  - **Operating Systems**: FCFS/SJF CPU Scheduling, LRU/FIFO Page Replacement.
  - **Computer Networks**: TCP 3-Way Handshake.
  - **DBMS Internals**: SQL Relational Query Filter & Row Scanning.

---

### 3. ⚙️ Standardized Execution Engine
- Pure Python backend execution engines implement `BaseAlgorithmEngine` to generate deterministic `ExecutionState` timeline snapshots.
- Uniform JSON schema decoupling UI visualization from execution logic, allowing instant plug-and-play for new algorithms.

---

### 4. 🎨 Modular Visualizer Canvas Suite (Vanilla JS + SVG/Canvas)
- **RagGraphVisualizer**: SVG node-edge graph renderer with glowing active states, curved bezier connectors, dynamic badges, and particle animation.
- **MLVisualizer**: Multi-mode visualizer supporting K-Means clusters, KNN radius circles, Decision Trees, Sigmoid S-curves, CNN 2D convolution grids, and Optimizer race curves.
- **GridVisualizer**: 2D Dynamic Programming matrix (Knapsack), Gantt charts for CPU scheduling, and tabular relational views for DBMS.
- **GraphVisualizer**: Node-link force layouts, A* search paths, Topological orders, and Trie trees.
- **ArrayVisualizer**: Height-scaled bars and memory boxes with multi-pointer tracking (`low`, `mid`, `high`, `i`, `j`).
- **CryptoVisualizer**: Interactive cryptographic cipher animations (Caesar, RSA).

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
│   │   ├── ml_engines.py        # KMeans, KNN, DecisionTree, LogisticRegression, CNN, Optimizers
│   │   ├── dsa_engines.py       # MergeSort, QuickSort, Knapsack01, AStar, TopoSort, Trie
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
│   │   ├── algorithms.py        # /api/algorithms & /api/algorithms/{id}/execute
│   │   ├── subjects.py          # /api/subjects & topic groupings
│   │   └── ai.py                # /api/ai/chat & /api/ai/hint
│   ├── database/                # SQLAlchemy Models, SQLite DB, Seeding Script
│   │   ├── db.py                # Database connection & sessionmaker
│   │   ├── models.py            # Subject, Topic, Algorithm, Quiz models
│   │   └── init_db.py           # Master DB seeder (60+ algorithms)
│   ├── engine/                  # Global Algorithm Execution Registry
│   │   └── execution_engine.py  # Master registry dispatching all engines
│   ├── schemas/                 # Pydantic Schemas for API validation
│   ├── services/                # Groq AI Service & Offline Fallback Tutor
│   ├── tests/                   # Automated Unit Tests (16 passing tests)
│   │   └── test_algorithms.py   # Unit tests covering all engines
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
