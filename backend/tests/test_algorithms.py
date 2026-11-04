import unittest
from backend.engine.execution_engine import global_execution_registry

class TestAlgorithmExecutionEngines(unittest.TestCase):

    def test_bfs_execution(self):
        res = global_execution_registry.execute("bfs", {"edges": ["A-B", "A-C", "B-D"], "start_node": "A"})
        self.assertTrue(res.success)
        self.assertGreater(res.totalSteps, 0)
        self.assertEqual(res.algorithm, "bfs")
        self.assertIn("traversal", res.result)
        self.assertIn("A", res.result["traversal"])

    def test_dfs_execution(self):
        res = global_execution_registry.execute("dfs", {"edges": ["A-B", "A-C", "B-D"], "start_node": "A"})
        self.assertTrue(res.success)
        self.assertGreater(res.totalSteps, 0)
        self.assertEqual(res.algorithm, "dfs")
        self.assertIn("traversal", res.result)

    def test_bubble_sort_execution(self):
        res = global_execution_registry.execute("bubble_sort", {"array": [5, 2, 8, 1, 3]})
        self.assertTrue(res.success)
        self.assertEqual(res.result["array"], [1, 2, 3, 5, 8])

    def test_binary_search_found(self):
        res = global_execution_registry.execute("binary_search", {"array": [2, 4, 7, 10, 14, 18], "target": 14})
        self.assertTrue(res.success)
        self.assertEqual(res.result["found_index"], 4)

    def test_binary_search_not_found(self):
        res = global_execution_registry.execute("binary_search", {"array": [2, 4, 7, 10, 14, 18], "target": 99})
        self.assertTrue(res.success)
        self.assertEqual(res.result["found_index"], -1)

    def test_caesar_cipher(self):
        res = global_execution_registry.execute("caesar_cipher", {"text": "ABC", "shift": 3})
        self.assertTrue(res.success)
        self.assertEqual(res.result["ciphertext"], "DEF")

    def test_rsa_execution(self):
        res = global_execution_registry.execute("rsa", {"p": 61, "q": 53, "message": 65})
        self.assertTrue(res.success)
        self.assertIn("ciphertext", res.result)

    def test_cpu_scheduling(self):
        res = global_execution_registry.execute("cpu_scheduling", {"algorithm_type": "FCFS"})
        self.assertTrue(res.success)
        self.assertIn("gantt_chart", res.result)

    def test_page_replacement(self):
        res = global_execution_registry.execute("page_replacement", {"algorithm_type": "LRU"})
        self.assertTrue(res.success)
        self.assertIn("faults", res.result)

    def test_tcp_handshake(self):
        res = global_execution_registry.execute("tcp_handshake", {})
        self.assertTrue(res.success)
        self.assertEqual(res.result["connection"], "ESTABLISHED")

    def test_sql_engine(self):
        res = global_execution_registry.execute("sql_engine", {"query": "SELECT name, age FROM users WHERE age >= 25"})
        self.assertTrue(res.success)
        self.assertIn("result_rows", res.result)

    def test_linear_regression(self):
        res = global_execution_registry.execute("linear_regression", {"epochs": 3})
        self.assertTrue(res.success)
        self.assertIn("w", res.result)

    def test_neural_network(self):
        res = global_execution_registry.execute("neural_network", {"x1": 0.5, "x2": 0.8})
        self.assertTrue(res.success)
        self.assertIn("prediction", res.result)

    def test_rag_engines(self):
        rag_algos = [
            "simple_rag", "advanced_rag", "self_rag", "crag",
            "agentic_rag", "graph_rag", "multimodal_rag", "vectorless_rag"
        ]
        for algo in rag_algos:
            res = global_execution_registry.execute(algo, {})
            self.assertTrue(res.success, f"Failed execution for {algo}")
            self.assertGreater(len(res.steps), 0, f"No steps for {algo}")
            self.assertEqual(res.algorithm, algo)
    def test_ml_engines(self):
        ml_algos = ["kmeans", "knn", "decision_tree", "logistic_regression", "cnn_convolution", "optimizers"]
        for algo in ml_algos:
            res = global_execution_registry.execute(algo, {})
            self.assertTrue(res.success, f"Failed execution for {algo}")
            self.assertGreater(len(res.steps), 0, f"No steps for {algo}")
            self.assertEqual(res.algorithm, algo)

    def test_dsa_engines(self):
        dsa_algos = ["merge_sort", "quick_sort", "knapsack_01", "a_star", "topological_sort", "trie"]
        for algo in dsa_algos:
            res = global_execution_registry.execute(algo, {})
            self.assertTrue(res.success, f"Failed execution for {algo}")
            self.assertGreater(len(res.steps), 0, f"No steps for {algo}")
            self.assertEqual(res.algorithm, algo)

if __name__ == "__main__":
    unittest.main()


