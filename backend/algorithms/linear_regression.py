from typing import Dict, Any, List
from backend.algorithms.base import BaseAlgorithmEngine
from backend.schemas.algorithm import AlgorithmExecuteResponse, ExecutionState

class LinearRegressionEngine(BaseAlgorithmEngine):
    def get_id(self) -> str:
        return "linear_regression"

    def execute(self, input_data: Dict[str, Any], params: Dict[str, Any] = None) -> AlgorithmExecuteResponse:
        # Sample points (x, y)
        points = input_data.get("points", [
            {"x": 1.0, "y": 2.0},
            {"x": 2.0, "y": 3.5},
            {"x": 3.0, "y": 4.5},
            {"x": 4.0, "y": 6.0},
            {"x": 5.0, "y": 7.2}
        ])
        lr = float(input_data.get("learning_rate", 0.05))
        epochs = int(input_data.get("epochs", 5))

        w = 0.0
        b = 0.0
        n = len(points)
        raw_states = []

        raw_states.append({
            "action": "initialize",
            "message": f"Linear Regression Gradient Descent initialized with {n} points, lr = {lr}. Initial weights: w = {w:.2f}, b = {b:.2f}.",
            "variables": {"w": w, "b": b, "loss": 0.0, "epoch": 0, "points": points}
        })

        for epoch in range(1, epochs + 1):
            dw = 0.0
            db = 0.0
            total_loss = 0.0

            for pt in points:
                x, y = pt["x"], pt["y"]
                pred = w * x + b
                err = pred - y
                total_loss += err ** 2
                dw += (2 / n) * err * x
                db += (2 / n) * err

            mse_loss = total_loss / n

            # Update weights
            w -= lr * dw
            b -= lr * db

            raw_states.append({
                "action": "update_weights",
                "message": f"Epoch {epoch}/{epochs}: MSE Loss = {mse_loss:.4f}. Updated weights: w = {w:.4f}, b = {b:.4f} (∂L/∂w = {dw:.3f}, ∂L/∂b = {db:.3f}).",
                "variables": {"w": round(w, 4), "b": round(b, 4), "loss": round(mse_loss, 4), "epoch": epoch, "points": points}
            })

        raw_states.append({
            "action": "complete",
            "message": f"Gradient Descent Training Complete! Final line equation: y = {w:.4f}x + {b:.4f}.",
            "variables": {"w": round(w, 4), "b": round(b, 4), "loss": round(mse_loss, 4), "epoch": epochs, "points": points}
        })

        total = len(raw_states)
        steps = []
        for idx, s in enumerate(raw_states, start=1):
            steps.append(self.create_state(
                step=idx,
                total_steps=total,
                action=s["action"],
                message=s["message"],
                variables=s["variables"],
                result={"w": w, "b": b, "final_loss": mse_loss} if idx == total else None
            ))

        return AlgorithmExecuteResponse(
            success=True,
            algorithm="linear_regression",
            totalSteps=total,
            steps=steps,
            result={"w": w, "b": b, "final_loss": mse_loss},
            complexity={"time": "O(epochs * N)", "space": "O(1)"}
        )
