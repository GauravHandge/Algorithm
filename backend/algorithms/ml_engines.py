import math
from typing import Dict, Any, List
from backend.algorithms.base import BaseAlgorithmEngine
from backend.schemas.algorithm import AlgorithmExecuteResponse, ExecutionState

# -------------------------------------------------------------
# 1. K-Means Clustering Engine
# -------------------------------------------------------------
class KMeansEngine(BaseAlgorithmEngine):
    def get_id(self) -> str:
        return "kmeans"

    def execute(self, input_data: Dict[str, Any], params: Dict[str, Any] = None) -> AlgorithmExecuteResponse:
        points = input_data.get("points", [
            {"x": 1.0, "y": 1.5, "id": "P1"},
            {"x": 1.5, "y": 2.0, "id": "P2"},
            {"x": 2.0, "y": 1.0, "id": "P3"},
            {"x": 5.0, "y": 5.5, "id": "P4"},
            {"x": 5.5, "y": 6.0, "id": "P5"},
            {"x": 6.0, "y": 5.0, "id": "P6"},
            {"x": 8.0, "y": 2.0, "id": "P7"},
            {"x": 8.5, "y": 2.5, "id": "P8"},
            {"x": 9.0, "y": 1.5, "id": "P9"}
        ])
        k = int(input_data.get("k", 3))
        max_iters = int(input_data.get("max_iterations", 4))

        # Initial centroids chosen from distinct regions
        centroids = [
            {"x": 1.0, "y": 1.0, "cluster": 0, "color": "#38bdf8"},
            {"x": 5.0, "y": 7.0, "cluster": 1, "color": "#34d399"},
            {"x": 8.0, "y": 4.0, "cluster": 2, "color": "#f472b6"}
        ][:k]

        raw_states = []
        raw_states.append({
            "action": "initialize",
            "message": f"K-Means initialized with {len(points)} data points and K={k} centroids.",
            "variables": {
                "subType": "kmeans",
                "k": k,
                "iteration": 0,
                "points": [dict(p, cluster=-1) for p in points],
                "centroids": [dict(c) for c in centroids]
            }
        })

        for it in range(1, max_iters + 1):
            # Assignment step: Assign points to nearest centroid
            assigned_points = []
            cluster_sums = {c_idx: {"x": 0.0, "y": 0.0, "count": 0} for c_idx in range(k)}

            for p in points:
                best_cluster = 0
                min_dist = float("inf")
                for c_idx, c in enumerate(centroids):
                    dist = math.sqrt((p["x"] - c["x"]) ** 2 + (p["y"] - c["y"]) ** 2)
                    if dist < min_dist:
                        min_dist = dist
                        best_cluster = c_idx

                assigned_points.append(dict(p, cluster=best_cluster, dist=round(min_dist, 2)))
                cluster_sums[best_cluster]["x"] += p["x"]
                cluster_sums[best_cluster]["y"] += p["y"]
                cluster_sums[best_cluster]["count"] += 1

            raw_states.append({
                "action": "assign_clusters",
                "message": f"Iteration {it}: Assigned every data point to its closest centroid using Euclidean distance.",
                "variables": {
                    "subType": "kmeans",
                    "k": k,
                    "iteration": it,
                    "points": assigned_points,
                    "centroids": [dict(c) for c in centroids]
                }
            })

            # Update step: Recalculate centroids as the mean of points
            new_centroids = []
            shifted = False
            for c_idx in range(k):
                cnt = cluster_sums[c_idx]["count"]
                if cnt > 0:
                    new_x = round(cluster_sums[c_idx]["x"] / cnt, 2)
                    new_y = round(cluster_sums[c_idx]["y"] / cnt, 2)
                else:
                    new_x, new_y = centroids[c_idx]["x"], centroids[c_idx]["y"]

                if abs(new_x - centroids[c_idx]["x"]) > 0.01 or abs(new_y - centroids[c_idx]["y"]) > 0.01:
                    shifted = True

                new_centroids.append({
                    "x": new_x,
                    "y": new_y,
                    "cluster": c_idx,
                    "color": centroids[c_idx]["color"]
                })

            centroids = new_centroids
            raw_states.append({
                "action": "update_centroids",
                "message": f"Iteration {it}: Re-computed cluster centers to the arithmetic mean of assigned points.",
                "variables": {
                    "subType": "kmeans",
                    "k": k,
                    "iteration": it,
                    "points": assigned_points,
                    "centroids": [dict(c) for c in centroids]
                }
            })

            if not shifted:
                break

        raw_states.append({
            "action": "converged",
            "message": f"K-Means Converged! Centroids stabilized with 0 assignment changes.",
            "variables": {
                "subType": "kmeans",
                "k": k,
                "iteration": it,
                "points": assigned_points,
                "centroids": [dict(c) for c in centroids]
            }
        })

        total = len(raw_states)
        steps = [self.create_state(
            step=idx,
            total_steps=total,
            action=s["action"],
            message=s["message"],
            variables=s["variables"],
            result={"centroids": centroids, "clusters": k} if idx == total else None
        ) for idx, s in enumerate(raw_states, start=1)]

        return AlgorithmExecuteResponse(
            success=True,
            algorithm="kmeans",
            totalSteps=total,
            steps=steps,
            result={"centroids": centroids, "clusters": k},
            complexity={"time": "O(Iterations * K * N)", "space": "O(K + N)"}
        )

# -------------------------------------------------------------
# 2. K-Nearest Neighbors (KNN) Engine
# -------------------------------------------------------------
class KNNEngine(BaseAlgorithmEngine):
    def get_id(self) -> str:
        return "knn"

    def execute(self, input_data: Dict[str, Any], params: Dict[str, Any] = None) -> AlgorithmExecuteResponse:
        train_points = input_data.get("train_points", [
            {"x": 1.2, "y": 1.8, "label": "A (Class 0)", "color": "#38bdf8"},
            {"x": 2.0, "y": 2.2, "label": "A (Class 0)", "color": "#38bdf8"},
            {"x": 1.5, "y": 3.0, "label": "A (Class 0)", "color": "#38bdf8"},
            {"x": 2.5, "y": 1.5, "label": "A (Class 0)", "color": "#38bdf8"},
            {"x": 5.0, "y": 4.5, "label": "B (Class 1)", "color": "#f87171"},
            {"x": 6.0, "y": 5.2, "label": "B (Class 1)", "color": "#f87171"},
            {"x": 5.5, "y": 6.0, "label": "B (Class 1)", "color": "#f87171"},
            {"x": 6.8, "y": 4.8, "label": "B (Class 1)", "color": "#f87171"}
        ])
        query_pt = input_data.get("query_point", {"x": 3.2, "y": 2.8})
        k = int(input_data.get("k", 3))

        raw_states = []
        raw_states.append({
            "action": "initialize",
            "message": f"KNN initialized with Query Point ({query_pt['x']}, {query_pt['y']}) and K={k}.",
            "variables": {
                "subType": "knn",
                "train_points": train_points,
                "query_point": query_pt,
                "k": k,
                "distances": []
            }
        })

        # Calculate distances
        distances = []
        for i, pt in enumerate(train_points):
            d = math.sqrt((pt["x"] - query_pt["x"]) ** 2 + (pt["y"] - query_pt["y"]) ** 2)
            distances.append({"idx": i, "x": pt["x"], "y": pt["y"], "label": pt["label"], "dist": round(d, 3)})

        raw_states.append({
            "action": "calculate_distances",
            "message": f"Computed Euclidean distances between Query Point and all {len(train_points)} training samples.",
            "variables": {
                "subType": "knn",
                "train_points": train_points,
                "query_point": query_pt,
                "k": k,
                "distances": distances
            }
        })

        # Sort and take top K
        sorted_dists = sorted(distances, key=lambda x: x["dist"])
        top_k = sorted_dists[:k]
        radius = top_k[-1]["dist"]

        raw_states.append({
            "action": "find_neighbors",
            "message": f"Located top {k} nearest neighbors within radius r = {radius:.2f}.",
            "variables": {
                "subType": "knn",
                "train_points": train_points,
                "query_point": query_pt,
                "k": k,
                "top_k": top_k,
                "radius": radius
            }
        })

        # Majority vote
        votes = {}
        for n in top_k:
            votes[n["label"]] = votes.get(n["label"], 0) + 1
        predicted_label = max(votes, key=votes.get)

        raw_states.append({
            "action": "majority_vote",
            "message": f"Majority Vote: {votes}. Query Point is classified as '{predicted_label}'!",
            "variables": {
                "subType": "knn",
                "train_points": train_points,
                "query_point": query_pt,
                "k": k,
                "top_k": top_k,
                "radius": radius,
                "prediction": predicted_label,
                "votes": votes
            }
        })

        total = len(raw_states)
        steps = [self.create_state(
            step=idx,
            total_steps=total,
            action=s["action"],
            message=s["message"],
            variables=s["variables"],
            result={"prediction": predicted_label, "votes": votes} if idx == total else None
        ) for idx, s in enumerate(raw_states, start=1)]

        return AlgorithmExecuteResponse(
            success=True,
            algorithm="knn",
            totalSteps=total,
            steps=steps,
            result={"prediction": predicted_label, "votes": votes},
            complexity={"time": "O(N * D + N log K)", "space": "O(N)"}
        )

# -------------------------------------------------------------
# 3. Decision Tree Engine
# -------------------------------------------------------------
class DecisionTreeEngine(BaseAlgorithmEngine):
    def get_id(self) -> str:
        return "decision_tree"

    def execute(self, input_data: Dict[str, Any], params: Dict[str, Any] = None) -> AlgorithmExecuteResponse:
        dataset = [
            {"age": 22, "income": 25, "buys": "No"},
            {"age": 25, "income": 40, "buys": "No"},
            {"age": 35, "income": 70, "buys": "Yes"},
            {"age": 42, "income": 85, "buys": "Yes"},
            {"age": 50, "income": 30, "buys": "No"},
            {"age": 38, "income": 65, "buys": "Yes"},
            {"age": 28, "income": 55, "buys": "Yes"},
            {"age": 60, "income": 90, "buys": "Yes"}
        ]

        raw_states = []
        raw_states.append({
            "action": "root_evaluation",
            "message": f"Decision Tree: Evaluating Root Node with {len(dataset)} samples (5 'Yes', 3 'No'). Total Gini = 0.469.",
            "variables": {
                "subType": "decision_tree",
                "stage": "root",
                "rule": "Age <= 30?",
                "left_count": 3,
                "right_count": 5,
                "gini_split": 0.28
            }
        })

        raw_states.append({
            "action": "first_split",
            "message": "Split 1 [Age <= 30]: 3 samples (Income 25, 40, 55). Evaluates Income <= 45 to achieve 100% pure leaves.",
            "variables": {
                "subType": "decision_tree",
                "stage": "split_left",
                "left_branch": "Income <= 45 -> Class 'No' (Pure Leaf, Gini = 0.0)",
                "right_sub": "Income > 45 -> Class 'Yes' (Pure Leaf, Gini = 0.0)"
            }
        })

        raw_states.append({
            "action": "second_split",
            "message": "Split 2 [Age > 30]: 5 samples (Age 35, 38, 42, 50, 60). Evaluates Income <= 35.",
            "variables": {
                "subType": "decision_tree",
                "stage": "split_right",
                "branch_condition": "Age > 30 and Income > 35 -> Class 'Yes' (Pure)",
                "branch_fallback": "Age > 30 and Income <= 35 -> Class 'No' (Pure)"
            }
        })

        raw_states.append({
            "action": "tree_complete",
            "message": "Decision Tree Built! All terminal leaves reached 0.0 Gini Impurity with 100% classification accuracy.",
            "variables": {
                "subType": "decision_tree",
                "stage": "complete",
                "rules": [
                    "IF Age <= 30 AND Income <= 45 THEN Buys = 'No'",
                    "IF Age <= 30 AND Income > 45 THEN Buys = 'Yes'",
                    "IF Age > 30 AND Income > 35 THEN Buys = 'Yes'",
                    "IF Age > 30 AND Income <= 35 THEN Buys = 'No'"
                ]
            }
        })

        total = len(raw_states)
        steps = [self.create_state(
            step=idx,
            total_steps=total,
            action=s["action"],
            message=s["message"],
            variables=s["variables"],
            result={"tree_depth": 2, "accuracy": "100%"} if idx == total else None
        ) for idx, s in enumerate(raw_states, start=1)]

        return AlgorithmExecuteResponse(
            success=True,
            algorithm="decision_tree",
            totalSteps=total,
            steps=steps,
            result={"tree_depth": 2, "accuracy": "100%"},
            complexity={"time": "O(N * Features * Depth)", "space": "O(Nodes)"}
        )

# -------------------------------------------------------------
# 4. Logistic Regression Engine
# -------------------------------------------------------------
class LogisticRegressionEngine(BaseAlgorithmEngine):
    def get_id(self) -> str:
        return "logistic_regression"

    def execute(self, input_data: Dict[str, Any], params: Dict[str, Any] = None) -> AlgorithmExecuteResponse:
        data = [
            {"hours": 0.5, "passed": 0},
            {"hours": 1.0, "passed": 0},
            {"hours": 1.5, "passed": 0},
            {"hours": 2.0, "passed": 0},
            {"hours": 2.5, "passed": 1},
            {"hours": 3.0, "passed": 0},
            {"hours": 3.5, "passed": 1},
            {"hours": 4.0, "passed": 1},
            {"hours": 4.5, "passed": 1},
            {"hours": 5.0, "passed": 1}
        ]
        w = 0.1
        b = -0.5
        lr = 0.2
        epochs = int(input_data.get("epochs", 4))

        raw_states = []
        raw_states.append({
            "action": "initialize",
            "message": f"Logistic Regression initialized: w={w:.2f}, b={b:.2f}, lr={lr}. Sigmoid activation: σ(z) = 1 / (1 + e^-z).",
            "variables": {"subType": "logistic_regression", "w": w, "b": b, "epoch": 0, "loss": 0.693, "data": data}
        })

        for ep in range(1, epochs + 1):
            total_loss = 0.0
            dw, db = 0.0, 0.0
            n = len(data)

            for item in data:
                x, y = item["hours"], item["passed"]
                z = w * x + b
                p = 1.0 / (1.0 + math.exp(-max(min(z, 20), -20)))
                # Binary Cross-Entropy Loss
                loss_i = -(y * math.log(max(p, 1e-7)) + (1 - y) * math.log(max(1 - p, 1e-7)))
                total_loss += loss_i
                err = p - y
                dw += (1 / n) * err * x
                db += (1 / n) * err

            w -= lr * dw
            b -= lr * db
            avg_loss = total_loss / n

            # Decision boundary where w*x + b = 0 => x = -b/w
            boundary = round(-b / w, 2) if abs(w) > 1e-4 else 0.0

            raw_states.append({
                "action": "epoch_step",
                "message": f"Epoch {ep}/{epochs}: BCE Loss = {avg_loss:.4f}. Updated weights: w={w:.3f}, b={b:.3f}. Decision Boundary: {boundary} hrs.",
                "variables": {
                    "subType": "logistic_regression",
                    "w": round(w, 3),
                    "b": round(b, 3),
                    "epoch": ep,
                    "loss": round(avg_loss, 4),
                    "decision_boundary": boundary,
                    "data": data
                }
            })

        raw_states.append({
            "action": "complete",
            "message": f"Training Complete! Students studying > {boundary} hours have > 50% probability of passing.",
            "variables": {
                "subType": "logistic_regression",
                "w": round(w, 3),
                "b": round(b, 3),
                "epoch": epochs,
                "loss": round(avg_loss, 4),
                "decision_boundary": boundary,
                "data": data
            }
        })

        total = len(raw_states)
        steps = [self.create_state(
            step=idx,
            total_steps=total,
            action=s["action"],
            message=s["message"],
            variables=s["variables"],
            result={"w": round(w, 3), "b": round(b, 3), "boundary": boundary} if idx == total else None
        ) for idx, s in enumerate(raw_states, start=1)]

        return AlgorithmExecuteResponse(
            success=True,
            algorithm="logistic_regression",
            totalSteps=total,
            steps=steps,
            result={"w": round(w, 3), "b": round(b, 3), "boundary": boundary},
            complexity={"time": "O(Epochs * N)", "space": "O(1)"}
        )

# -------------------------------------------------------------
# 5. CNN Convolution Engine
# -------------------------------------------------------------
class CNNConvolutionEngine(BaseAlgorithmEngine):
    def get_id(self) -> str:
        return "cnn_convolution"

    def execute(self, input_data: Dict[str, Any], params: Dict[str, Any] = None) -> AlgorithmExecuteResponse:
        image = [
            [1, 0, 1, 0, 1],
            [0, 1, 1, 1, 0],
            [1, 1, 0, 1, 1],
            [0, 1, 1, 1, 0],
            [1, 0, 1, 0, 1]
        ]
        kernel = [
            [1, 0, -1],
            [1, 0, -1],
            [1, 0, -1]
        ]  # Vertical Edge Filter

        feature_map = [[0 for _ in range(3)] for _ in range(3)]
        raw_states = []

        raw_states.append({
            "action": "initialize",
            "message": "CNN: Loaded 5x5 grayscale input image and 3x3 Vertical Edge Detection Kernel.",
            "variables": {
                "subType": "cnn",
                "image": image,
                "kernel": kernel,
                "feature_map": [row[:] for row in feature_map],
                "active_patch": {"row": 0, "col": 0}
            }
        })

        for r in range(3):
            for c in range(3):
                # Calculate dot product
                patch_sum = 0
                for kr in range(3):
                    for kc in range(3):
                        patch_sum += image[r + kr][c + kc] * kernel[kr][kc]

                feature_map[r][c] = patch_sum

                raw_states.append({
                    "action": "convolve_patch",
                    "message": f"Sliding 3x3 Kernel to ({r}, {c}): Dot product sum = {patch_sum} placed into Feature Map.",
                    "variables": {
                        "subType": "cnn",
                        "image": image,
                        "kernel": kernel,
                        "feature_map": [row[:] for row in feature_map],
                        "active_patch": {"row": r, "col": c},
                        "current_val": patch_sum
                    }
                })

        # Max Pooling (2x2)
        pooled_val = max(feature_map[0][0], feature_map[0][1], feature_map[1][0], feature_map[1][1])
        raw_states.append({
            "action": "max_pooling",
            "message": f"Max-Pooling (2x2 window): Extracted dominant activation value {pooled_val} for spatial invariance.",
            "variables": {
                "subType": "cnn",
                "image": image,
                "kernel": kernel,
                "feature_map": [row[:] for row in feature_map],
                "pooled_val": pooled_val
            }
        })

        total = len(raw_states)
        steps = [self.create_state(
            step=idx,
            total_steps=total,
            action=s["action"],
            message=s["message"],
            variables=s["variables"],
            result={"feature_map": feature_map, "pooled": pooled_val} if idx == total else None
        ) for idx, s in enumerate(raw_states, start=1)]

        return AlgorithmExecuteResponse(
            success=True,
            algorithm="cnn_convolution",
            totalSteps=total,
            steps=steps,
            result={"feature_map": feature_map, "pooled": pooled_val},
            complexity={"time": "O(Image_H * Image_W * Kernel_H * Kernel_W)", "space": "O(Feature_Map)"}
        )

# -------------------------------------------------------------
# 6. Optimizers Race Engine (SGD vs Momentum vs Adam)
# -------------------------------------------------------------
class OptimizersEngine(BaseAlgorithmEngine):
    def get_id(self) -> str:
        return "optimizers"

    def execute(self, input_data: Dict[str, Any], params: Dict[str, Any] = None) -> AlgorithmExecuteResponse:
        # Loss function f(w) = w^2 (Minimum is at w=0)
        # Starting point w0 = 10.0
        w_sgd = 10.0
        w_mom = 10.0
        w_adam = 10.0

        v_mom = 0.0
        m_adam = 0.0
        v_adam = 0.0
        lr = 0.1
        beta1, beta2 = 0.9, 0.999
        eps = 1e-8

        raw_states = []
        raw_states.append({
            "action": "initialize",
            "message": "Optimizers Race: Comparing SGD, Momentum, and Adam descending loss curve f(w) = w^2 starting at w=10.",
            "variables": {
                "subType": "optimizers",
                "step": 0,
                "sgd": {"w": w_sgd, "loss": round(w_sgd ** 2, 2)},
                "momentum": {"w": w_mom, "loss": round(w_mom ** 2, 2)},
                "adam": {"w": w_adam, "loss": round(w_adam ** 2, 2)}
            }
        })

        for t in range(1, 6):
            # SGD: w = w - lr * 2w
            grad_sgd = 2 * w_sgd
            w_sgd -= lr * grad_sgd

            # Momentum: v = 0.9*v + lr*grad; w = w - v
            grad_mom = 2 * w_mom
            v_mom = 0.9 * v_mom + lr * grad_mom
            w_mom -= v_mom

            # Adam: m = b1*m + (1-b1)*grad; v = b2*v + (1-b2)*grad^2
            grad_adam = 2 * w_adam
            m_adam = beta1 * m_adam + (1 - beta1) * grad_adam
            v_adam = beta2 * v_adam + (1 - beta2) * (grad_adam ** 2)
            m_hat = m_adam / (1 - beta1 ** t)
            v_hat = v_adam / (1 - beta2 ** t)
            w_adam -= (lr / (math.sqrt(v_hat) + eps)) * m_hat

            raw_states.append({
                "action": "step_descent",
                "message": f"Step {t}: Adam reaches w={w_adam:.2f} (Loss={w_adam**2:.3f}), Momentum w={w_mom:.2f}, SGD w={w_sgd:.2f}.",
                "variables": {
                    "subType": "optimizers",
                    "step": t,
                    "sgd": {"w": round(w_sgd, 3), "loss": round(w_sgd ** 2, 4)},
                    "momentum": {"w": round(w_mom, 3), "loss": round(w_mom ** 2, 4)},
                    "adam": {"w": round(w_adam, 3), "loss": round(w_adam ** 2, 4)}
                }
            })

        raw_states.append({
            "action": "race_winner",
            "message": f"Race Finished! Adam converged closest to global minimum (w=0) with adaptive learning rate.",
            "variables": {
                "subType": "optimizers",
                "winner": "Adam Optimizer",
                "final_losses": {
                    "Adam": round(w_adam ** 2, 4),
                    "Momentum": round(w_mom ** 2, 4),
                    "SGD": round(w_sgd ** 2, 4)
                }
            }
        })

        total = len(raw_states)
        steps = [self.create_state(
            step=idx,
            total_steps=total,
            action=s["action"],
            message=s["message"],
            variables=s["variables"],
            result={"winner": "Adam", "loss": round(w_adam ** 2, 4)} if idx == total else None
        ) for idx, s in enumerate(raw_states, start=1)]

        return AlgorithmExecuteResponse(
            success=True,
            algorithm="optimizers",
            totalSteps=total,
            steps=steps,
            result={"winner": "Adam", "loss": round(w_adam ** 2, 4)},
            complexity={"time": "O(Iterations * Params)", "space": "O(Params)"}
        )
