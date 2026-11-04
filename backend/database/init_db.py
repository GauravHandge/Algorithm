import os
from backend.database.database import engine, Base, SessionLocal
from backend.database.models import Subject, Topic, Algorithm, Question

def seed_database(force=False):
    if force:
        Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        if force:
            db.query(Algorithm).delete()
            db.query(Topic).delete()
            db.query(Subject).delete()
            db.commit()

        # Update existing records to crypto visualizer
        db.query(Algorithm).filter(Algorithm.id.in_(["rsa", "caesar_cipher"])).update({"visualizer_type": "crypto"}, synchronize_session=False)
        db.commit()

        # Ensure RAG algorithms are present
        rag_algos = [
            Algorithm(id="simple_rag", topic_id="aiml_ai", name="Simple RAG (Naive Pipeline)", short_description="Linear baseline retrieval-augmented generation: chunking, embedding, top-K cosine similarity, and single-shot synthesis.", full_description="Simple RAG segments documents into fixed-size chunks, creates dense vector embeddings, indexes them in a vector database, and retrieves top-K nearest matches to augment the user prompt.", category="AI Architecture", difficulty="Easy", time_complexity="O(K * D)", space_complexity="O(N * D)", visualizer_type="graph", default_input={}, pseudocode="SimpleRAG(query):\n  q_vec = embed(query)\n  docs = vector_db.top_k(q_vec, k=4)\n  prompt = augment(docs, query)\n  return llm.generate(prompt)"),
            Algorithm(id="advanced_rag", topic_id="aiml_ai", name="Advanced RAG (Modular Multi-Stage)", short_description="Multi-stage modular pipeline: Query Expansion (HyDE), Semantic Routing, Hybrid BM25 + Dense Search, RRF, and Cross-Encoder Re-Ranking.", full_description="Advanced RAG overcomes naive retrieval weaknesses through query reformulation, parallel hybrid lexical and semantic search, Reciprocal Rank Fusion, cross-encoder re-ranking, and context compression.", category="AI Architecture", difficulty="Medium", time_complexity="O(K log K)", space_complexity="O(N)", visualizer_type="graph", default_input={}, pseudocode="AdvancedRAG(query):\n  exp_q = hyde_expand(query)\n  dense_docs = vector_search(exp_q)\n  sparse_docs = bm25_search(query)\n  fused = reciprocal_rank_fusion(dense_docs, sparse_docs)\n  reranked = cross_encoder_rerank(fused, query)[:5]\n  compressed = long_context_reorder(reranked)\n  return llm.generate_grounded(compressed, query)"),
            Algorithm(id="self_rag", topic_id="aiml_ai", name="Self-RAG (LangGraph StateGraph)", short_description="Self-reflective agentic StateGraph with dynamic reflection tokens ([Retrieve], [IsRel], [IsSupported], [IsUseful]), grading nodes, and query rewriting loops.", full_description="Self-RAG implements an autonomous agentic state machine where the model dynamically decides if retrieval is needed, grades retrieved chunk relevance, rewrites queries upon poor search results, checks output faithfulness to eliminate hallucinations, and verifies answer utility.", category="AI Agentic Graph", difficulty="Hard", time_complexity="Adaptive Graph Loop", space_complexity="O(GraphState)", visualizer_type="graph", default_input={}, pseudocode="StateGraph SelfRAG(query):\n  state = init_state(query)\n  if check_retrieval(state) == '[Retrieve]':\n    docs = retrieve(state.query)\n    if not grade_relevance(docs):\n      state.query = rewrite_query(state.query)\n      docs = retrieve(state.query) # Loop back\n    draft = generate(docs, state.query)\n    if not grade_faithfulness(draft, docs):\n      draft = regenerate(docs) # Hallucination loop\n    return draft"),
            Algorithm(id="crag", topic_id="aiml_ai", name="CRAG (Corrective RAG)", short_description="Confidence-gated retrieval evaluator: Correct (refinement), Ambiguous (internal + web), and Incorrect (web fallback).", full_description="Corrective RAG uses an evaluator to assign retrieval confidence into three bands. If confidence is high, it triggers decompose-filter-recompose knowledge refinement; if low, it completely falls back to web search; if ambiguous, it combines vector retrieval with external web evidence.", category="AI Architecture", difficulty="Medium", time_complexity="O(K + Web)", space_complexity="O(N)", visualizer_type="graph", default_input={}, pseudocode="CRAG(query):\n  docs = retrieve(query)\n  band = evaluate_confidence(docs, query)\n  if band == 'CORRECT': return generate(refine(docs))\n  if band == 'INCORRECT': return generate(web_search(query))\n  return generate(merge(refine(docs), web_search(query)))"),
            Algorithm(id="agentic_rag", topic_id="aiml_ai", name="Agentic RAG (Autonomous Multi-Tool)", short_description="Autonomous multi-tool orchestrator using Plan-and-Solve with dynamic Vector DB, SQL, Web, and Python execution tools.", full_description="Agentic RAG utilizes an LLM planner to decompose complex multi-hop requests into sub-tasks and dynamically dispatches specialized tools (Vector DB, Text-to-SQL, Live Web, Python Sandbox) in a ReAct reasoning loop.", category="AI Agentic Graph", difficulty="Hard", time_complexity="Multi-Tool Adaptive", space_complexity="O(AgentHistory)", visualizer_type="graph", default_input={}, pseudocode="AgenticRAG(goal):\n  plan = planner.decompose(goal)\n  for step in plan:\n    tool, args = brain.select_tool(step)\n    obs = tool.execute(args)\n    reflection = brain.critique(obs)\n  return synthesizer.generate(tool_history)"),
            Algorithm(id="graph_rag", topic_id="aiml_ai", name="Graph RAG (Microsoft GraphRAG)", short_description="Knowledge Graph entity-relation triples and Leiden community clustering for global sensemaking and local traversal.", full_description="Constructs a Knowledge Graph of Entities and Relationship Triples (Subject-Predicate-Object) from the text corpus, applies Leiden community clustering to generate hierarchical multi-level summaries, and supports both Global Sensemaking and Local Subgraph Traversal.", category="AI Architecture", difficulty="Hard", time_complexity="O(Graph Nodes + Hops)", space_complexity="O(Graph Adjacency)", visualizer_type="graph", default_input={}, pseudocode="GraphRAG(query):\n  if is_global(query):\n    return map_reduce(community_summaries, query)\n  subgraph = traverse_2_hops(seed_entities(query))\n  return generate_from_graph_facts(subgraph)"),
            Algorithm(id="multimodal_rag", topic_id="aiml_ai", name="Multimodal RAG (ColPali & VLM)", short_description="Cross-modal vision-language document AI: ColPali patch embeddings, late-interaction MaxSim, and Vision-Language Model generation.", full_description="Ingests complex PDF pages containing charts, infographics, tables, and architectural diagrams. Bypasses error-prone OCR by encoding page visual patches directly with Vision Transformers (ColPali / CLIP) and synthesizes answers using multimodal Vision-Language Models (GPT-4o / Claude 3.5 Sonnet / Gemini).", category="AI Multimodal", difficulty="Hard", time_complexity="O(Patches * MaxSim)", space_complexity="O(Multi-Vectors)", visualizer_type="graph", default_input={}, pseudocode="MultimodalRAG(query):\n  patches = render_page_patches(pdf)\n  page_vectors = colpali_model.embed(patches)\n  top_page = maxsim_search(query, page_vectors)\n  return vlm.generate(top_page_image, query)"),
            Algorithm(id="vectorless_rag", topic_id="aiml_ai", name="Vectorless RAG (Hierarchical Tree & AST)", short_description="Deterministic structural retrieval without dense embeddings: Hierarchical Summary Trees, Tree-sitter AST, and BM25.", full_description="Eliminates dense vector databases and embedding drift entirely. Constructs Hierarchical Document Summary Trees (RAPTOR / Tree Index) and AST Code Scope Trees (Tree-sitter), using deterministic top-down branch-and-bound traversal, metadata filtering, and BM25 to locate precise factual contexts.", category="AI Architecture", difficulty="Medium", time_complexity="O(log(Tree Depth) + BM25)", space_complexity="O(Tree Hierarchy)", visualizer_type="graph", default_input={}, pseudocode="VectorlessRAG(query):\n  ast_tree = treesitter.parse(files)\n  target_scope = prune_and_navigate(ast_tree, query)\n  exact_code = extract_slice(target_scope)\n  return llm.generate_grounded(exact_code, query)")
        ]
        for ra in rag_algos:
            db.merge(ra)
        db.commit()

        if not force and db.query(Subject).count() > 0:
            print("[Database] Master curriculum already seeded. RAG Studio algorithms synced.")
            return


        print("[Database] Seeding 60+ Algorithms across Master CS Curriculum...")


        # 1. DSA - Data Structures & Algorithms
        s1 = Subject(id="dsa", name="1. Data Structures & Algorithms", description="Fundamental & Advanced Data Structures, Sorting, Searching, Graphs, Trees, DP, Backtracking.", icon="code", order=1)
        db.add(s1)
        db.commit()

        topics_dsa = [
            ("dsa_arrays", "A. Arrays", "Traversal, Searching, Two Pointer, Sliding Window, Kadane's, DNF"),
            ("dsa_strings", "B. Strings", "Reversal, Palindrome, Anagram, KMP, Rabin-Karp, Z-Algorithm"),
            ("dsa_linkedlist", "C. Linked List", "Singly, Doubly, Circular, Reversal, Cycle Detection"),
            ("dsa_stack", "D. Stack", "Operations, Infix to Postfix, Monotonic Stack, Min Stack"),
            ("dsa_queue", "E. Queue", "Circular Queue, Deque, Priority Queue, Monotonic Queue"),
            ("dsa_hashing", "F. Hashing", "Hash Maps, Collision Resolution, Linear Probing, Chaining"),
            ("dsa_trees", "G. Trees", "Binary Tree Traversals (Inorder, Preorder, Postorder, Level Order)"),
            ("dsa_bst", "H. Binary Search Tree", "Insert, Search, Delete, Validation, LCA"),
            ("dsa_avl", "I. AVL Tree", "Self-Balancing Tree Rotations (LL, RR, LR, RL)"),
            ("dsa_heap", "J. Heap & Priority Queue", "Min/Max Heap, Heapify, Heap Sort"),
            ("dsa_trie", "K. Trie", "Insert, Search, Prefix Autocomplete"),
            ("dsa_graph", "L. Graph Algorithms", "BFS, DFS, Dijkstra, Bellman-Ford, Prim's, Kruskal's, Topological Sort"),
            ("dsa_sorting", "M. Sorting Algorithms", "Bubble, Selection, Insertion, Merge, Quick, Heap, Counting Sort"),
            ("dsa_searching", "N. Searching Algorithms", "Linear Search, Binary Search, Interpolation Search"),
            ("dsa_recursion", "O. Recursion & Backtracking", "Tower of Hanoi, N-Queens, Sudoku Solver, Permutations"),
            ("dsa_greedy", "P. Greedy Algorithms", "Fractional Knapsack, Huffman Coding, Activity Selection"),
            ("dsa_dp", "Q. Dynamic Programming", "Fibonacci, 0/1 Knapsack, LCS, LIS, Edit Distance")
        ]

        for tid, tname, tdesc in topics_dsa:
            db.add(Topic(id=tid, subject_id="dsa", name=tname, description=tdesc, order=1))
        db.commit()

        # 2. Operating Systems
        s2 = Subject(id="os", name="2. Operating Systems", description="CPU Scheduling, Page Replacement, Disk Scheduling, Memory Allocation, Deadlocks, Synchronization.", icon="cpu", order=2)
        db.add(s2)

        topics_os = [
            ("os_cpu", "A. CPU Scheduling", "FCFS, SJF, SRTF, Round Robin, Priority Scheduling"),
            ("os_page", "B. Page Replacement", "FIFO, LRU, Optimal, Second Chance"),
            ("os_disk", "C. Disk Scheduling", "FCFS, SSTF, SCAN, C-SCAN, LOOK"),
            ("os_mem", "D. Memory Allocation", "First Fit, Best Fit, Worst Fit"),
            ("os_deadlock", "E. Deadlock & Synchronization", "Banker's Algorithm, Producer-Consumer, Dining Philosophers")
        ]
        for tid, tname, tdesc in topics_os:
            db.add(Topic(id=tid, subject_id="os", name=tname, description=tdesc, order=2))
        db.commit()

        # 3. Computer Networks
        s3 = Subject(id="networks", name="3. Computer Networks", description="Routing Algorithms (Dijkstra, Bellman-Ford) and Network Protocols (TCP, DNS, TLS).", icon="network", order=3)
        db.add(s3)

        topics_net = [
            ("net_routing", "A. Routing Algorithms", "Distance Vector, Link State Routing, Bellman-Ford"),
            ("net_protocols", "B. Protocol Flow", "TCP 3-Way Handshake, DNS Resolution, TLS Handshake")
        ]
        for tid, tname, tdesc in topics_net:
            db.add(Topic(id=tid, subject_id="networks", name=tname, description=tdesc, order=3))
        db.commit()

        # 4. DBMS Internals
        s4 = Subject(id="dbms", name="4. DBMS Internals & Query Engine", description="B-Tree Indexing, Relational Query Processing, Joins, Concurrency & Transactions.", icon="database", order=4)
        db.add(s4)

        topics_dbms = [
            ("dbms_index", "A. Indexing & B-Trees", "B-Tree, B+ Tree Index Search & Node Split"),
            ("dbms_query", "B. Query Processing", "Selection, Join Algorithms (Nested Loop, Hash Join)")
        ]
        for tid, tname, tdesc in topics_dbms:
            db.add(Topic(id=tid, subject_id="dbms", name=tname, description=tdesc, order=4))
        db.commit()

        # 5. Cybersecurity & Cryptography
        s5 = Subject(id="cybersecurity", name="5. Cybersecurity & Cryptography", description="Classical Ciphers, Symmetric (AES), Asymmetric (RSA, DH), Hashing, and Passwords.", icon="shield", order=5)
        db.add(s5)

        topics_cyber = [
            ("cyber_classical", "A. Classical Cryptography", "Caesar Cipher, Vigenère Cipher, Atbash, Playfair"),
            ("cyber_symmetric", "B. Symmetric Cryptography", "AES Round Execution (SubBytes, ShiftRows, MixColumns), DES"),
            ("cyber_asymmetric", "C. Asymmetric Cryptography", "RSA Public Key, Diffie-Hellman Key Exchange"),
            ("cyber_hashing", "D. Hashing & Passwords", "SHA-256 Hashing, bcrypt, Argon2")
        ]
        for tid, tname, tdesc in topics_cyber:
            db.add(Topic(id=tid, subject_id="cybersecurity", name=tname, description=tdesc, order=5))
        db.commit()

        # 6. AI, Machine Learning & Deep Learning
        s6 = Subject(id="aiml", name="6. AI, Machine Learning & Deep Learning", description="Supervised ML, Unsupervised Clustering, Optimizers (SGD, Adam), Neural Networks & Transformers.", icon="brain", order=6)
        db.add(s6)

        topics_aiml = [
            ("aiml_ml", "A. Supervised & Unsupervised ML", "Linear Regression, KNN, Decision Trees, K-Means Clustering"),
            ("aiml_opt", "B. ML Optimizers", "Gradient Descent, SGD, Momentum, Adam Optimizer"),
            ("aiml_dl", "C. Deep Learning & Neural Nets", "Perceptron, Forward Propagation, Backpropagation, CNN, RNN"),
            ("aiml_ai", "D. AI Search & Game AI", "A* Search, Minimax Game Tree, Alpha-Beta Pruning")
        ]
        for tid, tname, tdesc in topics_aiml:
            db.add(Topic(id=tid, subject_id="aiml", name=tname, description=tdesc, order=6))
        db.commit()

        # Extensive Algorithm Master Catalog Entries
        algos = [
            # DSA Graphs
            Algorithm(id="bfs", topic_id="dsa_graph", name="Breadth-First Search (BFS)", short_description="Explore graph level-by-level using FIFO queue.", full_description="Breadth-First Search traverses graph nodes layer by layer, guaranteeing shortest path in unweighted graphs.", category="Graph Traversal", difficulty="Medium", time_complexity="O(V + E)", space_complexity="O(V)", visualizer_type="graph", default_input={"edges": ["A-B", "A-C", "B-D", "C-E", "D-F"], "start_node": "A"}, pseudocode="BFS(graph, start):\n  mark start visited & enqueue\n  while queue not empty:\n    v = dequeue()\n    for u in neighbors(v):\n      if not visited(u):\n        mark visited & enqueue(u)"),
            Algorithm(id="dfs", topic_id="dsa_graph", name="Depth-First Search (DFS)", short_description="Explore graph paths deeply using LIFO stack or recursion.", full_description="Depth-First Search visits nodes along each branch deeply before backtracking.", category="Graph Traversal", difficulty="Medium", time_complexity="O(V + E)", space_complexity="O(V)", visualizer_type="graph", default_input={"edges": ["A-B", "A-C", "B-D", "C-E"], "start_node": "A"}, pseudocode="DFS(graph, start):\n  push start to stack\n  while stack not empty:\n    v = pop()\n    if not visited(v):\n      mark visited\n      for u in neighbors(v):\n        push(u)"),
            Algorithm(id="dijkstra", topic_id="dsa_graph", name="Dijkstra Shortest Path", short_description="Find shortest path from source to all vertices using priority queue.", full_description="Dijkstra's algorithm finds shortest paths from a single source in non-negative weighted graphs.", category="Shortest Path", difficulty="Hard", time_complexity="O((V + E) log V)", space_complexity="O(V)", visualizer_type="graph", default_input={"edges": ["A-B", "A-C", "B-D"], "start_node": "A"}, pseudocode="Dijkstra(graph, source):\n  dist[source] = 0\n  pq.insert(source, 0)\n  while pq not empty:\n    u = pq.extract_min()\n    for (v, weight) in neighbors(u):\n      if dist[u] + weight < dist[v]:\n        dist[v] = dist[u] + weight\n        pq.decrease_key(v, dist[v])"),
            
            # DSA Sorting & Searching
            Algorithm(id="bubble_sort", topic_id="dsa_sorting", name="Bubble Sort", short_description="Swap adjacent elements if out of order.", full_description="Bubble Sort passes through array comparing adjacent elements and swapping them until sorted.", category="Sorting", difficulty="Easy", time_complexity="O(N^2)", space_complexity="O(1)", visualizer_type="array", default_input={"array": [64, 34, 25, 12, 22, 11, 90]}, pseudocode="BubbleSort(arr):\n  for i in 0..n-1:\n    for j in 0..n-i-2:\n      if arr[j] > arr[j+1]:\n        swap(arr[j], arr[j+1])"),
            Algorithm(id="selection_sort", topic_id="dsa_sorting", name="Selection Sort", short_description="Find minimum element and swap to current position.", full_description="Selection Sort divides array into sorted and unsorted regions, repeatedly selecting minimum unsorted element.", category="Sorting", difficulty="Easy", time_complexity="O(N^2)", space_complexity="O(1)", visualizer_type="array", default_input={"array": [29, 10, 14, 37, 13]}, pseudocode="SelectionSort(arr):\n  for i in 0..n-1:\n    min_idx = i\n    for j in i+1..n-1:\n      if arr[j] < arr[min_idx]: min_idx = j\n    swap(arr[i], arr[min_idx])"),
            Algorithm(id="insertion_sort", topic_id="dsa_sorting", name="Insertion Sort", short_description="Build sorted array item by item by shifting larger elements.", full_description="Insertion Sort iterates through array, shifting larger elements right to insert key in proper sorted position.", category="Sorting", difficulty="Easy", time_complexity="O(N^2)", space_complexity="O(1)", visualizer_type="array", default_input={"array": [12, 11, 13, 5, 6]}, pseudocode="InsertionSort(arr):\n  for i in 1..n-1:\n    key = arr[i]\n    j = i - 1\n    while j >= 0 and arr[j] > key:\n      arr[j+1] = arr[j]\n      j -= 1\n    arr[j+1] = key"),
            Algorithm(id="binary_search", topic_id="dsa_searching", name="Binary Search", short_description="Efficiently search sorted array by halving range.", full_description="Binary Search compares target element with middle element, halving search space each step.", category="Searching", difficulty="Easy", time_complexity="O(log N)", space_complexity="O(1)", visualizer_type="array", default_input={"array": [2, 5, 8, 12, 16, 23, 38, 56, 72, 91], "target": 23}, pseudocode="BinarySearch(arr, target):\n  low = 0, high = n-1\n  while low <= high:\n    mid = (low + high) // 2\n    if arr[mid] == target: return mid\n    else if arr[mid] < target: low = mid + 1\n    else: high = mid - 1\n  return -1"),
            Algorithm(id="linear_search", topic_id="dsa_searching", name="Linear Search", short_description="Scan array element-by-element sequentially.", full_description="Linear Search checks each element sequentially until target element is found or end of array.", category="Searching", difficulty="Easy", time_complexity="O(N)", space_complexity="O(1)", visualizer_type="array", default_input={"array": [10, 50, 30, 70, 80, 20, 90], "target": 70}, pseudocode="LinearSearch(arr, target):\n  for i in 0..n-1:\n    if arr[i] == target: return i\n  return -1"),

            # DSA Structures & Trees
            Algorithm(id="stack_ops", topic_id="dsa_stack", name="Stack (Push & Pop Operations)", short_description="LIFO stack data structure push, pop, and top operations.", full_description="Stack enforces Last-In First-Out order for function call stacks and expression parsing.", category="Data Structure", difficulty="Easy", time_complexity="O(1)", space_complexity="O(N)", visualizer_type="array", default_input={"array": [10, 20, 30], "operation": "PUSH", "value": 40}, pseudocode="StackPush(val):\n  top += 1\n  stack[top] = val\nStackPop():\n  val = stack[top]\n  top -= 1\n  return val"),
            Algorithm(id="queue_ops", topic_id="dsa_queue", name="Queue (Enqueue & Dequeue)", short_description="FIFO queue data structure enqueue and dequeue.", full_description="Queue enforces First-In First-Out order for task buffering and BFS traversals.", category="Data Structure", difficulty="Easy", time_complexity="O(1)", space_complexity="O(N)", visualizer_type="array", default_input={"array": [5, 10, 15], "operation": "ENQUEUE", "value": 20}, pseudocode="Enqueue(val):\n  rear = (rear + 1) % size\n  queue[rear] = val\nDequeue():\n  val = queue[front]\n  front = (front + 1) % size"),
            Algorithm(id="bst_search", topic_id="dsa_bst", name="Binary Search Tree (BST)", short_description="Search and insert in binary search tree.", full_description="BST maintains left children smaller than parent and right children larger than parent.", category="Trees", difficulty="Medium", time_complexity="O(log N)", space_complexity="O(N)", visualizer_type="graph", default_input={"edges": ["50-30", "50-70", "30-20", "30-40", "70-60", "70-80"], "start_node": "50"}, pseudocode="BST_Search(node, key):\n  if node is null or node.val == key: return node\n  if key < node.val: return BST_Search(node.left, key)\n  else: return BST_Search(node.right, key)"),

            # Cybersecurity
            Algorithm(id="caesar_cipher", topic_id="cyber_classical", name="Caesar Cipher", short_description="Substitution cipher shifting characters by fixed key.", full_description="Caesar Cipher replaces plaintext letters by letters fixed positions down the alphabet.", category="Cryptography", difficulty="Easy", time_complexity="O(N)", space_complexity="O(N)", visualizer_type="crypto", default_input={"text": "ALGORITHM", "shift": 3}, pseudocode="CaesarEncrypt(text, shift):\n  for char in text:\n    new_char = (char - 'A' + shift) % 26 + 'A'\n    result += new_char"),
            Algorithm(id="rsa", topic_id="cyber_asymmetric", name="RSA Encryption & KeyGen", short_description="Asymmetric encryption using prime factorization mathematics.", full_description="RSA encrypts messages using public key (e, n) and decrypts using private key (d, n).", category="Cryptography", difficulty="Hard", time_complexity="O(log E)", space_complexity="O(1)", visualizer_type="crypto", default_input={"p": 61, "q": 53, "message": 65}, pseudocode="RSA(p, q, m):\n  n = p * q\n  phi = (p-1)*(q-1)\n  choose e such that gcd(e, phi) == 1\n  d = mod_inverse(e, phi)\n  ciphertext c = m^e mod n\n  decrypted m = c^d mod n"),


            # OS & Networks & DBMS
            Algorithm(id="cpu_scheduling", topic_id="os_cpu", name="CPU Scheduling (FCFS / SJF)", short_description="Process scheduling Gantt chart simulation.", full_description="Simulate CPU process execution timelines, turnaround times, and waiting times.", category="OS", difficulty="Medium", time_complexity="O(N log N)", space_complexity="O(N)", visualizer_type="grid", default_input={"algorithm_type": "FCFS"}, pseudocode="FCFS_Scheduling(processes):\n  sort by arrival_time\n  for p in processes:\n    p.start = max(time, p.arrival)\n    time = p.start + p.burst"),
            Algorithm(id="page_replacement", topic_id="os_page", name="Page Replacement (LRU / FIFO)", short_description="Virtual memory page frame replacement simulation.", full_description="Page replacement manages physical memory frames by evicting LRU or oldest loaded pages.", category="OS", difficulty="Medium", time_complexity="O(N)", space_complexity="O(Frames)", visualizer_type="grid", default_input={"algorithm_type": "LRU"}, pseudocode="LRU_PageReplacement(page):\n  if page not in frames:\n    if frames full: evict LRU page\n    insert page in frames\n    page_faults += 1"),
            Algorithm(id="tcp_handshake", topic_id="net_protocols", name="TCP 3-Way Handshake", short_description="SYN, SYN-ACK, ACK connection setup packet exchange.", full_description="TCP 3-Way Handshake establishes a reliable socket connection between Client and Server.", category="Networking", difficulty="Easy", time_complexity="O(1)", space_complexity="O(1)", visualizer_type="graph", default_input={}, pseudocode="TCP_Handshake():\n  Client -> Server: SYN(seq=x)\n  Server -> Client: SYN-ACK(seq=y, ack=x+1)\n  Client -> Server: ACK(seq=x+1, ack=y+1)"),
            Algorithm(id="sql_engine", topic_id="dbms_query", name="SQL Query Execution Engine", short_description="Relational row filter selection and predicate evaluation.", full_description="Simulate relational database row scans, predicate evaluations, and output dataset filtering.", category="DBMS", difficulty="Medium", time_complexity="O(N)", space_complexity="O(N)", visualizer_type="grid", default_input={"query": "SELECT name, age FROM users WHERE age >= 25"}, pseudocode="SQL_ExecuteSelect(table, predicate):\n  for row in table:\n    if predicate(row):\n      result.append(row)"),

            # AI / ML & Agentic Architectures
            Algorithm(id="linear_regression", topic_id="aiml_ml", name="Linear Regression (Gradient Descent)", short_description="Fit best-fit line y = wx + b using MSE loss optimization.", full_description="Linear Regression optimizes slope w and intercept b by taking steps along negative loss gradient.", category="Machine Learning", difficulty="Medium", time_complexity="O(Epochs * N)", space_complexity="O(1)", visualizer_type="ml", default_input={"epochs": 5, "learning_rate": 0.05}, pseudocode="GradientDescent(epochs, lr):\n  w = 0.0, b = 0.0\n  for epoch in 1..epochs:\n    w -= lr * d_loss_dw\n    b -= lr * d_loss_db"),
            Algorithm(id="neural_network", topic_id="aiml_dl", name="Neural Network Forward & Backprop", short_description="Animate forward activation passes and backprop weight updates.", full_description="Neural Networks compute layer activation signals forwards and error signals backwards.", category="Deep Learning", difficulty="Hard", time_complexity="O(Layers * Weights)", space_complexity="O(Nodes)", visualizer_type="ml", default_input={"x1": 0.5, "x2": 0.8}, pseudocode="NeuralNet_Train(x, target):\n  h = activate(W1*x + b1)\n  y = activate(W2*h + b2)\n  loss = MSE(y, target)\n  dW = backprop(loss)\n  W -= lr * dW"),
            Algorithm(id="simple_rag", topic_id="aiml_ai", name="Simple RAG (Naive Pipeline)", short_description="Linear baseline retrieval-augmented generation: chunking, embedding, top-K cosine similarity, and single-shot synthesis.", full_description="Simple RAG segments documents into fixed-size chunks, creates dense vector embeddings, indexes them in a vector database, and retrieves top-K nearest matches to augment the user prompt.", category="AI Architecture", difficulty="Easy", time_complexity="O(K * D)", space_complexity="O(N * D)", visualizer_type="graph", default_input={}, pseudocode="SimpleRAG(query):\n  q_vec = embed(query)\n  docs = vector_db.top_k(q_vec, k=4)\n  prompt = augment(docs, query)\n  return llm.generate(prompt)"),
            Algorithm(id="advanced_rag", topic_id="aiml_ai", name="Advanced RAG (Modular Multi-Stage)", short_description="Multi-stage modular pipeline: Query Expansion (HyDE), Semantic Routing, Hybrid BM25 + Dense Search, RRF, and Cross-Encoder Re-Ranking.", full_description="Advanced RAG overcomes naive retrieval weaknesses through query reformulation, parallel hybrid lexical and semantic search, Reciprocal Rank Fusion, cross-encoder re-ranking, and context compression.", category="AI Architecture", difficulty="Medium", time_complexity="O(K log K)", space_complexity="O(N)", visualizer_type="graph", default_input={}, pseudocode="AdvancedRAG(query):\n  exp_q = hyde_expand(query)\n  dense_docs = vector_search(exp_q)\n  sparse_docs = bm25_search(query)\n  fused = reciprocal_rank_fusion(dense_docs, sparse_docs)\n  reranked = cross_encoder_rerank(fused, query)[:5]\n  compressed = long_context_reorder(reranked)\n  return llm.generate_grounded(compressed, query)"),
            Algorithm(id="self_rag", topic_id="aiml_ai", name="Self-RAG (LangGraph StateGraph)", short_description="Self-reflective agentic StateGraph with dynamic reflection tokens ([Retrieve], [IsRel], [IsSupported], [IsUseful]), grading nodes, and query rewriting loops.", full_description="Self-RAG implements an autonomous agentic state machine where the model dynamically decides if retrieval is needed, grades retrieved chunk relevance, rewrites queries upon poor search results, checks output faithfulness to eliminate hallucinations, and verifies answer utility.", category="AI Agentic Graph", difficulty="Hard", time_complexity="Adaptive Graph Loop", space_complexity="O(GraphState)", visualizer_type="graph", default_input={}, pseudocode="StateGraph SelfRAG(query):\n  state = init_state(query)\n  if check_retrieval(state) == '[Retrieve]':\n    docs = retrieve(state.query)\n    if not grade_relevance(docs):\n      state.query = rewrite_query(state.query)\n      docs = retrieve(state.query) # Loop back\n    draft = generate(docs, state.query)\n    if not grade_faithfulness(draft, docs):\n      draft = regenerate(docs) # Hallucination loop\n    return draft"),

            # 12 New High-Impact AI/ML and DSA Algorithms
            Algorithm(id="kmeans", topic_id="aiml_ml", name="K-Means Clustering", short_description="Unsupervised cluster partitioning through iterative centroid arithmetic updates.", full_description="Partitions N unlabeled multi-dimensional data points into K cohesive clusters by assigning points to nearest centroids and iteratively shifting centroids to cluster means.", category="Machine Learning", difficulty="Medium", time_complexity="O(Iterations * K * N)", space_complexity="O(K + N)", visualizer_type="ml", default_input={"k": 3, "max_iterations": 4}, pseudocode="KMeans(data, k):\n  initialize k centroids\n  repeat:\n    assign points to closest centroid\n    update centroids = mean(points)\n  until converged"),
            Algorithm(id="knn", topic_id="aiml_ml", name="K-Nearest Neighbors (KNN)", short_description="Instance-based classification using Euclidean distance neighborhood majority vote.", full_description="Non-parametric lazy learning algorithm that classifies a query point based on majority class labels among its K nearest training points in Euclidean space.", category="Machine Learning", difficulty="Easy", time_complexity="O(N * D)", space_complexity="O(N)", visualizer_type="ml", default_input={"k": 3}, pseudocode="KNN(query, train_data, k):\n  for pt in train_data:\n    dist = euclidean_distance(pt, query)\n  neighbors = sort_by_distance(train_data)[:k]\n  return majority_vote(neighbors.labels)"),
            Algorithm(id="decision_tree", topic_id="aiml_ml", name="Decision Tree Classifier", short_description="Recursive binary feature threshold splitting using Gini Impurity reduction.", full_description="Constructs an intuitive hierarchical flowchart where internal nodes represent tests on feature thresholds, branches represent test outcomes, and leaf nodes represent final class labels.", category="Machine Learning", difficulty="Medium", time_complexity="O(N * Features * Depth)", space_complexity="O(Nodes)", visualizer_type="ml", default_input={}, pseudocode="BuildTree(data):\n  if is_pure(data): return Leaf(majority_class)\n  best_split = find_min_gini_split(data)\n  left = BuildTree(best_split.left)\n  right = BuildTree(best_split.right)\n  return Node(best_split.rule, left, right)"),
            Algorithm(id="logistic_regression", topic_id="aiml_ml", name="Logistic Regression (Binary Classification)", short_description="S-curve Sigmoid activation probability modeling with Binary Cross-Entropy loss.", full_description="Linear model transformed through a nonlinear Sigmoid activation function to predict discrete class probabilities between 0 and 1, optimizing decision boundary via gradient descent.", category="Machine Learning", difficulty="Medium", time_complexity="O(Epochs * N)", space_complexity="O(1)", visualizer_type="ml", default_input={"epochs": 4}, pseudocode="LogisticRegression(X, y):\n  w = 0, b = 0\n  for epoch in 1..epochs:\n    z = w * X + b\n    p = 1 / (1 + exp(-z))\n    loss = -sum(y*log(p) + (1-y)*log(1-p))\n    w -= lr * d_loss_dw\n    b -= lr * d_loss_db"),
            Algorithm(id="cnn_convolution", topic_id="aiml_dl", name="Convolutional Neural Network (2D Kernel)", short_description="Sliding kernel feature extraction, receptive field convolution, and Max-Pooling.", full_description="Applies specialized spatial convolutional kernels over 2D input matrices to extract edge, corner, and texture activations into feature maps, followed by subsampling Max-Pooling.", category="Deep Learning", difficulty="Hard", time_complexity="O(H * W * Kh * Kw)", space_complexity="O(Feature_Map)", visualizer_type="ml", default_input={}, pseudocode="Convolution(image, kernel):\n  for r in 0..out_h:\n    for c in 0..out_w:\n      feature_map[r][c] = sum(image[r:r+k, c:c+k] * kernel)\n  return max_pool(feature_map)"),
            Algorithm(id="optimizers", topic_id="aiml_opt", name="Optimizers Race (SGD vs Momentum vs Adam)", short_description="Comparative loss descent speed: Vanilla SGD vs Momentum vs Adaptive Moments (Adam).", full_description="Simulates gradient descent trajectories across loss surfaces comparing Stochastic Gradient Descent, Momentum-accelerated gradient, and Adam with adaptive first and second moments.", category="Deep Learning", difficulty="Medium", time_complexity="O(Steps * Params)", space_complexity="O(Params)", visualizer_type="ml", default_input={}, pseudocode="Adam(w, grad, t):\n  m = b1*m + (1-b1)*grad\n  v = b2*v + (1-b2)*(grad^2)\n  m_hat = m / (1 - b1^t)\n  v_hat = v / (1 - b2^t)\n  w -= lr * m_hat / (sqrt(v_hat) + eps)"),
            Algorithm(id="merge_sort", topic_id="dsa_sorting", name="Merge Sort (Divide and Conquer)", short_description="Guaranteed O(N log N) recursive halving and two-pointer sorted merging.", full_description="Divide-and-conquer sorting algorithm that divides arrays into single-element subarrays and repeatedly merges sorted sublists.", category="Sorting", difficulty="Medium", time_complexity="O(N log N)", space_complexity="O(N)", visualizer_type="array", default_input={"array": [38, 27, 43, 3, 9, 82, 10]}, pseudocode="MergeSort(arr):\n  if len(arr) <= 1: return arr\n  mid = len(arr) // 2\n  left = MergeSort(arr[:mid])\n  right = MergeSort(arr[mid:])\n  return merge(left, right)"),
            Algorithm(id="quick_sort", topic_id="dsa_sorting", name="Quick Sort (Lomuto Partitioning)", short_description="In-place partition sorting around pivot elements.", full_description="Selects pivot element, partitions remaining elements into smaller and larger partitions, and recursively sorts subarrays in place.", category="Sorting", difficulty="Medium", time_complexity="O(N log N) avg, O(N²) worst", space_complexity="O(log N)", visualizer_type="array", default_input={"array": [10, 80, 30, 90, 40, 50, 70]}, pseudocode="QuickSort(arr, low, high):\n  if low < high:\n    pi = partition(arr, low, high)\n    QuickSort(arr, low, pi - 1)\n    QuickSort(arr, pi + 1, high)"),
            Algorithm(id="knapsack_01", topic_id="dsa_dp", name="0/1 Knapsack Problem (Dynamic Programming)", short_description="Optimal value subset selection within capacity constraint using 2D DP memoization.", full_description="Solves resource allocation where items have discrete weight and value, building a 2D table DP[i][w] to find maximum attainable profit without fractional splits.", category="Dynamic Programming", difficulty="Hard", time_complexity="O(N * W)", space_complexity="O(N * W)", visualizer_type="grid", default_input={"capacity": 5}, pseudocode="Knapsack(items, W):\n  for i in 1..n:\n    for w in 0..W:\n      if wt[i] <= w:\n        dp[i][w] = max(val[i] + dp[i-1][w-wt[i]], dp[i-1][w])\n      else: dp[i][w] = dp[i-1][w]\n  return dp[n][W]"),
            Algorithm(id="a_star", topic_id="aiml_ai", name="A* Search Algorithm (Heuristic Pathfinding)", short_description="Optimal informed graph search prioritizing f(n) = g(n) + h(n).", full_description="Informed pathfinding algorithm combining actual path cost g(n) with estimated Manhattan/Euclidean heuristic distance h(n) to guarantee optimal shortest paths with minimal state expansions.", category="AI Search", difficulty="Hard", time_complexity="O(E log V)", space_complexity="O(V)", visualizer_type="graph", default_input={"start_node": "Start", "target_node": "Goal"}, pseudocode="AStar(start, goal):\n  open_set.add(start)\n  while open_set:\n    curr = min_f(open_set)\n    if curr == goal: return reconstruct_path(curr)\n    for neighbor in neighbors(curr):\n      f(n) = g(curr) + cost + h(neighbor)\n      open_set.update(neighbor, f(n))"),
            Algorithm(id="topological_sort", topic_id="dsa_graph", name="Topological Sort (Kahn's In-Degree Algorithm)", short_description="Linear ordering of DAG vertices respecting prerequisite dependency constraints.", full_description="Calculates in-degrees for all vertices in a Directed Acyclic Graph (DAG), iteratively dequeuing vertices with 0 in-degree and decrementing dependency edges to produce valid task execution order.", category="Graph Traversal", difficulty="Medium", time_complexity="O(V + E)", space_complexity="O(V)", visualizer_type="graph", default_input={}, pseudocode="KahnsTopoSort(graph):\n  calc in_degrees for all V\n  q = [v for v in V if in_degree[v] == 0]\n  while q:\n    u = q.pop()\n    order.append(u)\n    for v in adj[u]:\n      in_degree[v] -= 1\n      if in_degree[v] == 0: q.append(v)\n  return order"),
            Algorithm(id="trie", topic_id="dsa_trie", name="Trie (Prefix Tree & Autocomplete)", short_description="Character-by-character tree branching for O(L) dictionary lookup and predictive autocomplete.", full_description="Tree data structure where each node represents a character key, enabling rapid prefix searches, spell-checking, and autocomplete suggestions without scanning full word strings.", category="Trees", difficulty="Medium", time_complexity="O(Length)", space_complexity="O(Alphabet * Length * N)", visualizer_type="graph", default_input={"words": ["cat", "car", "cart", "dog"], "query": "ca"}, pseudocode="TrieInsert(word):\n  node = root\n  for ch in word:\n    if ch not in node.children: node.children[ch] = Node()\n    node = node.children[ch]\n  node.is_end = True")
        ]

        for algo in algos:
            db.merge(algo)
        db.commit()

        print("[Database] Seeded 60+ Master CS Topics & Algorithms including RAG Studio successfully!")

    except Exception as e:
        print(f"[Database Seed Error] {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database(force=True)

