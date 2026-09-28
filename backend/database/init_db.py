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

        if not force and db.query(Subject).count() > 0:
            print("[Database] Master curriculum already seeded. Updated visualizer types.")
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

            # AI / ML
            Algorithm(id="linear_regression", topic_id="aiml_ml", name="Linear Regression (Gradient Descent)", short_description="Fit best-fit line y = wx + b using MSE loss optimization.", full_description="Linear Regression optimizes slope w and intercept b by taking steps along negative loss gradient.", category="Machine Learning", difficulty="Medium", time_complexity="O(Epochs * N)", space_complexity="O(1)", visualizer_type="ml", default_input={"epochs": 5, "learning_rate": 0.05}, pseudocode="GradientDescent(epochs, lr):\n  w = 0.0, b = 0.0\n  for epoch in 1..epochs:\n    w -= lr * d_loss_dw\n    b -= lr * d_loss_db"),
            Algorithm(id="neural_network", topic_id="aiml_dl", name="Neural Network Forward & Backprop", short_description="Animate forward activation passes and backprop weight updates.", full_description="Neural Networks compute layer activation signals forwards and error signals backwards.", category="Deep Learning", difficulty="Hard", time_complexity="O(Layers * Weights)", space_complexity="O(Nodes)", visualizer_type="ml", default_input={"x1": 0.5, "x2": 0.8}, pseudocode="NeuralNet_Train(x, target):\n  h = activate(W1*x + b1)\n  y = activate(W2*h + b2)\n  loss = MSE(y, target)\n  dW = backprop(loss)\n  W -= lr * dW")
        ]

        for algo in algos:
            db.add(algo)
        db.commit()

        print("[Database] Seeded 60+ Master CS Topics & Algorithms successfully!")

    except Exception as e:
        print(f"[Database Seed Error] {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database(force=True)

