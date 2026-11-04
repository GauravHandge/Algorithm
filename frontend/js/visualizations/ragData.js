/**
 * AlgoVerse AI Studio: Comprehensive RAG & LangGraph Architecture Dataset
 * Designed with crystal-clear, easy-to-understand definitions and step breakdowns.
 */

export const RAG_ARCHITECTURES = {
  simple_rag: {
    id: "simple_rag",
    name: "Simple RAG (Naive Pipeline)",
    badge: "Baseline Flow",
    badgeClass: "badge-easy",
    category: "1-Way Linear Pipeline",
    topology: "Linear Graph (Start ➔ End, No Loops)",
    simpleDefinition: "Simple RAG is the traditional 1-way pipeline: it cuts documents into small chunks, turns them into numbers (vectors), finds the most similar chunks when you ask a question, and hands them to the LLM to write an answer.",
    description: "The foundational baseline for Retrieval-Augmented Generation. Easy to set up, but has no feedback loops, relevance checks, or re-ranking.",
    summaryMetrics: {
      stages: 7,
      latency: "Fast (~400-800ms)",
      accuracy: "Baseline (60-70%)",
      hallucinationRisk: "Moderate to High",
      complexity: "Easy (Single-pass)"
    },
    pros: [
      "Extremely simple to build with LangChain or LlamaIndex in 20 lines of code",
      "Very fast response time because it only does one vector search and one LLM call",
      "Great for small, straightforward FAQs where questions match exact document words"
    ],
    cons: [
      "No quality check: if retrieved documents are useless, the LLM still tries to answer and may hallucinate",
      "No keyword search: struggles with exact part numbers, acronyms, or code names",
      "No self-correction: if the search fails, it has no way to retry or rewrite the query"
    ],
    nodes: [
      { id: "ingestion", label: "1. Document Ingestion", role: "INGEST", icon: "file-text", x: 70, y: 180 },
      { id: "chunking", label: "2. Text Chunking", role: "PROCESS", icon: "scissors", x: 220, y: 180 },
      { id: "embedding", label: "3. Vector Embedding", role: "EMBED", icon: "cpu", x: 370, y: 180 },
      { id: "vector_db", label: "4. Vector DB Store", role: "STORE", icon: "database", x: 520, y: 180 },
      { id: "retrieval", label: "5. Similarity Search", role: "RETRIEVE", icon: "search", x: 670, y: 180 },
      { id: "augmentation", label: "6. Prompt Injection", role: "AUGMENT", icon: "layers", x: 820, y: 180 },
      { id: "generation", label: "7. LLM Answer", role: "GENERATE", icon: "sparkles", x: 970, y: 180 }
    ],
    edges: [
      { id: "e1", source: "ingestion", target: "chunking", label: "Raw Text", type: "directed" },
      { id: "e2", source: "chunking", target: "embedding", label: "Chunks", type: "directed" },
      { id: "e3", source: "embedding", target: "vector_db", label: "Vector Numbers", type: "directed" },
      { id: "e4", source: "vector_db", target: "retrieval", label: "Search Index", type: "directed" },
      { id: "e5", source: "retrieval", target: "augmentation", label: "Top-4 Chunks", type: "directed" },
      { id: "e6", source: "augmentation", target: "generation", label: "Final Prompt", type: "directed" }
    ],
    steps: [
      {
        stepIndex: 0,
        activeNodeId: "ingestion",
        activeEdgeId: null,
        title: "Step 1: Document Ingestion (Reading Files)",
        action: "FILE_READING",
        simpleDefinition: "In simple words: The system loads your files (PDFs, Word docs, websites, or notes) and removes weird formatting, headers, and footers so the computer can read clean text.",
        description: "Raw files from disk, cloud, or URLs are read and converted into clean, readable text strings with basic metadata like filename and page number.",
        state: {
          step: "1 of 7",
          files_read: ["company_handbook.pdf", "security_faq.md"],
          total_clean_words: 42000,
          current_action: "Extracting plain text from files"
        },
        deepDive: {
          role: "Gets the knowledge into memory so the AI can use it.",
          why: "LLMs don't know your private documents. Reading the files is the first step to teaching the AI your company's data.",
          inputs: "PDFs, Word documents, Markdown files, or web pages.",
          mechanics: "A file loader reads the bytes, strips junk formatting, and produces a list of clean text documents.",
          output: "Clean plain-text documents with metadata tags (e.g. filename, author, date).",
          pitfalls: "Scanned image PDFs without OCR will produce empty blank text.",
          langgraphCode: `# Step 1: Read files into memory
from langchain_community.document_loaders import TextLoader

def read_documents_node(state: dict) -> dict:
    loader = TextLoader("knowledge_base.txt")
    docs = loader.load()
    return {"raw_documents": docs}`
        }
      },
      {
        stepIndex: 1,
        activeNodeId: "chunking",
        activeEdgeId: "e1",
        title: "Step 2: Text Chunking (Cutting into Small Bites)",
        action: "TEXT_SPLITTING",
        simpleDefinition: "In simple words: A 100-page book is too big to search at once. We cut it into small paragraphs (chunks) of ~500 words each so we can find the exact page that answers the user's question.",
        description: "Large documents are chopped into bite-sized paragraphs with a small overlapping boundary so sentences don't get cut in half.",
        state: {
          step: "2 of 7",
          chunk_size: "500 words per chunk",
          chunk_overlap: "50 words overlap",
          chunks_created: 140,
          current_action: "Splitting long text into cohesive paragraphs"
        },
        deepDive: {
          role: "Creates small, searchable paragraphs.",
          why: "If you give an entire book to an AI, it takes too long and costs too much money. Small chunks allow pinpoint search accuracy.",
          inputs: "Clean full-length documents from Step 1.",
          mechanics: "Splits on paragraph breaks first ('\n\n'), then sentences, keeping a 10% overlap between adjacent chunks so context is not lost.",
          output: "A list of 140 bite-sized chunks.",
          pitfalls: "Making chunks too small cuts sentences in half; making chunks too big dilutes specific facts.",
          langgraphCode: `# Step 2: Chunk text into paragraphs
from langchain_text_splitters import RecursiveCharacterTextSplitter

def chunk_text_node(state: dict) -> dict:
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = splitter.split_documents(state["raw_documents"])
    return {"chunks": chunks}`
        }
      },
      {
        stepIndex: 2,
        activeNodeId: "embedding",
        activeEdgeId: "e2",
        title: "Step 3: Vector Embedding (Converting Words into Numbers)",
        action: "VECTOR_CONVERSION",
        simpleDefinition: "In simple words: Computers cannot understand feelings or meanings of words—they only understand math. An embedding model turns each chunk into a list of 1,536 numbers that capture its true meaning.",
        description: "Each text chunk is fed into an embedding AI model, which outputs a mathematical list of coordinates in semantic space.",
        state: {
          step: "3 of 7",
          embedding_model: "text-embedding-3-small",
          vector_length: "1,536 numbers per chunk",
          meaning_sample: "Chunks about 'salary' and 'paycheck' end up right next to each other in math space!",
          chunks_embedded: 140
        },
        deepDive: {
          role: "Translates human language into mathematical meaning.",
          why: "Keyword search only finds exact words. Vectors understand synonyms—so 'king' and 'queen' or 'laptop' and 'computer' sit next to each other.",
          inputs: "Text chunk strings from Step 2.",
          mechanics: "A neural network reads the sentence and calculates a 1,536-dimensional coordinate vector representing the topic.",
          output: "A matrix of floating-point numbers.",
          pitfalls: "Different embedding models speak different math dialects; you must use the exact same model for both documents and questions.",
          langgraphCode: `# Step 3: Turn text into numbers (vectors)
from langchain_openai import OpenAIEmbeddings

def embed_chunks_node(state: dict) -> dict:
    model = OpenAIEmbeddings(model="text-embedding-3-small")
    vectors = model.embed_documents([c.page_content for c in state["chunks"]])
    return {"vectors": vectors}`
        }
      },
      {
        stepIndex: 3,
        activeNodeId: "vector_db",
        activeEdgeId: "e3",
        title: "Step 4: Vector DB Storage (Building the Library Index)",
        action: "DATABASE_INDEXING",
        simpleDefinition: "In simple words: We store all these number lists into a specialized vector database (like Chroma or Pinecone) so we can find any similar paragraph in less than 5 milliseconds.",
        description: "The vectors and their text paragraphs are indexed inside a high-speed vector database using graph indexing algorithms like HNSW.",
        state: {
          step: "4 of 7",
          database: "ChromaDB / Pinecone",
          index_type: "HNSW (Fast Nearest Neighbor Graph)",
          search_speed: "< 5 milliseconds",
          status: "Database is ready for user questions"
        },
        deepDive: {
          role: "Saves vectors so we can search millions of items instantly.",
          why: "Checking 1 million paragraphs one by one is too slow. Vector databases use graph maps (HNSW) to jump directly to the right answer.",
          inputs: "Vectors and text chunks from Step 3.",
          mechanics: "Connects nearby vectors with graph edges so search can traverse only the most relevant clusters.",
          output: "A searchable database index ready for runtime queries.",
          pitfalls: "Large vector databases can use lots of RAM memory.",
          langgraphCode: `# Step 4: Save vectors into a Vector Database
from langchain_community.vectorstores import Chroma

def save_to_db_node(state: dict) -> dict:
    db = Chroma.from_documents(state["chunks"], embedding=state["embedding_model"])
    return {"vector_store": db}`
        }
      },
      {
        stepIndex: 4,
        activeNodeId: "retrieval",
        activeEdgeId: "e4",
        title: "Step 5: Top-K Retrieval (Finding the Best Matches)",
        action: "SEARCH_EXECUTION",
        simpleDefinition: "In simple words: The user types a question. The computer turns the question into numbers, searches the vector database, and grabs the Top-4 paragraphs that best match the question's meaning.",
        description: "Cosine similarity measures the angle between the question vector and stored chunk vectors, picking the 4 closest candidate passages.",
        state: {
          step: "5 of 7",
          user_question: "How do I request paid time off (PTO)?",
          top_k_found: 4,
          similarity_scores: ["0.89 (High)", "0.85 (High)", "0.81 (Medium)", "0.78 (Medium)"],
          current_action: "Pulled top 4 policy paragraphs"
        },
        deepDive: {
          role: "Finds the exact pages the user is asking about.",
          why: "We don't want to send the entire database to the LLM. We only grab the 4 paragraphs that actually talk about the topic.",
          inputs: "User question text string.",
          mechanics: "Question is embedded -> Cosine similarity $cos(\theta)$ calculates closeness -> Top 4 highest scoring chunks are picked.",
          output: "The 4 best matching paragraphs.",
          pitfalls: "Simple RAG can get tricked by chunks that look similar but don't actually answer the question.",
          langgraphCode: `# Step 5: Search top 4 chunks
def search_top_k_node(state: dict) -> dict:
    db = state["vector_store"]
    best_chunks = db.similarity_search(state["question"], k=4)
    return {"retrieved_docs": best_chunks}`
        }
      },
      {
        stepIndex: 5,
        activeNodeId: "augmentation",
        activeEdgeId: "e5",
        title: "Step 6: Prompt Augmentation (Stitching Context + Question)",
        action: "PROMPT_STITCHING",
        simpleDefinition: "In simple words: We take the 4 paragraphs we found and glue them together with the user's question into one clean prompt: 'Here is the rulebook. Use these 4 paragraphs to answer the question below.'",
        description: "Assembles the prompt template containing strict instructions, the retrieved factual paragraphs, and the user's original question.",
        state: {
          step: "6 of 7",
          prompt_format: "System: Use only provided facts.\nContext: [Paragraph 1, 2, 3, 4]\nQuestion: {query}",
          total_prompt_words: 1800,
          current_action: "Prompt ready for the LLM"
        },
        deepDive: {
          role: "Prepares the instructions for the LLM.",
          why: "An LLM needs clear separation between background facts and instructions, or it might get confused.",
          inputs: "Retrieved paragraphs + user question.",
          mechanics: "Fills in prompt template variables with the retrieved text.",
          output: "A complete prompt string ready for inference.",
          pitfalls: "If paragraphs are too long, they might exceed the model's token context window.",
          langgraphCode: `# Step 6: Assemble final prompt
def assemble_prompt_node(state: dict) -> dict:
    context_text = "\n\n".join([doc.page_content for doc in state["retrieved_docs"]])
    prompt = f"Facts:\n{context_text}\n\nQuestion: {state['question']}\nAnswer:"
    return {"final_prompt": prompt}`
        }
      },
      {
        stepIndex: 6,
        activeNodeId: "generation",
        activeEdgeId: "e6",
        title: "Step 7: LLM Generation (Writing the Final Answer)",
        action: "ANSWER_WRITING",
        simpleDefinition: "In simple words: The LLM reads the glued prompt and writes a clear, human-like answer using the facts provided.",
        description: "The AI foundation model (GPT-4o / Claude) generates a helpful answer strictly based on the injected context.",
        state: {
          step: "7 of 7",
          model_used: "GPT-4o",
          final_answer: "To request PTO, log into the HR portal, click 'Leave Request', select your dates, and submit at least 2 weeks in advance.",
          status: "Answer complete and shown to user!"
        },
        deepDive: {
          role: "Writes the final answer for the human user.",
          why: "Users don't want to read 4 raw paragraphs. They want a direct, friendly 2-sentence answer.",
          inputs: "Final assembled prompt from Step 6.",
          mechanics: "Autoregressive generation predicts the next words based on the context facts.",
          output: "Clean natural language answer.",
          pitfalls: "In Simple RAG, if the search in Step 5 grabbed the wrong paragraphs, the LLM will confidently give the wrong answer because there is NO verification step!",
          langgraphCode: `# Step 7: Call the LLM to write answer
from langchain_openai import ChatOpenAI

def generate_answer_node(state: dict) -> dict:
    llm = ChatOpenAI(model="gpt-4o", temperature=0)
    response = llm.invoke(state["final_prompt"])
    return {"answer": response.content}`
        }
      }
    ]
  },

  advanced_rag: {
    id: "advanced_rag",
    name: "Advanced RAG (Modular Multi-Stage)",
    badge: "Smart Multi-Stage",
    badgeClass: "badge-medium",
    category: "Hybrid & Re-ranked Search",
    topology: "Branched DAG with Dual Search & Re-ranking",
    simpleDefinition: "Advanced RAG fixes all the dumb mistakes of Simple RAG! It rewrites confusing questions, searches with BOTH keywords (BM25) and meanings (Vector), eliminates irrelevant results with a cross-encoder re-ranker, and organizes context so the LLM doesn't get confused.",
    description: "Production-grade multi-stage pipeline combining HyDE query expansion, semantic routing, parallel hybrid search, reciprocal rank fusion, and cross-encoder re-ranking.",
    summaryMetrics: {
      stages: 8,
      latency: "Medium (~900-1500ms)",
      accuracy: "High (85-92%)",
      hallucinationRisk: "Low (<5%)",
      complexity: "Multi-stage pipeline"
    },
    pros: [
      "Finds exact words AND similar meanings because it runs both BM25 and Vector search together",
      "Cross-encoder re-ranking throws away 80% of useless distractor chunks",
      "Rewrites poorly worded user questions automatically (HyDE) so search never fails",
      "Compresses and re-orders context so important facts are placed where the LLM pays most attention"
    ],
    cons: [
      "Slightly slower than Simple RAG because it runs dual searches and a re-ranker model",
      "Requires running a re-ranker model which uses extra compute/tokens"
    ],
    nodes: [
      { id: "query_transform", label: "1. Query Rewriter (HyDE)", role: "EXPAND", icon: "refresh-cw", x: 70, y: 180 },
      { id: "query_router", label: "2. Smart Query Router", role: "ROUTER", icon: "git-branch", x: 210, y: 180 },
      { id: "dense_retrieval", label: "3A. Meaning Search (Vector)", role: "RETRIEVE", icon: "cpu", x: 370, y: 100 },
      { id: "sparse_bm25", label: "3B. Keyword Search (BM25)", role: "RETRIEVE", icon: "align-left", x: 370, y: 260 },
      { id: "rrf_fusion", label: "4. Rank Merger (RRF)", role: "FUSION", icon: "git-merge", x: 530, y: 180 },
      { id: "cross_rerank", label: "5. Re-Ranker Filter", role: "RERANK", icon: "bar-chart-2", x: 680, y: 180 },
      { id: "compression", label: "6. Context Compressor", role: "COMPRESS", icon: "minimize-2", x: 830, y: 180 },
      { id: "grounded_gen", label: "7. Cited Answer", role: "GENERATE", icon: "shield-check", x: 980, y: 180 }
    ],
    edges: [
      { id: "ae1", source: "query_transform", target: "query_router", label: "Better Query", type: "directed" },
      { id: "ae2", source: "query_router", target: "dense_retrieval", label: "Concepts", type: "directed" },
      { id: "ae3", source: "query_router", target: "sparse_bm25", label: "Exact Words", type: "directed" },
      { id: "ae4", source: "dense_retrieval", target: "rrf_fusion", label: "Top 20 Vectors", type: "directed" },
      { id: "ae5", source: "sparse_bm25", target: "rrf_fusion", label: "Top 20 Keywords", type: "directed" },
      { id: "ae6", source: "rrf_fusion", target: "cross_rerank", label: "Combined List", type: "directed" },
      { id: "ae7", source: "cross_rerank", target: "compression", label: "Top 5 Pristine", type: "directed" },
      { id: "ae8", source: "compression", target: "grounded_gen", label: "Compressed Context", type: "directed" }
    ],
    steps: [
      {
        stepIndex: 0,
        activeNodeId: "query_transform",
        activeEdgeId: null,
        title: "Step 1: Query Rewriting & HyDE (Fixing Bad Questions)",
        action: "QUERY_EXPANSION",
        simpleDefinition: "In simple words: Users often ask short or confusing questions. This step generates a hypothetical ideal answer first, then uses that rich imaginary paragraph to search. This bridges the gap between what you ask and what's written in documents!",
        description: "Uses Hypothetical Document Embeddings (HyDE) and sub-query decomposition to expand single questions into rich search targets.",
        state: {
          step: "1 of 8",
          user_input: "kernel page fault bug linux vs windows",
          rewritten_hyde_passage: "A hypothetical technical excerpt detailing Linux do_page_fault vs Windows MmAccessFault...",
          subqueries: ["Linux kernel page fault handler", "Windows MmAccessFault implementation"]
        },
        deepDive: {
          role: "Makes vague questions easy for the search engine to understand.",
          why: "Questions are short (5 words), while answers are long (100 words). HyDE creates an imaginary answer so vector math matches answer-to-answer.",
          inputs: "Raw user query.",
          mechanics: "Prompts a fast LLM to imagine a plausible answer, then embeds that imagined passage.",
          output: "Rich search query payload.",
          pitfalls: "If the imagined passage is completely wrong, it could guide search in the wrong direction.",
          langgraphCode: `# Step 1: HyDE Query Expansion
def hyde_expand_node(state: dict) -> dict:
    hyde_prompt = f"Write a brief textbook passage answering: {state['query']}"
    synthetic_answer = fast_llm.invoke(hyde_prompt).content
    return {"search_query": synthetic_answer}`
        }
      },
      {
        stepIndex: 1,
        activeNodeId: "query_router",
        activeEdgeId: "ae1",
        title: "Step 2: Smart Query Router (Traffic Cop)",
        action: "INTENT_ROUTING",
        simpleDefinition: "In simple words: Acts like a traffic police officer. It looks at your question and decides: 'Should I search the vector database for concepts, or the keyword search for exact error codes, or both?'",
        description: "Classifies user intent and activates the appropriate downstream retrieval branches.",
        state: {
          step: "2 of 8",
          intent_detected: "TECHNICAL_HYBRID",
          decision: "Activate BOTH Vector Search (for concepts) AND BM25 (for exact code words)",
          confidence: "99%"
        },
        deepDive: {
          role: "Sends the query only where it belongs.",
          why: "Why waste time searching a SQL database if the question is asking for HR policies? Router directs traffic efficiently.",
          inputs: "Expanded query from Step 1.",
          mechanics: "Structured classification output picks the active retrieval backends.",
          output: "Routing flags.",
          pitfalls: "A misclassified question might skip the database that actually holds the answer.",
          langgraphCode: `# Step 2: Query Router
def router_node(state: dict) -> dict:
    decision = router_llm.invoke(f"Route: {state['query']}")
    return {"route": "hybrid_search"}`
        }
      },
      {
        stepIndex: 2,
        activeNodeId: "dense_retrieval",
        activeEdgeId: "ae2",
        title: "Step 3A: Parallel Vector Search (Finding Concepts)",
        action: "VECTOR_SEARCH",
        simpleDefinition: "In simple words: Searches by MEANING. If you ask about 'car issues', it finds paragraphs about 'engine overheating' even if the word 'car' is never mentioned.",
        description: "Performs high-dimensional vector search to capture conceptual semantics, retrieving the top 20 candidate chunks.",
        state: {
          step: "3 of 8",
          engine: "Dense Bi-Encoder (BGE-Large)",
          found_items: "20 candidate paragraphs found by conceptual similarity",
          top_score: 0.88
        },
        deepDive: {
          role: "Finds ideas and synonyms.",
          why: "Handles natural language variations where people use different words for the same thing.",
          inputs: "Vector embeddings.",
          mechanics: "HNSW search in vector database.",
          output: "20 candidate chunks.",
          pitfalls: "Misses exact technical numbers and acronyms.",
          langgraphCode: `# Step 3A: Vector Search
def vector_search_node(state: dict) -> dict:
    docs = vector_store.similarity_search(state["search_query"], k=20)
    return {"dense_docs": docs}`
        }
      },
      {
        stepIndex: 3,
        activeNodeId: "sparse_bm25",
        activeEdgeId: "ae3",
        title: "Step 3B: Parallel BM25 Search (Finding Exact Keywords)",
        action: "KEYWORD_SEARCH",
        simpleDefinition: "In simple words: Searches by EXACT WORDS (like Google in the 2000s). Perfect for finding specific function names like 'do_page_fault', error codes like '404', or part IDs.",
        description: "Executes BM25 probabilistic keyword frequency search over inverted indexes, securing exact technical tokens.",
        state: {
          step: "4 of 8",
          engine: "BM25 Inverted Index",
          exact_words_matched: ["do_page_fault", "MmAccessFault", "PTE"],
          found_items: "20 candidate paragraphs found by exact word matches"
        },
        deepDive: {
          role: "Finds exact technical keywords that vector search ignores.",
          why: "Vector search often blurs specific model numbers or function names. BM25 guarantees 100% lexical precision.",
          inputs: "Raw question words.",
          mechanics: "BM25 word frequency index scoring.",
          output: "20 candidate chunks.",
          pitfalls: "Cannot understand synonyms if the exact word isn't in the document.",
          langgraphCode: `# Step 3B: BM25 Keyword Search
def bm25_search_node(state: dict) -> dict:
    docs = bm25_index.get_top_n(state["query"].split(), n=20)
    return {"bm25_docs": docs}`
        }
      },
      {
        stepIndex: 4,
        activeNodeId: "rrf_fusion",
        activeEdgeId: "ae4",
        title: "Step 4: Reciprocal Rank Fusion (Merging the Two Lists)",
        action: "RANK_FUSION",
        simpleDefinition: "In simple words: Now we have 2 separate top-20 lists (one from keyword search, one from meaning search). This step intelligently merges them into one fair master list based on their rankings!",
        description: "Uses the Reciprocal Rank Fusion (RRF) mathematical formula to combine disparate search score scales fairly.",
        state: {
          step: "5 of 8",
          formula: "RRF Score = 1 / (60 + Rank)",
          total_combined: "32 unique paragraphs deduplicated and ranked fairly",
          overlap: "40% of paragraphs appeared in both lists!"
        },
        deepDive: {
          role: "Fairly merges keyword results with vector results.",
          why: "You cannot add a vector score (0.85) to a BM25 score (14.2) directly—they use different scales. RRF uses rank position (1st, 2nd, 3rd) instead of raw numbers.",
          inputs: "Two sorted lists: vector docs + BM25 docs.",
          mechanics: "Assigns $1/(60+r)$ points for every appearance and sorts descending.",
          output: "Unified list of 32 deduplicated chunks.",
          pitfalls: "Requires a reasonable constant $k=60$ to avoid rank bias.",
          langgraphCode: `# Step 4: Reciprocal Rank Fusion
def rrf_merge_node(state: dict) -> dict:
    # Merges dense and sparse lists by rank reciprocal
    fused_docs = rrf_merge(state["dense_docs"], state["bm25_docs"])
    return {"fused_candidates": fused_docs}`
        }
      },
      {
        stepIndex: 5,
        activeNodeId: "cross_rerank",
        activeEdgeId: "ae6",
        title: "Step 5: Cross-Encoder Re-Ranking (The Strict Judge)",
        action: "RE_RANKING",
        simpleDefinition: "In simple words: Out of the 32 paragraphs, 25 are probably junk or distractors. A powerful second AI model inspects the question and each paragraph side-by-side, throwing away 80% of the junk and keeping only the Top-5 pristine paragraphs!",
        description: "A deep cross-attention transformer model evaluates (question, paragraph) pairs simultaneously, filtering out irrelevant noise.",
        state: {
          step: "6 of 8",
          model: "Cohere Rerank / BGE-Reranker-Large",
          candidates_checked: 32,
          junk_discarded: 27,
          pristine_kept: 5,
          accuracy_boost: "+35% more relevant than simple RAG!"
        },
        deepDive: {
          role: "Throws away false positives and distractors.",
          why: "Vector search only checks shallow cosine similarity. A cross-encoder reads both texts together with full attention to verify true relevance.",
          inputs: "32 candidate paragraphs + user question.",
          mechanics: "Pairs fed into cross-encoder transformer; outputs exact relevance score between 0.0 and 1.0.",
          output: "Top 5 highest quality paragraphs.",
          pitfalls: "Adds ~100-200ms latency, but drastically improves answer quality.",
          langgraphCode: `# Step 5: Cross-Encoder Re-Ranker
from sentence_transformers import CrossEncoder

def rerank_node(state: dict) -> dict:
    reranker = CrossEncoder("BAAI/bge-reranker-large")
    pairs = [[state["query"], d.page_content] for d in state["fused_candidates"]]
    scores = reranker.predict(pairs)
    top_5 = [d for d, s in sorted(zip(state["fused_candidates"], scores), reverse=True)[:5]]
    return {"top_docs": top_5}`
        }
      },
      {
        stepIndex: 6,
        activeNodeId: "compression",
        activeEdgeId: "ae7",
        title: "Step 6: Context Compression & Re-ordering (Lost-in-the-Middle Fix)",
        action: "CONTEXT_OPTIMIZATION",
        simpleDefinition: "In simple words: AI models pay the most attention to things placed at the very beginning and very end of their prompt (they tend to forget facts buried in the middle!). This step places the most important facts at the top and bottom, and deletes filler words.",
        description: "Re-orders the top 5 chunks into a biconcave attention curve and prunes filler stopwords to optimize token costs and attention focus.",
        state: {
          step: "7 of 8",
          original_words: 2400,
          compressed_words: 950,
          token_savings: "60% cheaper prompt!",
          order: "[Most Important #1, Important #3, ..., Important #2 at the end]"
        },
        deepDive: {
          role: "Solves the 'Lost in the Middle' cognitive blind spot of LLMs.",
          why: "Research proves LLMs struggle to recall facts placed in the middle of long prompts. Putting key facts at the edges ensures 100% recall.",
          inputs: "Top 5 reranked paragraphs.",
          mechanics: "Biconcave re-ordering + LLMLingua selective token compression.",
          output: "Compact, perfectly ordered context.",
          pitfalls: "Over-compressing can remove small numbers or dates.",
          langgraphCode: `# Step 6: Reorder chunks to fight Lost-in-the-Middle
def reorder_context_node(state: dict) -> dict:
    docs = state["top_docs"]
    reordered = [docs[0], docs[2], docs[4], docs[3], docs[1]]
    return {"optimized_context": reordered}`
        }
      },
      {
        stepIndex: 7,
        activeNodeId: "grounded_gen",
        activeEdgeId: "ae8",
        title: "Step 7: Grounded LLM Generation with Citations",
        action: "ANSWER_SYNTHESIS",
        simpleDefinition: "In simple words: The LLM writes a high-quality answer and includes bracketed citations like [Source 1] and [Source 2] for every single claim, so you can verify exactly where each fact came from!",
        description: "Synthesizes an authoritative answer with strict citation attribution, eliminating unverified assumptions.",
        state: {
          step: "8 of 8",
          answer_preview: "Linux handles page faults in do_page_fault() [Source 1], whereas Windows uses MmAccessFault() [Source 2]...",
          citations_count: 3,
          hallucination_rate: "< 2%",
          status: "Verified answer delivered!"
        },
        deepDive: {
          role: "Delivers an answer you can actually trust and audit.",
          why: "Without citations, you never know if the AI is making things up. Citations make the output enterprise-ready.",
          inputs: "Optimized context + question.",
          mechanics: "System prompt mandates bracketed source tags for every statement.",
          output: "Audited response with inline citations.",
          pitfalls: "Model must be prompted strictly so it doesn't invent fake source IDs.",
          langgraphCode: `# Step 7: Grounded Answer with Citations
def generate_cited_answer(state: dict) -> dict:
    prompt = f"Answer using ONLY these sources. Cite every sentence with [Source X]:\n{state['optimized_context']}\nQuestion: {state['query']}"
    return {"final_answer": llm.invoke(prompt).content}`
        }
      }
    ]
  },

  self_rag: {
    id: "self_rag",
    name: "Self-RAG (LangGraph StateGraph)",
    badge: "Self-Correcting Loops",
    badgeClass: "badge-hard",
    category: "Self-Reflective Agentic Loop",
    topology: "Cyclical Graph with Reflection Nodes & Loops",
    simpleDefinition: "Self-RAG is like having a strict AI teacher watching over the pipeline! It checks: 'Do we actually need to search? Are the retrieved documents relevant? If NO, rewrite the query and search again! Did the generated answer hallucinate? If YES, rewrite the answer!' It self-heals until the answer is 100% verified.",
    description: "State-of-the-art agentic RAG built on LangGraph. Features dynamic reflection tokens ([Retrieve], [IsRel], [IsSupported], [IsUseful]), conditional branching, and automatic query rewriting feedback loops.",
    summaryMetrics: {
      stages: 9,
      latency: "Adaptive (~1200-2400ms)",
      accuracy: "Superior (95-98%)",
      hallucinationRisk: "Near Zero (<1%)",
      complexity: "Cyclical StateGraph"
    },
    pros: [
      "Dynamic search: skips retrieval entirely for simple conversational queries, saving time and money",
      "Document relevance grader rejects junk chunks and automatically loops back to rewrite the query",
      "Hallucination grader checks every sentence against facts and forces regeneration if ungrounded claims exist",
      "Self-healing: automatically fixes its own search failures without crashing"
    ],
    cons: [
      "Can take 1-2 seconds longer if it triggers a rewrite or regeneration loop",
      "Must set a maximum retry counter (e.g. max 2 retries) to prevent infinite loops"
    ],
    nodes: [
      { id: "start_node", label: "1. START State", role: "START", icon: "play", x: 60, y: 160 },
      { id: "retrieve_gate", label: "2. Search Gate [Retrieve]", role: "GATE", icon: "help-circle", x: 210, y: 160 },
      { id: "retrieval_node", label: "3. Knowledge Search", role: "RETRIEVE", icon: "database", x: 370, y: 160 },
      { id: "grade_docs", label: "4. Doc Grader [IsRel]", role: "EVALUATE", icon: "check-circle", x: 530, y: 160 },
      { id: "rewrite_query", label: "5. Query Rewriter (Loop)", role: "REWRITE", icon: "refresh-cw", x: 450, y: 280 },
      { id: "generate_node", label: "6. Grounded Generator", role: "GENERATE", icon: "cpu", x: 690, y: 160 },
      { id: "grade_hallucination", label: "7. Fact Check [IsSupported]", role: "EVALUATE", icon: "shield-alert", x: 840, y: 160 },
      { id: "grade_useful", label: "8. Quality Check [IsUseful]", role: "EVALUATE", icon: "thumbs-up", x: 840, y: 280 },
      { id: "end_node", label: "9. END Verified", role: "END", icon: "check-square", x: 990, y: 220 }
    ],
    edges: [
      { id: "se1", source: "start_node", target: "retrieve_gate", label: "Start Query", type: "directed" },
      { id: "se2", source: "retrieve_gate", target: "retrieval_node", label: "[Search Needed]", type: "conditional" },
      { id: "se3", source: "retrieve_gate", target: "generate_node", label: "[Direct Answer]", type: "conditional" },
      { id: "se4", source: "retrieval_node", target: "grade_docs", label: "Raw Chunks", type: "directed" },
      { id: "se5", source: "grade_docs", target: "generate_node", label: "[Docs are Good!]", type: "conditional" },
      { id: "se6", source: "grade_docs", target: "rewrite_query", label: "[Docs are Junk! ➔ Retry]", type: "loop" },
      { id: "se7", source: "rewrite_query", target: "retrieval_node", label: "Loop Back (Retry + 1)", type: "loop" },
      { id: "se8", source: "generate_node", target: "grade_hallucination", label: "Draft Answer", type: "directed" },
      { id: "se9", source: "grade_hallucination", target: "generate_node", label: "[Hallucination! ➔ Fix]", type: "loop" },
      { id: "se10", source: "grade_hallucination", target: "grade_useful", label: "[Facts Verified]", type: "conditional" },
      { id: "se11", source: "grade_useful", target: "rewrite_query", label: "[Incomplete Answer]", type: "loop" },
      { id: "se12", source: "grade_useful", target: "end_node", label: "[100% Perfect ➔ Deliver]", type: "conditional" }
    ],
    steps: [
      {
        stepIndex: 0,
        activeNodeId: "start_node",
        activeEdgeId: null,
        title: "Step 1: Graph State Initialization",
        action: "START",
        simpleDefinition: "In simple words: The agent wakes up and sets up a memory notebook (StateGraph) to track your question, retrieved documents, checkmark grades, and retry counts.",
        description: "Instantiates typed GraphState schema to store all execution variables and reflection audit logs.",
        state: {
          step: "1 of 11",
          question: "How does the Linux eBPF verifier guarantee safety against infinite loops?",
          documents: [],
          retry_count: 0,
          audit_trail: []
        },
        deepDive: {
          role: "Sets up memory for the agent loop.",
          why: "An agent needs to remember what it has already tried so it doesn't repeat past mistakes.",
          inputs: "Initial user question.",
          mechanics: "Creates typed dictionary in LangGraph.",
          output: "Initialized StateGraph.",
          pitfalls: "Missing state keys causes crashes in downstream nodes.",
          langgraphCode: `# Step 1: LangGraph State Definition
from typing import TypedDict, List

class GraphState(TypedDict):
    question: str
    documents: List[str]
    generation: str
    is_relevant: bool
    is_supported: bool
    retry_count: int`
        }
      },
      {
        stepIndex: 1,
        activeNodeId: "retrieve_gate",
        activeEdgeId: "se1",
        title: "Step 2: Adaptive Search Gate ([Retrieve] Token)",
        action: "DECISION_GATE",
        simpleDefinition: "In simple words: The AI asks itself: 'Do I actually need to search the database to answer this, or do I already know it?' If you just said 'Hello', it answers directly without wasting time searching!",
        description: "Classifier decides whether external retrieval is strictly necessary for the query.",
        state: {
          step: "2 of 11",
          decision: "[Retrieve: YES]",
          reason: "Question asks for deep internal kernel verifier algorithms not found in general memory.",
          branch: "Routing forward to Knowledge Search"
        },
        deepDive: {
          role: "Saves money and time by skipping search when unneeded.",
          why: "Simple greetings or general reasoning don't need expensive database queries.",
          inputs: "Question string.",
          mechanics: "Fast classifier outputs [Retrieve] or [No Retrieve].",
          output: "Routing signal.",
          pitfalls: "Skipping search when obscure facts are actually needed.",
          langgraphCode: `# Step 2: Adaptive Decision Gate
def check_retrieval_gate(state: GraphState) -> str:
    prompt = f"Does answering '{state['question']}' require factual database search? YES or NO."
    decision = fast_llm.invoke(prompt).content
    return "search_node" if "YES" in decision else "generate_direct"`
        }
      },
      {
        stepIndex: 2,
        activeNodeId: "retrieval_node",
        activeEdgeId: "se2",
        title: "Step 3: Initial Knowledge Search",
        action: "DATABASE_SEARCH",
        simpleDefinition: "In simple words: Searches the database for documents matching your question. In this example, the initial search returns mediocre, borderline documents.",
        description: "Executes initial vector search across indexed knowledge stores.",
        state: {
          step: "3 of 11",
          query: "How does the Linux eBPF verifier guarantee safety against infinite loops?",
          retrieved_count: 4,
          first_chunk: "eBPF is a virtual machine inside the Linux kernel..."
        },
        deepDive: {
          role: "Pulls first batch of candidate evidence.",
          why: "Supplies raw facts for inspection.",
          inputs: "User query.",
          mechanics: "Vector database search.",
          output: "4 candidate documents.",
          pitfalls: "Initial search can pull generic background text instead of specific answers.",
          langgraphCode: `# Step 3: Search Database
def search_node(state: GraphState) -> dict:
    docs = retriever.invoke(state["question"])
    return {"documents": [d.page_content for d in docs]}`
        }
      },
      {
        stepIndex: 3,
        activeNodeId: "grade_docs",
        activeEdgeId: "se4",
        title: "Step 4: Document Grader (Detecting Bad Search Results)",
        action: "RELEVANCE_CHECK",
        simpleDefinition: "In simple words: The AI grader checks each paragraph: 'Does this ACTUALLY answer the question?' Here, the grader spots that the chunks are too vague and marks them as JUNK. Instead of giving up, it triggers a rewrite loop!",
        description: "Evaluator LLM grades chunk relevance. Detects insufficient relevance, activating the autonomous Query Rewriter Loop.",
        state: {
          step: "4 of 11",
          token: "[IsRel: NO]",
          verdict: "Chunks are too generic. They talk about eBPF in general, but don't explain loop termination safety!",
          action: "TRIGGERING QUERY REWRITE LOOP BACK ➔"
        },
        deepDive: {
          role: "Catches bad search results before they cause hallucinations.",
          why: "Garbage in, garbage out. If the retrieved text is useless, answering now guarantees failure.",
          inputs: "Retrieved chunks + question.",
          mechanics: "Grader LLM scores relevance. If 0 chunks pass, returns rewrite branch.",
          output: "State flag: `is_relevant = False`.",
          pitfalls: "Grading too strictly can reject helpful background context.",
          langgraphCode: `# Step 4: Grade Documents
def grade_docs_node(state: GraphState) -> dict:
    grader_prompt = f"Are these docs relevant to '{state['question']}'? YES or NO."
    verdict = grader_llm.invoke(grader_prompt).content
    is_rel = "YES" in verdict
    return {"is_relevant": is_rel}`
        }
      },
      {
        stepIndex: 4,
        activeNodeId: "rewrite_query",
        activeEdgeId: "se6",
        title: "Step 5: Query Rewriter (Autonomous Self-Correction Loop)",
        action: "SELF_HEALING_LOOP",
        simpleDefinition: "In simple words: The AI realizes: 'My search query was too vague. Let me rewrite it into exact technical keywords: DAG depth-first search, bounded loops, back-edges!' and loops back to search again!",
        description: "The agent reflects on why search failed, optimizes the query keywords, increments retry count, and loops back to Step 3.",
        state: {
          step: "5 of 11",
          original: "How does the Linux eBPF verifier guarantee safety against infinite loops?",
          reformulated: "Linux kernel BPF verifier DAG depth-first search loop detection back-edges bounded loops insns",
          retry_count: 1,
          action: "LOOPING BACK TO SEARCH WITH SHARP KEYWORDS ↺"
        },
        deepDive: {
          role: "Self-healing mechanism that fixes bad queries.",
          why: "Humans often ask questions using everyday words. The rewriter translates them into the technical jargon used in official manuals.",
          inputs: "Original question + failure reason.",
          mechanics: "Prompts LLM to reformulate keywords. Increments `retry_count += 1`.",
          output: "Sharpened search query pointing back to search node.",
          pitfalls: "Must have a retry limit (max 2 retries) to avoid infinite loops.",
          langgraphCode: `# Step 5: Query Rewriting Node (Loop)
def rewrite_query_node(state: GraphState) -> dict:
    prompt = f"Rewrite '{state['question']}' into sharp technical keywords for documentation search."
    new_query = fast_llm.invoke(prompt).content
    return {"question": new_query, "retry_count": state["retry_count"] + 1}`
        }
      },
      {
        stepIndex: 5,
        activeNodeId: "retrieval_node",
        activeEdgeId: "se7",
        title: "Step 6: Second Search (High-Precision Results Found!)",
        action: "RE_RETRIEVAL",
        simpleDefinition: "In simple words: The search runs again with the sharpened technical keywords. Bingo! It finds exact kernel documentation explaining DAG loop checks!",
        description: "Knowledge store is re-queried using the optimized query, successfully pulling pristine documentation.",
        state: {
          step: "6 of 11",
          query: "Linux kernel BPF verifier DAG depth-first search loop detection back-edges...",
          status: "HIGH-CONFIDENCE DOCUMENTATION FOUND!",
          snippet: "BPF verifier constructs a Directed Acyclic Graph (DAG) and rejects backward jump edges..."
        },
        deepDive: {
          role: "Executes the second-chance search.",
          why: "Proves that self-correction works: second search succeeds where first search failed.",
          inputs: "Reformulated query.",
          mechanics: "Vector + keyword search with refined query.",
          output: "Pristine candidate documents.",
          pitfalls: "If second search fails, fall back to general knowledge synthesis.",
          langgraphCode: `# Step 6: Loop edge in LangGraph
workflow.add_edge("rewrite_query", "retrieval_node")`
        }
      },
      {
        stepIndex: 6,
        activeNodeId: "grade_docs",
        activeEdgeId: "se4",
        title: "Step 7: Document Grader Approval ([IsRel: YES])",
        action: "RELEVANCE_PASS",
        simpleDefinition: "In simple words: The grader checks the new documents: 'Are these relevant now?' YES! 100% relevant. Conditional edge approves the flow to proceed to Generation!",
        description: "Grader gives unanimous approval to the new documents. Flow routes forward.",
        state: {
          step: "7 of 11",
          token: "[IsRel: YES]",
          relevant_docs: "4 out of 4 chunks are directly relevant!",
          branch: "Routing forward to Generator ➔"
        },
        deepDive: {
          role: "Validates that the self-correction loop succeeded.",
          why: "Ensures the generator only receives verified domain facts.",
          inputs: "New documents from Step 6.",
          mechanics: "Grader LLM passes all chunks.",
          output: "Approval flag.",
          pitfalls: "None.",
          langgraphCode: `# Step 7: Conditional branch to generator
def decide_to_generate(state: GraphState) -> str:
    if state["is_relevant"]:
        return "generate_node"
    return "rewrite_query"`
        }
      },
      {
        stepIndex: 7,
        activeNodeId: "generate_node",
        activeEdgeId: "se5",
        title: "Step 8: Context-Constrained Generator ([Generate])",
        action: "DRAFT_WRITING",
        simpleDefinition: "In simple words: The generator writes a draft answer using ONLY the verified facts. It is strictly forbidden from guessing or adding outside claims.",
        description: "Synthesizes a draft response conditioned strictly on the verified evidence chunks.",
        state: {
          step: "8 of 11",
          token: "[Generate]",
          draft_answer: "The Linux eBPF verifier guarantees termination by modeling instructions as a Directed Acyclic Graph (DAG). It checks all possible code paths and rejects back-edges that do not have bounded loop conditions.",
          status: "Draft ready for fact-checking"
        },
        deepDive: {
          role: "Writes the initial answer.",
          why: "Converts technical documentation into a readable answer.",
          inputs: "Verified chunks + question.",
          mechanics: "Conditioned generation prompt.",
          output: "Draft answer text in state.",
          pitfalls: "Even with good facts, LLMs might accidentally slip in an ungrounded claim.",
          langgraphCode: `# Step 8: Constrained Generator
def generate_node(state: GraphState) -> dict:
    prompt = f"Answer '{state['question']}' using ONLY this context:\n{state['documents']}"
    return {"generation": llm.invoke(prompt).content}`
        }
      },
      {
        stepIndex: 8,
        activeNodeId: "grade_hallucination",
        activeEdgeId: "se8",
        title: "Step 9: Hallucination & Fact Check ([IsSupported])",
        action: "FACT_CHECKING",
        simpleDefinition: "In simple words: The AI fact-checker inspects every single sentence of the draft against the source text: 'Did the AI invent anything that wasn't in the book?' Verdict: ZERO hallucinations! Every sentence is 100% backed by the text.",
        description: "Evaluates whether every claim in the response is faithfully grounded in the retrieved sources.",
        state: {
          step: "9 of 11",
          token: "[IsSupported: YES]",
          hallucinated_claims: 0,
          grounding_score: "100% Grounded in Facts",
          verdict: "PASSED! No hallucinations detected."
        },
        deepDive: {
          role: "Safety gate that kills hallucinations before the user sees them.",
          why: "The biggest danger of AI is confident-sounding lies. This node guarantees factual honesty.",
          inputs: "Draft answer + reference documents.",
          mechanics: "Natural Language Inference checks entailment: Does Context imply Draft?",
          output: "State flag: `is_supported = True`.",
          pitfalls: "If hallucination is detected, conditional edge loops back to regenerate.",
          langgraphCode: `# Step 9: Hallucination Grader
def check_hallucination_node(state: GraphState) -> dict:
    prompt = f"Are all claims in '{state['generation']}' supported by '{state['documents']}'? YES or NO."
    verdict = grader_llm.invoke(prompt).content
    return {"is_supported": "YES" in verdict}`
        }
      },
      {
        stepIndex: 9,
        activeNodeId: "grade_useful",
        activeEdgeId: "se10",
        title: "Step 10: Answer Quality & Utility Check ([IsUseful])",
        action: "UTILITY_CHECK",
        simpleDefinition: "In simple words: An answer can be factually true, but still fail to answer what the user asked. This node checks: 'Does this actually solve the user's question clearly?' Verdict: YES! Perfect quality.",
        description: "Assesses whether the response directly and comprehensively answers the user's original inquiry.",
        state: {
          step: "10 of 11",
          token: "[IsUseful: YES]",
          completeness: "5 / 5 (Comprehensive & Clear)",
          verdict: "User intent fully satisfied."
        },
        deepDive: {
          role: "Ensures the answer is genuinely helpful.",
          why: "An AI might give a technically true answer that completely misses the point. Utility check ensures user satisfaction.",
          inputs: "User question + verified answer.",
          mechanics: "Quality scoring prompt.",
          output: "State flag: `is_useful = True`.",
          pitfalls: "None.",
          langgraphCode: `# Step 10: Utility Grader
def check_useful_node(state: GraphState) -> dict:
    prompt = f"Does '{state['generation']}' satisfactorily answer '{state['question']}'? YES or NO."
    return {"is_useful": "YES" in grader_llm.invoke(prompt).content}`
        }
      },
      {
        stepIndex: 10,
        activeNodeId: "end_node",
        activeEdgeId: "se12",
        title: "Step 11: Graph Termination & Verified Output Delivered",
        action: "TERMINATION",
        simpleDefinition: "In simple words: Mission accomplished! The StateGraph finishes at the terminal END node, delivering a grounded, audited, and 100% verified answer with complete proof.",
        description: "StateGraph completes execution. Delivers verified response and full reflection audit trail.",
        state: {
          step: "11 of 11",
          node: "__end__",
          status: "SUCCESSFULLY DELIVERED",
          reflection_tokens: ["[Retrieve: yes]", "[IsRel: no ➔ Loop]", "[IsRel: yes]", "[Generate]", "[IsSupported: yes]", "[IsUseful: yes]"],
          final_answer: "The Linux eBPF verifier guarantees safety against infinite loops by: 1) Modeling bytecode as a Directed Acyclic Graph (DAG), 2) Forbidding backward jump edges that lack bounded loop conditions, 3) Pruning equivalent register states, and 4) Enforcing a strict 1-million instruction exploration limit."
        },
        deepDive: {
          role: "Delivers the final verified answer.",
          why: "Concludes the agent lifecycle.",
          inputs: "Final StateGraph memory.",
          mechanics: "Emits payload and terminates graph.",
          output: "Enterprise-grade verified answer.",
          pitfalls: "None.",
          langgraphCode: `# Step 11: LangGraph Workflow Compilation
workflow.add_conditional_edges("grade_useful", lambda s: END if s["is_useful"] else "rewrite_query")
app = workflow.compile()`
        }
      }
    ]
  },

  crag: {
    id: "crag",
    name: "CRAG (Corrective RAG)",
    badge: "Confidence-Gated",
    badgeClass: "badge-medium",
    category: "Confidence-Gated Corrective Pipeline",
    topology: "Branched Graph with Automated Web Search Fallback",
    simpleDefinition: "CRAG stands for Corrective RAG. It never blindly trusts its search results! A confidence evaluator rates results into 3 bands: if the search was great, it cleans the text; if the search failed, it automatically searches the live web; if ambiguous, it merges internal documents with web facts!",
    description: "Evaluates retrieval confidence into three distinct bands (Correct, Ambiguous, Incorrect). If confidence is high, it triggers decompose-filter-recompose knowledge refinement; if low, it completely falls back to web search; if ambiguous, it combines vector retrieval with external web evidence.",
    summaryMetrics: {
      stages: 7,
      latency: "Medium (~800-1600ms)",
      accuracy: "High (90-95%)",
      hallucinationRisk: "Very Low (<2%)",
      complexity: "Confidence-gated branching"
    },
    pros: [
      "Never gives up when internal documents don't have the answer: automatically switches to live web search",
      "Strips out useless sentences from good documents so the prompt stays clean and focused",
      "Combines private company docs with fresh web facts when a topic is evolving",
      "Drastically reduces hallucinations caused by outdated or missing documents"
    ],
    cons: [
      "Requires an external search API key (Tavily or Google) for the web fallback path",
      "Slightly higher latency when web search is triggered"
    ],
    nodes: [
      { id: "query_input", label: "1. Query Intake", role: "START", icon: "play", x: 60, y: 180 },
      { id: "retriever", label: "2. Internal Search", role: "RETRIEVE", icon: "database", x: 210, y: 180 },
      { id: "retrieval_evaluator", label: "3. Confidence Scorer", role: "EVALUATE", icon: "help-circle", x: 370, y: 180 },
      { id: "web_fallback", label: "4A. Web Search Fallback", role: "TOOL", icon: "search", x: 530, y: 80 },
      { id: "knowledge_refiner", label: "4B. Sentence Refiner", role: "PROCESS", icon: "scissors", x: 530, y: 280 },
      { id: "knowledge_merger", label: "5. Fact Union", role: "FUSION", icon: "git-merge", x: 690, y: 180 },
      { id: "generator", label: "6. Verified LLM", role: "GENERATE", icon: "sparkles", x: 840, y: 180 },
      { id: "end_output", label: "7. Final Answer", role: "END", icon: "check-square", x: 990, y: 180 }
    ],
    edges: [
      { id: "ce1", source: "query_input", target: "retriever", label: "Question", type: "directed" },
      { id: "ce2", source: "retriever", target: "retrieval_evaluator", label: "Internal Chunks", type: "directed" },
      { id: "ce3", source: "retrieval_evaluator", target: "web_fallback", label: "[Score < 0.4: Search Web]", type: "conditional" },
      { id: "ce4", source: "retrieval_evaluator", target: "knowledge_refiner", label: "[Score >= 0.7: Clean Text]", type: "conditional" },
      { id: "ce5", source: "retrieval_evaluator", target: "knowledge_merger", label: "[0.4-0.7: Combine Both]", type: "conditional" },
      { id: "ce6", source: "web_fallback", target: "knowledge_merger", label: "Web Evidence", type: "directed" },
      { id: "ce7", source: "knowledge_refiner", target: "knowledge_merger", label: "Cleaned Sentences", type: "directed" },
      { id: "ce8", source: "knowledge_merger", target: "generator", label: "Fused Truth", type: "directed" },
      { id: "ce9", source: "generator", target: "end_output", label: "Delivered", type: "directed" }
    ],
    steps: [
      {
        stepIndex: 0,
        activeNodeId: "query_input",
        activeEdgeId: null,
        title: "Step 1: User Query Intake",
        action: "QUERY_INTAKE",
        simpleDefinition: "In simple words: The user asks a question that might require both internal company knowledge and latest public web updates.",
        description: "Initializes CRAG pipeline tracking query string, evaluation confidence band, and web fallback triggers.",
        state: {
          step: "1 of 7",
          query: "What are the latest vulnerability mitigations for Spectre-BHB in Intel Alder Lake?",
          confidence_band: "PENDING_EVALUATION"
        },
        deepDive: {
          role: "Starts the CRAG workflow.",
          why: "Sets up memory buffers for both internal docs and web fallback.",
          inputs: "User query.",
          mechanics: "Initializes state dictionary.",
          output: "CRAG state initialized.",
          pitfalls: "None.",
          langgraphCode: `# Step 1: CRAG State
class CRAGState(TypedDict):
    question: str
    documents: List[str]
    web_documents: List[str]
    confidence_band: str`
        }
      },
      {
        stepIndex: 1,
        activeNodeId: "retriever",
        activeEdgeId: "ce1",
        title: "Step 2: Internal Vector Store Search",
        action: "INTERNAL_SEARCH",
        simpleDefinition: "In simple words: Searches your internal company database first to see if you already have the answer.",
        description: "Queries the internal vector database to extract candidate knowledge chunks.",
        state: {
          step: "2 of 7",
          chunks_found: 4,
          observation: "Found general Spectre documentation, but it lacks the latest 2024 microcode updates!"
        },
        deepDive: {
          role: "Checks private knowledge base first.",
          why: "Cheaper and more private than searching Google immediately.",
          inputs: "Query vector.",
          mechanics: "Vector database search.",
          output: "Internal chunks.",
          pitfalls: "Internal docs might be 6 months out of date.",
          langgraphCode: `# Step 2: Internal search
def retrieve_internal_node(state: CRAGState) -> dict:
    docs = retriever.invoke(state["question"])
    return {"documents": [d.page_content for d in docs]}`
        }
      },
      {
        stepIndex: 2,
        activeNodeId: "retrieval_evaluator",
        activeEdgeId: "ce2",
        title: "Step 3: Confidence Evaluator (The 3-Band Decision)",
        action: "CONFIDENCE_RATING",
        simpleDefinition: "In simple words: Rates search quality into 3 traffic-light bands: 🟢 High Score (Clean the text), 🔴 Low Score (Search the Web), 🟡 Medium Score (Merge Internal + Web). Here, score is 0.58 (Medium) ➔ triggers Web Search!",
        description: "Evaluates candidate relevance into 3 distinct bands: Correct (>=0.7), Ambiguous (0.4-0.7), or Incorrect (<0.4).",
        state: {
          step: "3 of 7",
          confidence_score: 0.58,
          verdict: "AMBIGUOUS (0.4 - 0.7) ➔ Internal docs have architecture, but need live web for latest patches!",
          action: "Triggering Parallel Web Search Fallback + Sentence Refinement"
        },
        deepDive: {
          role: "Prevents feeding bad search results into the LLM.",
          why: "If internal docs are poor, Simple RAG hallucinates. CRAG's evaluator catches this and routes to the web.",
          inputs: "Internal chunks + question.",
          mechanics: "Scoring model outputs score 0.0 to 1.0.",
          output: "Band flag in state.",
          pitfalls: "Evaluator model must be fast and lightweight.",
          langgraphCode: `# Step 3: 3-Band Evaluator
def evaluate_confidence(state: CRAGState) -> dict:
    score = score_relevance(state["documents"], state["question"])
    band = "CORRECT" if score >= 0.7 else ("AMBIGUOUS" if score >= 0.4 else "INCORRECT")
    return {"confidence_band": band}`
        }
      },
      {
        stepIndex: 3,
        activeNodeId: "web_fallback",
        activeEdgeId: "ce3",
        title: "Step 4A: Web Search Fallback (Fetching Live Facts)",
        action: "WEB_SEARCH",
        simpleDefinition: "In simple words: Since internal docs were incomplete, CRAG automatically searches Google/Tavily for fresh Intel security advisories and grabs the latest patch details!",
        description: "Executes live web search query (Tavily/Google API) to fetch fresh public security bulletins.",
        state: {
          step: "4 of 7",
          web_query: "Spectre-BHB branch history injection Alder Lake Intel mitigation microcode",
          web_snippets_found: 3,
          sources: ["intel.com/security", "kernel.org/patch"]
        },
        deepDive: {
          role: "Saves queries when internal docs lack the answer.",
          why: "Private databases go stale. Web search provides live, up-to-the-minute facts.",
          inputs: "Search query.",
          mechanics: "Tavily Search API call.",
          output: "Fresh web snippets.",
          pitfalls: "External search API cost and rate limits.",
          langgraphCode: `# Step 4A: Web Search Fallback
def web_search_node(state: CRAGState) -> dict:
    web_results = tavily_tool.invoke(state["question"])
    return {"web_documents": web_results}`
        }
      },
      {
        stepIndex: 4,
        activeNodeId: "knowledge_refiner",
        activeEdgeId: "ce4",
        title: "Step 4B: Sentence Refinement (Deleting Useless Sentences)",
        action: "SENTENCE_CLEANING",
        simpleDefinition: "In simple words: Even in a good paragraph, 70% of the sentences are useless filler. This step breaks the paragraph into sentences, deletes all the filler, and keeps only the pure facts!",
        description: "Decomposes internal documents into sentences, filters for relevance, and recomposes into compact factual bullet points.",
        state: {
          step: "5 of 7",
          original_sentences: 24,
          useless_sentences_deleted: 17,
          pure_facts_kept: 7,
          status: "Distractor sentences eliminated!"
        },
        deepDive: {
          role: "Strips out distractor sentences.",
          why: "Clean facts prevent the LLM from getting distracted by irrelevant background text.",
          inputs: "Internal chunks.",
          mechanics: "Decompose -> Filter with NLI -> Recompose.",
          output: "Refined internal sentences.",
          pitfalls: "Over-filtering might drop a qualifying condition.",
          langgraphCode: `# Step 4B: Decompose-Filter-Recompose
def refine_sentences_node(state: CRAGState) -> dict:
    sentences = split_sentences(state["documents"])
    good_sentences = [s for s in sentences if is_relevant(s, state["question"])]
    return {"refined_internal": ". ".join(good_sentences)}`
        }
      },
      {
        stepIndex: 5,
        activeNodeId: "knowledge_merger",
        activeEdgeId: "ce6",
        title: "Step 5: Knowledge Union (Merging Internal + Web Facts)",
        action: "FACT_MERGER",
        simpleDefinition: "In simple words: Merges the cleaned internal company facts with the fresh web facts into one cohesive, conflict-free summary for the LLM.",
        description: "Combines filtered internal domain facts with fresh external web search passages into a unified evidence payload.",
        state: {
          step: "6 of 7",
          combined_sources: ["Internal Architectural Specs", "Fresh Intel Security Web Bulletins"],
          total_clean_words: 650,
          status: "Perfect evidence payload ready!"
        },
        deepDive: {
          role: "Unifies private and public facts.",
          why: "Gives the LLM the best of both worlds: internal architecture context + live web patch updates.",
          inputs: "Refined internal text + web snippets.",
          mechanics: "Deduplication and timestamp-based conflict resolution.",
          output: "Unified context payload.",
          pitfalls: "Conflicting version numbers between old internal docs and new web docs.",
          langgraphCode: `# Step 5: Merge internal and web knowledge
def merge_knowledge_node(state: CRAGState) -> dict:
    combined = f"Internal:\n{state['refined_internal']}\n\nWeb:\n{state['web_documents']}"
    return {"fused_context": combined}`
        }
      },
      {
        stepIndex: 6,
        activeNodeId: "generator",
        activeEdgeId: "ce8",
        title: "Step 6: Constrained LLM Generation",
        action: "ANSWER_GENERATION",
        simpleDefinition: "In simple words: The LLM reads the fused truth and writes a complete, audited answer that includes both internal architecture context and the latest web patch mitigations!",
        description: "Synthesizes an audited answer conditioned on the verified knowledge union.",
        state: {
          step: "7 of 7",
          answer: "Mitigating Spectre-BHB in Intel Alder Lake requires: 1) Intel microcode update enabling eIBRS, and 2) Linux kernel BHI barrier mitigations to isolate branch history across privilege boundaries.",
          confidence: "99% Verified across Internal + Web"
        },
        deepDive: {
          role: "Writes the final answer for the user.",
          why: "Converts the dual-source facts into a polished answer.",
          inputs: "Fused context + user question.",
          mechanics: "Conditioned LLM generation.",
          output: "Verified final answer.",
          pitfalls: "None.",
          langgraphCode: `# Step 6: CRAG Final Generation
def generate_crag_answer(state: CRAGState) -> dict:
    prompt = f"Using this verified context:\n{state['fused_context']}\nAnswer: {state['question']}"
    return {"final_answer": llm.invoke(prompt).content}`
        }
      }
    ]
  },

  agentic_rag: {
    id: "agentic_rag",
    name: "Agentic RAG (Autonomous Multi-Tool)",
    badge: "Autonomous Agent",
    badgeClass: "badge-hard",
    category: "Autonomous Multi-Tool ReAct Loop",
    topology: "Plan-and-Solve Agentic Graph with Tool Dispatch",
    simpleDefinition: "Agentic RAG is when we let the LLM ITSELF think, decide whether to search, pick which tool to call (SQL database, Python sandbox, Web search, or Vector DB), and know exactly when to stop! It breaks hard multi-step problems into a plan and executes them autonomously.",
    description: "An autonomous agentic workflow where an LLM planner decomposes complex multi-hop requests into sub-tasks and dynamically dispatches specialized tools (Vector DB, Text-to-SQL, Live Web, Python Sandbox) in a ReAct reasoning loop.",
    summaryMetrics: {
      stages: 8,
      latency: "Adaptive (~1500-3500ms)",
      accuracy: "Highest (96-99%)",
      hallucinationRisk: "Near Zero (<1%)",
      complexity: "Multi-tool autonomous loop"
    },
    pros: [
      "Solves complex multi-step questions that simple RAG can never answer",
      "Pulls 100% accurate financial and database numbers by running real SQL queries",
      "Executes real Python code in a sandbox for exact compounded calculations (no LLM math errors!)",
      "Autonomous: decides on its own which tool to use, when to retry, and when to stop"
    ],
    cons: [
      "Takes longer (2-3 seconds) because it executes multiple real tools in sequence",
      "Requires sandboxed secure environment for running Python code"
    ],
    nodes: [
      { id: "goal_input", label: "1. User Goal", role: "START", icon: "play", x: 60, y: 180 },
      { id: "planner", label: "2. Task Planner", role: "PLANNER", icon: "layers", x: 190, y: 180 },
      { id: "react_orchestrator", label: "3. ReAct Brain", role: "ROUTER", icon: "cpu", x: 330, y: 180 },
      { id: "vector_tool", label: "Tool: Vector DB", role: "TOOL", icon: "database", x: 490, y: 60 },
      { id: "sql_tool", label: "Tool: SQL Database", role: "TOOL", icon: "align-left", x: 490, y: 140 },
      { id: "web_tool", label: "Tool: Tavily Web", role: "TOOL", icon: "search", x: 490, y: 220 },
      { id: "python_sandbox", label: "Tool: Python Math", role: "TOOL", icon: "cpu", x: 490, y: 300 },
      { id: "critique_reflection", label: "5. Progress Check", role: "EVALUATE", icon: "refresh-cw", x: 670, y: 180 },
      { id: "synthesizer", label: "6. Report Writer", role: "GENERATE", icon: "sparkles", x: 830, y: 180 },
      { id: "final_solution", label: "7. Delivered", role: "END", icon: "check-square", x: 980, y: 180 }
    ],
    edges: [
      { id: "age1", source: "goal_input", target: "planner", label: "Complex Goal", type: "directed" },
      { id: "age2", source: "planner", target: "react_orchestrator", label: "Subtask Plan", type: "directed" },
      { id: "age3", source: "react_orchestrator", target: "vector_tool", label: "Docs Needed", type: "conditional" },
      { id: "age4", source: "react_orchestrator", target: "sql_tool", label: "Query DB", type: "conditional" },
      { id: "age5", source: "react_orchestrator", target: "web_tool", label: "Fresh Facts", type: "conditional" },
      { id: "age6", source: "react_orchestrator", target: "python_sandbox", label: "Do Math", type: "conditional" },
      { id: "age7", source: "vector_tool", target: "critique_reflection", label: "Doc Results", type: "directed" },
      { id: "age8", source: "sql_tool", target: "critique_reflection", label: "Exact Numbers", type: "directed" },
      { id: "age9", source: "web_tool", target: "critique_reflection", label: "Web Results", type: "directed" },
      { id: "age10", source: "python_sandbox", target: "critique_reflection", label: "Calculations", type: "directed" },
      { id: "age11", source: "critique_reflection", target: "react_orchestrator", label: "[Next Subtask]", type: "loop" },
      { id: "age12", source: "critique_reflection", target: "synthesizer", label: "[Plan Done ➔ Finish]", type: "conditional" },
      { id: "age13", source: "synthesizer", target: "final_solution", label: "Delivered", type: "directed" }
    ],
    steps: [
      {
        stepIndex: 0,
        activeNodeId: "goal_input",
        activeEdgeId: null,
        title: "Step 1: Complex Multi-Hop Goal Intake",
        action: "GOAL_INTAKE",
        simpleDefinition: "In simple words: The user asks a complicated multi-part question: 'Find our Q3 cloud spending in SQL, check our architecture docs in Vector DB, and calculate our runway projection in Python.' Simple RAG cannot do this; an agent is required!",
        description: "Receives complex user objective requiring multi-source synthesis, database queries, and code execution.",
        state: {
          step: "1 of 8",
          goal: "Find Q3 cloud server costs in SQL, check architecture docs, and project next year's runway in Python.",
          status: "AGENT WAKING UP"
        },
        deepDive: {
          role: "Takes in goals that require multiple tools.",
          why: "One tool is never enough for real enterprise problems.",
          inputs: "User objective.",
          mechanics: "Initializes agent state in LangGraph.",
          output: "State with goal string.",
          pitfalls: "Vague user requests.",
          langgraphCode: `# Step 1: Agentic State
class AgenticRAGState(TypedDict):
    goal: str
    plan: List[str]
    current_step: int
    tool_history: List[dict]`
        }
      },
      {
        stepIndex: 1,
        activeNodeId: "planner",
        activeEdgeId: "age1",
        title: "Step 2: Task Decomposition (Making a Step-by-Step Plan)",
        action: "PLANNING",
        simpleDefinition: "In simple words: Like a project manager, the AI Planner breaks the big problem into 3 small tasks: Task 1) Query SQL database for exact Q3 costs; Task 2) Read cloud architecture docs; Task 3) Run Python code to calculate growth.",
        description: "The LLM Planner analyzes the goal and decomposes it into a sequence of actionable sub-tasks assigned to specialized tools.",
        state: {
          step: "2 of 8",
          plan: [
            "1. Run SQL query to get Q3 cluster spending",
            "2. Search Vector DB for architecture specs",
            "3. Execute Python code to calculate compounded runway"
          ],
          total_subtasks: 3
        },
        deepDive: {
          role: "Breaks big problems into solvable steps.",
          why: "Prevents model confusion by executing one clear action at a time.",
          inputs: "Goal string.",
          mechanics: "Structured output Pydantic plan.",
          output: "List of 3 subtasks.",
          pitfalls: "Subtasks must be ordered logically.",
          langgraphCode: `# Step 2: Task Planner
def planner_node(state: AgenticRAGState) -> dict:
    prompt = f"Decompose into tool steps: {state['goal']}"
    plan = planner_llm.with_structured_output(PlanSchema).invoke(prompt)
    return {"plan": plan.steps, "current_step": 0}`
        }
      },
      {
        stepIndex: 2,
        activeNodeId: "react_orchestrator",
        activeEdgeId: "age2",
        title: "Step 3: ReAct Brain (Picking the First Tool)",
        action: "TOOL_DISPATCH",
        simpleDefinition: "In simple words: The AI brain looks at Subtask 1: 'Get Q3 costs from database'. It decides: 'I will call the SQL Database Tool with query SELECT cluster, SUM(cost) FROM billing!'",
        description: "The ReAct brain formulates a tool call and dispatches the execution request to the PostgreSQL Database Tool.",
        state: {
          step: "3 of 8",
          subtask: "1. Query SQL database for Q3 costs",
          tool_chosen: "sql_tool",
          sql_query_generated: "SELECT cluster, SUM(cost_usd) FROM billing WHERE quarter = 'Q3' GROUP BY cluster;"
        },
        deepDive: {
          role: "Chooses the right tool and parameters.",
          why: "Connects LLM reasoning with real-world execution APIs.",
          inputs: "Current plan step.",
          mechanics: "OpenAI Function Calling schema.",
          output: "Tool invocation payload.",
          pitfalls: "Generating bad SQL syntax.",
          langgraphCode: `# Step 3: Tool Dispatch Router
def orchestrator_node(state: AgenticRAGState) -> dict:
    tool_call = llm_with_tools.invoke(state["plan"][state["current_step"]])
    return {"next_tool": tool_call}`
        }
      },
      {
        stepIndex: 3,
        activeNodeId: "sql_tool",
        activeEdgeId: "age4",
        title: "Step 4: SQL Tool Execution (Getting 100% Exact Numbers)",
        action: "TOOL_RUNNING",
        simpleDefinition: "In simple words: The SQL tool connects to the real database and runs the query. It returns exact numbers: $246,500 total Q3 cost! Zero guessing, zero hallucination.",
        description: "Executes the SQL query against the database warehouse, returning deterministic tabular data.",
        state: {
          step: "4 of 8",
          database: "PostgreSQL Production Billing",
          rows_returned: [
            {"cluster": "k8s-prod-us", "cost": "$142,500"},
            {"cluster": "k8s-analytics", "cost": "$89,200"},
            {"cluster": "k8s-staging", "cost": "$14,800"}
          ],
          total_q3_cost: "$246,500.00"
        },
        deepDive: {
          role: "Gets real database figures.",
          why: "LLMs can never guess financial numbers; SQL provides exact ground truth.",
          inputs: "SQL query string.",
          mechanics: "Read-only database connection.",
          output: "Exact JSON rows.",
          pitfalls: "Security: must use read-only database user.",
          langgraphCode: `# Step 4: SQL Tool
@tool
def sql_tool(query: str) -> list:
    """Executes read-only SQL queries on billing database."""
    return db.execute(query).fetchall()`
        }
      },
      {
        stepIndex: 4,
        activeNodeId: "python_sandbox",
        activeEdgeId: "age6",
        title: "Step 5: Python Sandbox Math (Zero Math Errors)",
        action: "CODE_EXECUTION",
        simpleDefinition: "In simple words: LLMs are notoriously bad at compounded math. To calculate next year's 8% monthly growth, the agent writes a Python script and runs it in a sandbox. Result: $1,108,342.15 exact!",
        description: "Executes generated Python code in an isolated Docker sandbox for 100% deterministic arithmetic.",
        state: {
          step: "5 of 8",
          code: "costs = [246500 * (1 + 0.08)**i for i in range(1, 5)]; print(f'Next Year: ${sum(costs):,.2f}')",
          output: "Next Year: $1,108,342.15",
          math_accuracy: "100% Deterministic Code Compute"
        },
        deepDive: {
          role: "Guarantees zero math errors.",
          why: "Calculators and Python code are infinitely better at compounding than neural networks.",
          inputs: "Python code string.",
          mechanics: "Subprocess execution inside secure container.",
          output: "Exact stdout string.",
          pitfalls: "Sandbox security must disable network and file deletion.",
          langgraphCode: `# Step 5: Python Sandbox Tool
@tool
def python_sandbox_tool(code: str) -> str:
    """Runs Python code in sandbox for exact math."""
    res = subprocess.run(["python", "-c", code], capture_output=True, text=True)
    return res.stdout.strip()`
        }
      },
      {
        stepIndex: 5,
        activeNodeId: "critique_reflection",
        activeEdgeId: "age10",
        title: "Step 6: Progress & Goal Check (Knowing When to Stop!)",
        action: "REFLECTION_CHECK",
        simpleDefinition: "In simple words: The agent checks its progress: 'Did I finish all 3 tasks in my plan? Task 1 (SQL): Done! Task 2 (Docs): Done! Task 3 (Math): Done! All tasks finished, time to stop tool execution!'",
        description: "The agent inspects all tool observations against the master plan to decide whether more tools are needed or if it should conclude.",
        state: {
          step: "6 of 8",
          tasks_completed: "3 of 3",
          decision: "All subtasks finished! Stop calling tools and proceed to final report synthesis."
        },
        deepDive: {
          role: "Knows when the goal is achieved and stops calling tools.",
          why: "Prevents infinite loops and unnecessary tool calls.",
          inputs: "Tool observations.",
          mechanics: "Compares completed subtasks with plan.",
          output: "Branch to finish.",
          pitfalls: "Agent looping indefinitely if it doesn't recognize completion.",
          langgraphCode: `# Step 6: Progress check
def check_progress(state: AgenticRAGState) -> str:
    if state["current_step"] >= len(state["plan"]):
        return "synthesizer"
    return "react_orchestrator" # Loop to next tool!`
        }
      },
      {
        stepIndex: 6,
        activeNodeId: "synthesizer",
        activeEdgeId: "age12",
        title: "Step 7: Multi-Tool Synthesis (Writing Executive Report)",
        action: "REPORT_SYNTHESIS",
        simpleDefinition: "In simple words: Gathers the exact SQL billing numbers, the Python runway projection, and the architecture documents into a polished, professional executive report.",
        description: "Synthesizes diverse tool outputs into a cohesive executive answer.",
        state: {
          step: "7 of 8",
          report_preview: "Q3 Cloud Spend was $246,500.00 across 3 Kubernetes clusters. Based on 8% quarterly growth, projected next year spend is $1,108,342.15...",
          tools_cited: ["PostgreSQL Warehouse", "Python Compute Sandbox", "Architecture Vector Store"]
        },
        deepDive: {
          role: "Packages all tool findings into human-friendly language.",
          why: "Users want a cohesive report, not raw database rows or python print statements.",
          inputs: "All tool history observations.",
          mechanics: "Conditioned report prompt.",
          output: "Executive answer.",
          pitfalls: "None.",
          langgraphCode: `# Step 7: Synthesize Report
def synthesize_report_node(state: AgenticRAGState) -> dict:
    prompt = f"Synthesize executive report for '{state['goal']}' using observations:\n{state['tool_history']}"
    return {"final_report": llm.invoke(prompt).content}`
        }
      },
      {
        stepIndex: 7,
        activeNodeId: "final_solution",
        activeEdgeId: "age13",
        title: "Step 8: Final Enterprise Solution Delivered",
        action: "COMPLETED",
        simpleDefinition: "In simple words: The user receives their answer with 100% exact math, verified database numbers, and clean citations. The agent finishes its job successfully!",
        description: "Delivers complete multi-modal answer with verified tool provenance.",
        state: {
          step: "8 of 8",
          execution_time: "2.8 seconds",
          status: "GOAL COMPLETED SUCCESSFULLY"
        },
        deepDive: {
          role: "Completes workflow.",
          why: "Concludes agent execution lifecycle.",
          inputs: "Final report.",
          mechanics: "Delivers payload to UI.",
          output: "Done.",
          pitfalls: "None.",
          langgraphCode: `# Step 8: Done!`
        }
      }
    ]
  },

  graph_rag: {
    id: "graph_rag",
    name: "Graph RAG (Microsoft GraphRAG & Triples)",
    badge: "Knowledge Graph",
    badgeClass: "badge-hard",
    category: "Knowledge Graph & Community Clustering",
    topology: "Dual-Engine Graph Pipeline (Macro Global + Micro Local)",
    simpleDefinition: "Graph RAG connects the dots across documents like a detective's evidence board! Instead of isolated paragraphs, it extracts people, servers, and concepts as NODES, and connections as EDGES (e.g. 'Alice works at Acme', 'Acme bought Server B'). Perfect for big-picture questions like 'What are the main themes across all 500 documents?'",
    description: "Constructs a Knowledge Graph of Entities and Relationship Triples (Subject-Predicate-Object) from the text corpus, applies Leiden community clustering to generate hierarchical multi-level summaries, and supports both Global Sensemaking and Local Subgraph Traversal.",
    summaryMetrics: {
      stages: 8,
      latency: "Medium (~1000-2000ms)",
      accuracy: "Superior (94-98%)",
      hallucinationRisk: "Extremely Low (<1%)",
      complexity: "Graph database with community clustering"
    },
    pros: [
      "Solves macro 'sensemaking' questions that vector search completely fails at (e.g. 'What are the main themes across all 500 documents?')",
      "Follows multi-hop relationships across different documents (Doc A connects to Doc C through Doc B)",
      "Hierarchical Leiden community clusters provide a bird's-eye executive view of the whole domain",
      "Every statement is grounded in concrete entity-relation triples"
    ],
    cons: [
      "Takes longer and costs more upfront to build the Knowledge Graph during document ingestion",
      "Requires graph database infrastructure (Neo4j or NetworkX)"
    ],
    nodes: [
      { id: "corpus_input", label: "1. Text Corpus", role: "START", icon: "file-text", x: 60, y: 180 },
      { id: "entity_triple_extractor", label: "2. Entity & Triple Extractor", role: "PROCESS", icon: "scissors", x: 190, y: 180 },
      { id: "knowledge_graph_builder", label: "3. Knowledge Graph Builder", role: "STORE", icon: "git-branch", x: 330, y: 180 },
      { id: "leiden_clustering", label: "4. Leiden Clustering", role: "GRAPH", icon: "git-merge", x: 470, y: 180 },
      { id: "community_summarizer", label: "5. Cluster Summarizer", role: "PROCESS", icon: "layers", x: 610, y: 180 },
      { id: "query_router_search", label: "6. Global vs Local Router", role: "ROUTER", icon: "help-circle", x: 740, y: 180 },
      { id: "subgraph_traversal", label: "7. 2-Hop Traversal", role: "RETRIEVE", icon: "search", x: 860, y: 180 },
      { id: "graph_synthesis", label: "8. Graph-Grounded Answer", role: "GENERATE", icon: "sparkles", x: 990, y: 180 }
    ],
    edges: [
      { id: "gre1", source: "corpus_input", target: "entity_triple_extractor", label: "Raw Docs", type: "directed" },
      { id: "gre2", source: "entity_triple_extractor", target: "knowledge_graph_builder", label: "Triples (A ➔ B)", type: "directed" },
      { id: "gre3", source: "knowledge_graph_builder", target: "leiden_clustering", label: "Network Graph", type: "directed" },
      { id: "gre4", source: "leiden_clustering", target: "community_summarizer", label: "Topical Communities", type: "directed" },
      { id: "gre5", source: "community_summarizer", target: "query_router_search", label: "Precomputed Summaries", type: "directed" },
      { id: "gre6", source: "query_router_search", target: "subgraph_traversal", label: "[Local Entity Query]", type: "conditional" },
      { id: "gre7", source: "query_router_search", target: "graph_synthesis", label: "[Global Macro Query]", type: "conditional" },
      { id: "gre8", source: "subgraph_traversal", target: "graph_synthesis", label: "Connected Subgraph", type: "directed" }
    ],
    steps: [
      {
        stepIndex: 0,
        activeNodeId: "corpus_input",
        activeEdgeId: null,
        title: "Step 1: Document Corpus Ingestion",
        action: "INGESTION",
        simpleDefinition: "In simple words: We load our 500 documents. But instead of chopping them into isolated islands, we prepare them to find relationships between people, servers, and concepts.",
        description: "Ingests raw text corpus into the Graph RAG pipeline.",
        state: {
          step: "1 of 8",
          documents_loaded: 500,
          status: "Ready for entity extraction"
        },
        deepDive: {
          role: "Loads files for graph relationship modeling.",
          why: "Prepares raw text for triple extraction.",
          inputs: "Raw files.",
          mechanics: "Document loading with provenance tracking.",
          output: "Text chunks.",
          pitfalls: "None.",
          langgraphCode: `# Step 1: Load corpus
docs = load_directory("./data")`
        }
      },
      {
        stepIndex: 1,
        activeNodeId: "entity_triple_extractor",
        activeEdgeId: "gre1",
        title: "Step 2: Entity & Relationship Triple Extraction",
        action: "TRIPLE_EXTRACTION",
        simpleDefinition: "In simple words: The AI reads every sentence and extracts facts in 3-part sentences called 'Triples': (Linux Kernel) ➔ [implements] ➔ (eBPF Verifier), and (eBPF Verifier) ➔ [prevents] ➔ (Infinite Loops).",
        description: "Extracts named Entities and their directed Relationship Triples (Subject-Predicate-Object).",
        state: {
          step: "2 of 8",
          entities_extracted: 840,
          triples_count: 1420,
          sample_triple: "(eBPF Verifier) --[prevents]--> (Infinite Loops)"
        },
        deepDive: {
          role: "Extracts facts as graph connections.",
          why: "Knowledge is a network of connections, not just isolated paragraphs.",
          inputs: "Text chunks.",
          mechanics: "Prompts LLM to extract (Subject, Relation, Object) tuples.",
          output: "List of triples.",
          pitfalls: "Name variations (e.g. 'Linux' vs 'Linux OS').",
          langgraphCode: `# Step 2: Extract Triples
def extract_triples_node(state: dict) -> dict:
    triples = extractor_llm.invoke(state["chunk"])
    return {"triples": triples}`
        }
      },
      {
        stepIndex: 2,
        activeNodeId: "knowledge_graph_builder",
        activeEdgeId: "gre2",
        title: "Step 3: Knowledge Graph Construction",
        action: "GRAPH_BUILDING",
        simpleDefinition: "In simple words: We connect all the triples into one giant visual web (Knowledge Graph) in Neo4j. Now every entity is connected to everything it touches!",
        description: "Constructs unified multi-relational Knowledge Graph in graph datastore.",
        state: {
          step: "3 of 8",
          graph_database: "Neo4j / NetworkX",
          nodes_count: 620,
          connections_count: 1190,
          status: "Graph network constructed!"
        },
        deepDive: {
          role: "Builds the master knowledge web.",
          why: "Allows algorithms to follow relationship paths across different documents.",
          inputs: "Triples from Step 2.",
          mechanics: "Inserts nodes and directed edges into graph database.",
          output: "Queryable knowledge graph.",
          pitfalls: "Duplicate nodes require entity deduplication.",
          langgraphCode: `# Step 3: Build Graph
G = nx.DiGraph()
for t in triples:
    G.add_edge(t.subject, t.object, relation=t.predicate)`
        }
      },
      {
        stepIndex: 3,
        activeNodeId: "leiden_clustering",
        activeEdgeId: "gre3",
        title: "Step 4: Leiden Community Detection (Grouping into Topics)",
        action: "COMMUNITY_CLUSTERING",
        simpleDefinition: "In simple words: An algorithm looks at the giant graph web and groups closely connected nodes into 'Neighborhoods' (Communities) like clustering all Kernel Safety nodes together, and all Network Protocol nodes together.",
        description: "Partitions the graph into hierarchical community clusters using modularity clustering.",
        state: {
          step: "4 of 8",
          algorithm: "Leiden Modularity Partitioning",
          communities_found: 14,
          sample_cluster: "Cluster #4: [eBPF, Verifier, Safety, Loop Termination, DAG Validation]"
        },
        deepDive: {
          role: "Discovers high-level topics automatically.",
          why: "Allows the AI to understand macro concepts across hundreds of documents.",
          inputs: "Knowledge graph.",
          mechanics: "Leiden modularity clustering partitions graph into communities.",
          output: "Community cluster mappings.",
          pitfalls: "Single isolated nodes left unclustered.",
          langgraphCode: `# Step 4: Leiden Clustering
communities = graspologic.partition.leiden(G)`
        }
      },
      {
        stepIndex: 4,
        activeNodeId: "community_summarizer",
        activeEdgeId: "gre4",
        title: "Step 5: Cluster Summaries (Precomputed Bird's-Eye View)",
        action: "SUMMARY_GENERATION",
        simpleDefinition: "In simple words: An AI writes a pre-computed 1-page executive summary for each neighborhood. When a user asks: 'What are the main themes across all documents?', the AI can answer in 1 second by reading these summaries instead of re-reading 500 documents!",
        description: "Pre-computes executive summaries for all topical graph clusters.",
        state: {
          step: "5 of 8",
          summaries_ready: 14,
          sample_summary: "Cluster #4 Summary: Covers kernel safety guarantees, static instruction analysis, and loop termination enforcement."
        },
        deepDive: {
          role: "Enables instant answers to big-picture questions.",
          why: "Vector search cannot answer 'What are the main themes?'. Community summaries solve this instantly.",
          inputs: "Community subgraphs.",
          mechanics: "Prompts LLM to summarize all triples in each cluster.",
          output: "Index of pre-computed community summaries.",
          pitfalls: "Summaries must be updated if documents change.",
          langgraphCode: `# Step 5: Summarize communities
reports = {cid: llm.invoke(f"Summarize cluster: {triples}") for cid, triples in clusters.items()}`
        }
      },
      {
        stepIndex: 5,
        activeNodeId: "query_router_search",
        activeEdgeId: "gre5",
        title: "Step 6: Global vs Local Search Routing",
        action: "SEARCH_ROUTING",
        simpleDefinition: "In simple words: The AI checks your question: Is it broad ('What are the major themes?') ➔ Uses Global Community Summaries! Is it specific ('How does eBPF stop loops?') ➔ Uses Local Subgraph Traversal!",
        description: "Routes between Global Sensemaking and Local Subgraph Traversal.",
        state: {
          step: "6 of 8",
          question: "How does the eBPF verifier interact with kernel memory safety?",
          mode_chosen: "LOCAL SUBGRAPH TRAVERSAL (Specific entity question)"
        },
        deepDive: {
          role: "Selects the best graph search strategy.",
          why: "Broad questions need community summaries; specific questions need multi-hop path traversal.",
          inputs: "User query.",
          mechanics: "Classifier determines local vs global scope.",
          output: "Routing decision.",
          pitfalls: "Misclassifying broad questions as localized.",
          langgraphCode: `# Step 6: Route local vs global
def route_graph_search(state: dict) -> str:
    return "global_search" if is_broad(state["query"]) else "local_search"`
        }
      },
      {
        stepIndex: 6,
        activeNodeId: "subgraph_traversal",
        activeEdgeId: "gre6",
        title: "Step 7: 2-Hop Subgraph Traversal (Following the Clues)",
        action: "GRAPH_HOPS",
        simpleDefinition: "In simple words: Starts at 'eBPF Verifier' and follows all connection arrows 2 hops outward: eBPF Verifier ➔ DAG Validation ➔ Kernel Memory Safety. It collects all connected facts along the path!",
        description: "Traverses relational paths outward from seed entities along directed edges.",
        state: {
          step: "7 of 8",
          starting_node: "eBPF Verifier",
          hop_1_connections: ["DAG validation", "infinite loop prevention"],
          hop_2_connections: ["Kernel memory safety", "spectre bounds checks"],
          total_facts_collected: 18
        },
        deepDive: {
          role: "Follows connections across multiple documents.",
          why: "Finds answers where Entity A is linked to Entity C only through Entity B across different files.",
          inputs: "Seed entities.",
          mechanics: "Breadth-first 2-hop search on graph.",
          output: "Neighborhood subgraph facts.",
          pitfalls: "High-degree nodes with thousands of connections need filtering.",
          langgraphCode: `# Step 7: 2-Hop Traversal
def traverse_subgraph(seed: str) -> list:
    neighbors = nx.single_source_shortest_path_length(G, seed, cutoff=2)
    return G.subgraph(neighbors.keys()).edges(data=True)`
        }
      },
      {
        stepIndex: 7,
        activeNodeId: "graph_synthesis",
        activeEdgeId: "gre8",
        title: "Step 8: Entity-Attributed Graph Synthesis",
        action: "GRAPH_ANSWER",
        simpleDefinition: "In simple words: Writes the final answer using the exact graph connections we walked along. 100% grounded in factual relationship arrows!",
        description: "Synthesizes answer grounded in structural graph paths and triples.",
        state: {
          step: "8 of 8",
          answer: "The eBPF verifier guarantees kernel memory safety through a 2-hop chain: 1) Static DAG inspection validates pointer arithmetic boundaries, and 2) Register state tracking prevents unaligned memory dereferencing.",
          grounding: "100% Grounded in Knowledge Graph Triples!"
        },
        deepDive: {
          role: "Delivers graph-verified answer.",
          why: "Eliminates hallucinations by grounding statements in explicit triples.",
          inputs: "Traversed subgraph facts.",
          mechanics: "Conditioned generation prompt.",
          output: "Final answer.",
          pitfalls: "None.",
          langgraphCode: `# Step 8: Synthesize Answer
prompt = f"Answer '{query}' using ONLY these graph triples:\n{subgraph_facts}"
return llm.invoke(prompt).content`
        }
      }
    ]
  },

  multimodal_rag: {
    id: "multimodal_rag",
    name: "Multimodal RAG (ColPali & VLM)",
    badge: "Vision-Language",
    badgeClass: "badge-medium",
    category: "Cross-Modal Vision & Document AI",
    topology: "Dual-Stream Vision & Text with Late-Interaction",
    simpleDefinition: "Multimodal RAG lets the AI 'SEE' documents like a human! Instead of using ugly OCR that scrambles tables and diagrams into gibberish, it turns pages into high-resolution images, matches your question directly to visual chart patches (ColPali), and lets Vision AI (GPT-4o) read the charts directly!",
    description: "Ingests complex PDF pages containing charts, infographics, tables, and architectural diagrams. Bypasses error-prone OCR by encoding page visual patches directly with Vision Transformers (ColPali / CLIP) and synthesizes answers using multimodal Vision-Language Models (GPT-4o / Claude 3.5 Sonnet / Gemini).",
    summaryMetrics: {
      stages: 8,
      latency: "Medium (~1100-2200ms)",
      accuracy: "Superior on Visual Documents (92-96%)",
      hallucinationRisk: "Low (<2%)",
      complexity: "Vision-Language Multi-Vector"
    },
    pros: [
      "Zero OCR errors: preserves original chart arrows, font styles, colors, and complex table layouts",
      "ColPali late-interaction connects text words directly to specific visual pixels on the page",
      "Vision AI reads complex diagrams, architecture schematics, and financial bar charts with ease",
      "Shows users the exact visual page snippet so they can see proof with their own eyes"
    ],
    cons: [
      "Image embeddings take more vector storage than pure text",
      "Vision models cost slightly more per query than text-only models"
    ],
    nodes: [
      { id: "multimodal_docs", label: "1. Visual PDFs", role: "START", icon: "file-text", x: 60, y: 180 },
      { id: "page_render_crop", label: "2. 300 DPI Renderer", role: "PROCESS", icon: "scissors", x: 190, y: 180 },
      { id: "colpali_encoder", label: "3. ColPali Vision AI", role: "VISION", icon: "cpu", x: 330, y: 180 },
      { id: "multi_vector_store", label: "4. Multi-Vector Store", role: "STORE", icon: "database", x: 470, y: 180 },
      { id: "late_interaction_retriever", label: "5. MaxSim Matcher", role: "RETRIEVE", icon: "search", x: 610, y: 180 },
      { id: "crossmodal_fusion", label: "6. Image + Prompt", role: "AUGMENT", icon: "layers", x: 740, y: 180 },
      { id: "vlm_generator", label: "7. Vision LLM (GPT-4o)", role: "GENERATE", icon: "sparkles", x: 870, y: 180 },
      { id: "grounded_response", label: "8. Visual Answer", role: "END", icon: "check-square", x: 990, y: 180 }
    ],
    edges: [
      { id: "mme1", source: "multimodal_docs", target: "page_render_crop", label: "Charts / PDFs", type: "directed" },
      { id: "mme2", source: "page_render_crop", target: "colpali_encoder", label: "High-Res Image", type: "directed" },
      { id: "mme3", source: "colpali_encoder", target: "multi_vector_store", label: "1024 Vectors/Page", type: "directed" },
      { id: "mme4", source: "multi_vector_store", target: "late_interaction_retriever", label: "Question Words", type: "directed" },
      { id: "mme5", source: "late_interaction_retriever", target: "crossmodal_fusion", label: "Winning Chart Page", type: "directed" },
      { id: "mme6", source: "crossmodal_fusion", target: "vlm_generator", label: "Image + Query", type: "directed" },
      { id: "mme7", source: "vlm_generator", target: "grounded_response", label: "Visual Proof", type: "directed" }
    ],
    steps: [
      {
        stepIndex: 0,
        activeNodeId: "multimodal_docs",
        activeEdgeId: null,
        title: "Step 1: Visual Document Ingestion",
        action: "DOC_LOADING",
        simpleDefinition: "In simple words: We load complex documents filled with bar charts, architecture diagrams, and financial tables. We do NOT use OCR text scrapers because OCR ruins tables and diagrams!",
        description: "PDF files containing charts, flowcharts, balance sheets, and schematics are ingested without stripping visual elements.",
        state: {
          step: "1 of 8",
          files: "Quarterly_Financial_Report.pdf",
          visual_content: "Bar charts on Page 4, Architecture diagram on Page 7"
        },
        deepDive: {
          role: "Preserves visual layout.",
          why: "OCR scrambles multi-column tables into nonsense. Preserving the visual image keeps facts intact.",
          inputs: "PDF files.",
          mechanics: "Loads PDF as pages.",
          output: "Raw document pages.",
          pitfalls: "None.",
          langgraphCode: `# Step 1: Load PDF pages
pages = load_pdf_pages("report.pdf")`
        }
      },
      {
        stepIndex: 1,
        activeNodeId: "page_render_crop",
        activeEdgeId: "mme1",
        title: "Step 2: High-Resolution Page Rendering & Patching",
        action: "PAGE_RENDERING",
        simpleDefinition: "In simple words: Renders each page as a crystal-clear 300 DPI image and cuts it into a grid of small visual square patches (like puzzle pieces) for the Vision Transformer.",
        description: "Renders document pages at 300 DPI and segments into vision transformer token patches.",
        state: {
          step: "2 of 8",
          resolution: "300 DPI High-Definition",
          patches_per_page: "1,024 visual patches per page"
        },
        deepDive: {
          role: "Prepares pixels for AI vision.",
          why: "Vision AI reads pictures as a grid of small patches.",
          inputs: "PDF pages.",
          mechanics: "PyMuPDF renders high-res image buffers.",
          output: "Page image tensors.",
          pitfalls: "Low resolution makes small table numbers blurry.",
          langgraphCode: `# Step 2: Render 300 DPI image
page_img = pdf_page.get_pixmap(dpi=300).tobytes()`
        }
      },
      {
        stepIndex: 2,
        activeNodeId: "colpali_encoder",
        activeEdgeId: "mme2",
        title: "Step 3: ColPali Vision Transformer Encoding",
        action: "MULTI_VECTOR_ENCODING",
        simpleDefinition: "In simple words: ColPali is a breakthrough AI model. Instead of turning the whole page into just 1 number, it gives EVERY visual patch its own vector. So the top-left chart header gets its own vector, and the bottom table gets its own vector!",
        description: "ColPali encodes visual patches into multi-vector representations (1,024 vectors per page).",
        state: {
          step: "3 of 8",
          model: "vidore/colpali-v1.2",
          vectors_stored: "1,024 multi-vectors per page representation"
        },
        deepDive: {
          role: "Captures fine visual details.",
          why: "Single vectors blur the whole page. Multi-vectors keep every diagram and table number distinct.",
          inputs: "Image patches.",
          mechanics: "PaliGemma vision encoder generates patch embeddings.",
          output: "Multi-vector representation.",
          pitfalls: "Requires GPU for fast batch indexing.",
          langgraphCode: `# Step 3: ColPali multi-vector encoding
colpali_embeddings = colpali_model.embed_images([page_img])`
        }
      },
      {
        stepIndex: 3,
        activeNodeId: "multi_vector_store",
        activeEdgeId: "mme3",
        title: "Step 4: Multi-Vector Indexing in Vector Store",
        action: "MULTI_VECTOR_STORAGE",
        simpleDefinition: "In simple words: Stores all these visual patch vectors in a database (like Qdrant) so we can search visual documents in milliseconds.",
        description: "Stores multi-vectors indexed for late-interaction MaxSim matching.",
        state: {
          step: "4 of 8",
          store: "Qdrant Multi-Vector Collection",
          total_vectors: 18432,
          status: "Visual index ready"
        },
        deepDive: {
          role: "Saves visual vectors.",
          why: "Fast search over visual documents.",
          inputs: "Multi-vectors.",
          mechanics: "Vector database indexing.",
          output: "Queryable visual index.",
          pitfalls: "Index storage is larger than text.",
          langgraphCode: `# Step 4: Save multi-vectors
qdrant.upload_collection("pages", colpali_embeddings)`
        }
      },
      {
        stepIndex: 4,
        activeNodeId: "late_interaction_retriever",
        activeEdgeId: "mme4",
        title: "Step 5: MaxSim Late-Interaction Matching (Pinpointing the Chart)",
        action: "MAXSIM_MATCHING",
        simpleDefinition: "In simple words: You ask: 'What is our Q3 operating margin in the revenue chart?'. MaxSim matches the word 'margin' directly to the exact visual pixel patch on Page 7 where the bar chart is drawn!",
        description: "Matches text query tokens directly to visual chart patches via ColBERT MaxSim operator.",
        state: {
          step: "5 of 8",
          query: "What is our Q3 operating margin in the revenue chart?",
          winning_page: "Page 7 (Financial Summary Chart)",
          match_score: "28.45 (Extremely high visual match)"
        },
        deepDive: {
          role: "Pins text questions directly to visual chart pixels.",
          why: "Finds the exact chart without needing OCR text.",
          inputs: "Text query.",
          mechanics: "ColBERT MaxSim operator computes inner products.",
          output: "Top page image.",
          pitfalls: "None.",
          langgraphCode: `# Step 5: MaxSim Matching
scores = colpali.score(query_embeddings, page_embeddings)
best_page_idx = scores.argmax()`
        }
      },
      {
        stepIndex: 5,
        activeNodeId: "crossmodal_fusion",
        activeEdgeId: "mme5",
        title: "Step 6: Visual Context Assembly (Image + Question)",
        action: "IMAGE_PROMPT_FUSION",
        simpleDefinition: "In simple words: Packages the actual high-res picture of Page 7 together with your question: 'Look at this picture of Page 7 and answer the question.'",
        description: "Packages high-resolution image with user question into multimodal message payload.",
        state: {
          step: "6 of 8",
          image_attached: "Page 7 JPEG (High Quality)",
          question: "What is our Q3 operating margin in the revenue chart?"
        },
        deepDive: {
          role: "Formats the image for Vision AI.",
          why: "Vision models need standard image base64 format.",
          inputs: "Page image + question.",
          mechanics: "Base64 encodes image into OpenAI vision message format.",
          output: "Multimodal message payload.",
          pitfalls: "Images must not exceed API size limits.",
          langgraphCode: `# Step 6: Package image for GPT-4o
payload = [
    {"type": "text", "text": query},
    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{img_b64}"}}
]`
        }
      },
      {
        stepIndex: 6,
        activeNodeId: "vlm_generator",
        activeEdgeId: "mme6",
        title: "Step 7: Vision-Language Model (VLM) Generation",
        action: "VISION_AI_READING",
        simpleDefinition: "In simple words: GPT-4o looks directly at the picture of the bar chart, reads the axis labels and numbers with its 'eyes', and writes: 'According to the green bar on Page 7, Q3 operating margin is 24.8%!'",
        description: "The Vision-Language Model directly inspects image pixels, reading chart bars and table cells without OCR errors.",
        state: {
          step: "7 of 8",
          model: "GPT-4o Vision",
          visual_observation: "Model 'sees' the green bar labeled 'Operating Margin' at height 24.8%",
          answer: "According to the Q3 Financial Summary chart on Page 7, the operating margin percentage is 24.8%."
        },
        deepDive: {
          role: "Reads pictures and writes answers.",
          why: "Only vision models can accurately interpret charts, arrows, and table borders.",
          inputs: "Image + question.",
          mechanics: "Vision-Language transformer forward pass.",
          output: "Visually grounded answer.",
          pitfalls: "Blurry low-res scans.",
          langgraphCode: `# Step 7: VLM generation
vlm = ChatOpenAI(model="gpt-4o")
response = vlm.invoke(payload)`
        }
      },
      {
        stepIndex: 7,
        activeNodeId: "grounded_response",
        activeEdgeId: "mme7",
        title: "Step 8: Visually Grounded Output Delivered",
        action: "COMPLETED",
        simpleDefinition: "In simple words: The user gets their answer along with a thumbnail of the exact chart on Page 7 so they can verify it with their own eyes!",
        description: "Delivers verified answer with visual source page thumbnail citation.",
        state: {
          step: "8 of 8",
          citation: "Page 7, Chart #2",
          status: "DELIVERED WITH VISUAL PROOF"
        },
        deepDive: {
          role: "Final output with visual proof.",
          why: "Users can see the exact picture where the fact came from.",
          inputs: "Answer + page reference.",
          mechanics: "Delivers response.",
          output: "Completed visual answer.",
          pitfalls: "None.",
          langgraphCode: `# Step 8: Done!`
        }
      }
    ]
  },

  vectorless_rag: {
    id: "vectorless_rag",
    name: "Vectorless RAG (Hierarchical Tree & AST)",
    badge: "Zero-Vector Tree",
    badgeClass: "badge-easy",
    category: "Deterministic Structural Tree & Lexical Navigation",
    topology: "Hierarchical Tree Navigation (Summary Trees & AST Scopes)",
    simpleDefinition: "Vectorless RAG completely DUMPS vector databases! No embeddings, no vector databases, no vector drift! It organizes documents like a clean Table of Contents or a folder tree. The AI navigates top-down from chapter summaries to exact paragraphs, saving 90% cost and never hallucinating fuzzy search matches.",
    description: "Eliminates dense vector databases and embedding drift entirely. Constructs Hierarchical Document Summary Trees (RAPTOR / Tree Index) and AST Code Scope Trees (Tree-sitter), using deterministic top-down branch-and-bound traversal, metadata filtering, and BM25 to locate precise factual contexts.",
    summaryMetrics: {
      stages: 8,
      latency: "Fast (~500-900ms)",
      accuracy: "High (88-94%)",
      hallucinationRisk: "Low (<2%)",
      complexity: "Hierarchical tree traversal"
    },
    pros: [
      "Zero vector embedding bills, zero expensive vector database hosting costs",
      "Immune to vector 'embedding drift' (never gets tricked by words that just sound similar)",
      "Unmatched precision for large codebases (via Tree-sitter AST scopes) and legal statutes/contracts",
      "Always navigates top-down with complete context of which chapter/module it's reading"
    ],
    cons: [
      "Requires building the summary tree once during initial ingestion",
      "Cannot do fuzzy emotional concept matching as smoothly as vector embeddings"
    ],
    nodes: [
      { id: "raw_documents", label: "1. Code / Docs", role: "START", icon: "file-text", x: 60, y: 180 },
      { id: "ast_tree_builder", label: "2. AST / Tree Builder", role: "PROCESS", icon: "scissors", x: 200, y: 180 },
      { id: "summary_hierarchies", label: "3. Summary Tree Store", role: "STORE", icon: "database", x: 350, y: 180 },
      { id: "bm25_lexical_index", label: "4A. BM25 Word Index", role: "RETRIEVE", icon: "align-left", x: 500, y: 100 },
      { id: "tree_navigator", label: "4B. Top-Down Tree Router", role: "ROUTER", icon: "git-branch", x: 500, y: 260 },
      { id: "structural_extractor", label: "5. Scope Extractor", role: "PROCESS", icon: "minimize-2", x: 660, y: 180 },
      { id: "context_assembler", label: "6. Context Assembler", role: "AUGMENT", icon: "layers", x: 820, y: 180 },
      { id: "deterministic_output", label: "7. Exact Grounded Answer", role: "END", icon: "check-square", x: 980, y: 180 }
    ],
    edges: [
      { id: "vle1", source: "raw_documents", target: "ast_tree_builder", label: "Source Code", type: "directed" },
      { id: "vle2", source: "ast_tree_builder", target: "summary_hierarchies", label: "AST Nodes", type: "directed" },
      { id: "vle3", source: "summary_hierarchies", target: "bm25_lexical_index", label: "Keywords", type: "directed" },
      { id: "vle4", source: "summary_hierarchies", target: "tree_navigator", label: "Root Summaries", type: "directed" },
      { id: "vle5", source: "bm25_lexical_index", target: "structural_extractor", label: "Exact Identifier", type: "directed" },
      { id: "vle6", source: "tree_navigator", target: "structural_extractor", label: "Target Leaf", type: "directed" },
      { id: "vle7", source: "structural_extractor", target: "context_assembler", label: "Complete Function", type: "directed" },
      { id: "vle8", source: "context_assembler", target: "deterministic_output", label: "Exact Answer", type: "directed" }
    ],
    steps: [
      {
        stepIndex: 0,
        activeNodeId: "raw_documents",
        activeEdgeId: null,
        title: "Step 1: Document & Code Ingestion (No Vectors!)",
        action: "FILE_INGESTION",
        simpleDefinition: "In simple words: We load our files (legal contracts, RFC standards, or a 50,000-line code repository). We do NOT turn them into vector numbers!",
        description: "Ingests structural documents, RFCs, and codebases without vector embeddings.",
        state: {
          step: "1 of 8",
          files: "Linux Network Subsystem (C Codebase)",
          vector_db: "NONE (Zero vector databases used!)"
        },
        deepDive: {
          role: "Loads files without embedding.",
          why: "Vector embeddings lose the structural scope and exact syntax of code and legal contracts.",
          inputs: "Source files.",
          mechanics: "Crawls directory.",
          output: "Raw source files.",
          pitfalls: "None.",
          langgraphCode: `# Step 1: Ingest without vectors
files = load_directory("./kernel_network")`
        }
      },
      {
        stepIndex: 1,
        activeNodeId: "ast_tree_builder",
        activeEdgeId: "vle1",
        title: "Step 2: Tree-Sitter AST & Table of Contents Builder",
        action: "TREE_BUILDING",
        simpleDefinition: "In simple words: Uses Tree-sitter to parse the code into an exact family tree: File ➔ Class ➔ Function. It never cuts functions in half like dumb text chunkers do!",
        description: "Parses files into Abstract Syntax Trees preserving exact functional boundaries.",
        state: {
          step: "2 of 8",
          parser: "Tree-sitter AST Parser",
          hierarchy: "dev.c ➔ napi_gro_receive() ➔ __netif_receive_skb_core()",
          status: "Exact syntax tree constructed!"
        },
        deepDive: {
          role: "Respects natural code and document boundaries.",
          why: "Random chunking splits functions in the middle. AST trees preserve complete functional logic.",
          inputs: "Source code.",
          mechanics: "Generates concrete syntax tree.",
          output: "AST tree nodes.",
          pitfalls: "Syntax errors in code.",
          langgraphCode: `# Step 2: Build AST Tree
tree = tree_sitter_parser.parse(source_code)`
        }
      },
      {
        stepIndex: 2,
        activeNodeId: "summary_hierarchies",
        activeEdgeId: "vle2",
        title: "Step 3: Hierarchical Summary Tree (RAPTOR style)",
        action: "SUMMARY_TREE",
        simpleDefinition: "In simple words: Writes summaries from the bottom up: individual functions are summarized into module summaries, and modules into chapter summaries. Now you have a clean Table of Contents tree!",
        description: "Generates recursive summaries from bottom-up leaves to subsystem roots.",
        state: {
          step: "3 of 8",
          tree_levels: "Level 0 (Leaf Functions) ➔ Level 1 (Module Summaries) ➔ Level 2 (Subsystem Roots)",
          searchable_tree: "Ready for top-down traversal"
        },
        deepDive: {
          role: "Builds a multi-level table of contents.",
          why: "Allows the AI to navigate top-down from chapter to paragraph.",
          inputs: "AST scopes.",
          mechanics: "Recursive bottom-up summarization.",
          output: "Hierarchical Summary Tree.",
          pitfalls: "Summaries must be concise.",
          langgraphCode: `# Step 3: Hierarchical Summary Tree
summary_tree = build_recursive_summary_tree(ast_nodes)`
        }
      },
      {
        stepIndex: 3,
        activeNodeId: "bm25_lexical_index",
        activeEdgeId: "vle3",
        title: "Step 4A: BM25 Lexical Index (Instant Symbol Lookup)",
        action: "KEYWORD_INDEXING",
        simpleDefinition: "In simple words: Builds an exact keyword index for all function names and variable identifiers like 'napi_gro_receive'. Finds exact function names in 1 millisecond!",
        description: "Indexes exact function identifiers and error codes for sub-millisecond lookup.",
        state: {
          step: "4 of 8",
          index: "BM25 Inverted Word Index",
          indexed_symbols: ["napi_gro_receive", "sk_buff", "NET_RX_SUCCESS"],
          speed: "1 millisecond lookup"
        },
        deepDive: {
          role: "Instant lookup for exact symbols.",
          why: "Vector search fails on exact variable names; BM25 finds them instantly.",
          inputs: "Tokens.",
          mechanics: "BM25 inverted index.",
          output: "Postings list.",
          pitfalls: "None.",
          langgraphCode: `# Step 4A: BM25 Symbol Index
bm25 = BM25Okapi(tokenized_symbols)`
        }
      },
      {
        stepIndex: 4,
        activeNodeId: "tree_navigator",
        activeEdgeId: "vle4",
        title: "Step 4B: Top-Down Tree Navigation & Pruning",
        action: "TREE_NAVIGATION",
        simpleDefinition: "In simple words: You ask: 'Where is packet GRO handled?'. The AI reads the 6 chapter titles, throws away 5 chapters, and zooms straight into Chapter 2 (Core Packet Processing) ➔ GRO Module!",
        description: "LLM navigates tree hierarchy top-down, pruning 90% of irrelevant branches.",
        state: {
          step: "5 of 8",
          query: "Where is packet GRO handled in the network stack?",
          pruned_branches: "5 out of 6 chapters discarded immediately",
          navigated_target: "Core Network ➔ dev.c ➔ napi_gro_receive()"
        },
        deepDive: {
          role: "Discards 90% of irrelevant text top-down.",
          why: "Zero vector search needed. Navigates like reading a book's table of contents.",
          inputs: "Query + chapter summaries.",
          mechanics: "Top-down branch selection.",
          output: "Target leaf pointer.",
          pitfalls: "Picking the wrong branch at the root misses the leaf.",
          langgraphCode: `# Step 4B: Top-down Tree Navigation
node = tree.root
while not node.is_leaf:
    node = select_best_child(node.children, query)`
        }
      },
      {
        stepIndex: 5,
        activeNodeId: "structural_extractor",
        activeEdgeId: "vle6",
        title: "Step 5: Exact AST Scope Extraction",
        action: "SCOPE_PULL",
        simpleDefinition: "In simple words: Grabs the ENTIRE function from line 5820 to 5845 including its arguments, struct definitions, and comments. No sentences are ever cut in half!",
        description: "Extracts complete function source scope with complete syntactic closure.",
        state: {
          step: "6 of 8",
          file: "net/core/dev.c (lines 5820-5845)",
          function: "napi_gro_receive(struct napi_struct *napi, struct sk_buff *skb)",
          closure: "100% Complete Syntactic Function Block"
        },
        deepDive: {
          role: "Pulls complete code blocks.",
          why: "Ensures the LLM sees the complete code without broken syntax.",
          inputs: "Leaf AST node pointer.",
          mechanics: "Extracts source slice based on line numbers.",
          output: "Clean function body.",
          pitfalls: "Giant 5,000-line functions.",
          langgraphCode: `# Step 5: Extract AST Scope
exact_code = extract_slice("net/core/dev.c", start=5820, end=5845)`
        }
      },
      {
        stepIndex: 6,
        activeNodeId: "context_assembler",
        activeEdgeId: "vle7",
        title: "Step 6: Context Assembly (Zero Vector Drift)",
        action: "PROMPT_PREPARATION",
        simpleDefinition: "In simple words: Packages the exact code with its file path into a prompt. Because we didn't use fuzzy vector search, there is ZERO vector drift or false semantic matching!",
        description: "Prepares prompt payload immune to embedding drift and proximity errors.",
        state: {
          step: "7 of 8",
          file_provenance: "net/core/dev.c:5820",
          vector_drift_risk: "0.0% (Zero Vector Hallucination Risk!)"
        },
        deepDive: {
          role: "Prepares verified structural prompt.",
          why: "100% deterministic code location.",
          inputs: "Extracted code block.",
          mechanics: "Prompt assembly.",
          output: "Prompt payload.",
          pitfalls: "None.",
          langgraphCode: `# Step 6: Assemble Prompt
prompt = f"Using exact code from {file}:{lines}:\n{exact_code}\n\nQuestion: {query}"`
        }
      },
      {
        stepIndex: 7,
        activeNodeId: "deterministic_output",
        activeEdgeId: "vle8",
        title: "Step 7: Deterministic Synthesized Output",
        action: "FINAL_ANSWER",
        simpleDefinition: "In simple words: The AI tells you the exact answer and points you directly to net/core/dev.c:5820 so you can open your code editor and see it immediately!",
        description: "Synthesizes exact answer citing file paths and line numbers without hallucination.",
        state: {
          step: "8 of 8",
          answer: "In the Linux network stack, Generic Receive Offload (GRO) is initiated in napi_gro_receive() inside net/core/dev.c at line 5820. It evaluates the napi->gro_hash table before passing to __netif_receive_skb_core().",
          cost_efficiency: "90% Cheaper than running Vector DB operations!"
        },
        deepDive: {
          role: "Delivers exact code location.",
          why: "Engineers want exact file names and line numbers.",
          inputs: "Assembled prompt.",
          mechanics: "LLM synthesis.",
          output: "Exact answer with file and line citations.",
          pitfalls: "None.",
          langgraphCode: `# Step 7: Done!`
        }
      }
    ]
  }
};
