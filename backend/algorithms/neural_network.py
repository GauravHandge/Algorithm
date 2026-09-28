import math
from typing import Dict, Any, List
from backend.algorithms.base import BaseAlgorithmEngine
from backend.schemas.algorithm import AlgorithmExecuteResponse, ExecutionState

def sigmoid(z: float) -> float:
    return 1.0 / (1.0 + math.exp(-max(-50, min(50, z))))

def sigmoid_derivative(a: float) -> float:
    return a * (1.0 - a)

class NeuralNetworkEngine(BaseAlgorithmEngine):
    def get_id(self) -> str:
        return "neural_network"

    def execute(self, input_data: Dict[str, Any], params: Dict[str, Any] = None) -> AlgorithmExecuteResponse:
        # Architecture: 2 inputs (x1, x2), 2 hidden neurons (h1, h2), 1 output neuron (o1)
        x1 = float(input_data.get("x1", 0.5))
        x2 = float(input_data.get("x2", 0.8))
        target_y = float(input_data.get("target", 1.0))
        lr = float(input_data.get("learning_rate", 0.5))

        # Initial weights & biases
        w_h = [[0.15, 0.20], [0.25, 0.30]] # [[w11, w12], [w21, w22]]
        b_h = [0.35, 0.35]
        w_o = [0.40, 0.45]
        b_o = 0.60

        raw_states = []

        # Step 0: Initial Network State
        raw_states.append({
            "action": "initialize",
            "message": f"2-Layer Neural Network Initialized. Inputs: x1={x1}, x2={x2}, Target Y={target_y}, Learning Rate={lr}.",
            "variables": {
                "inputs": [x1, x2],
                "w_hidden": w_h,
                "b_hidden": b_h,
                "w_output": w_o,
                "b_output": b_o,
                "target": target_y
            }
        })

        # Step 1: Hidden Layer Forward Pass
        z_h1 = x1 * w_h[0][0] + x2 * w_h[1][0] + b_h[0]
        a_h1 = sigmoid(z_h1)
        z_h2 = x1 * w_h[0][1] + x2 * w_h[1][1] + b_h[1]
        a_h2 = sigmoid(z_h2)

        raw_states.append({
            "action": "forward_hidden",
            "message": f"Forward Pass (Hidden Layer): Neurons computed activations -> a_h1 = σ({z_h1:.3f}) = {a_h1:.4f}, a_h2 = σ({z_h2:.3f}) = {a_h2:.4f}.",
            "variables": {
                "inputs": [x1, x2],
                "hidden_activations": [round(a_h1, 4), round(a_h2, 4)],
                "z_hidden": [round(z_h1, 4), round(z_h2, 4)]
            }
        })

        # Step 2: Output Layer Forward Pass
        z_o1 = a_h1 * w_o[0] + a_h2 * w_o[1] + b_o
        a_o1 = sigmoid(z_o1)
        loss = 0.5 * ((target_y - a_o1) ** 2)

        raw_states.append({
            "action": "forward_output",
            "message": f"Forward Pass (Output Layer): Output neuron activation y_hat = σ({z_o1:.3f}) = {a_o1:.4f}. Total Loss E = 1/2*(y - y_hat)² = {loss:.6f}.",
            "variables": {
                "prediction": round(a_o1, 4),
                "target": target_y,
                "loss": round(loss, 6)
            }
        })

        # Step 3: Backpropagation Output Layer Gradients
        # dE/da_o1 = -(target - a_o1)
        # da_o1/dz_o1 = a_o1 * (1 - a_o1)
        delta_o1 = -(target_y - a_o1) * sigmoid_derivative(a_o1)
        dE_dw_o0 = delta_o1 * a_h1
        dE_dw_o1 = delta_o1 * a_h2

        raw_states.append({
            "action": "backprop_output",
            "message": f"Backpropagation (Output Weights): Calculated Output Gradient δ_o = {delta_o1:.5f}. Output weight gradients: ∂E/∂w_o1 = {dE_dw_o0:.5f}, ∂E/∂w_o2 = {dE_dw_o1:.5f}.",
            "variables": {
                "delta_output": round(delta_o1, 5),
                "grad_w_output": [round(dE_dw_o0, 5), round(dE_dw_o1, 5)]
            }
        })

        # Step 4: Backpropagation Hidden Layer Gradients
        delta_h1 = delta_o1 * w_o[0] * sigmoid_derivative(a_h1)
        delta_h2 = delta_o1 * w_o[1] * sigmoid_derivative(a_h2)

        raw_states.append({
            "action": "backprop_hidden",
            "message": f"Backpropagation (Hidden Weights): Propagated error to hidden layer. δ_h1 = {delta_h1:.5f}, δ_h2 = {delta_h2:.5f}.",
            "variables": {
                "delta_hidden": [round(delta_h1, 5), round(delta_h2, 5)]
            }
        })

        # Step 5: Update Weights
        w_o_new = [w_o[0] - lr * dE_dw_o0, w_o[1] - lr * dE_dw_o1]
        w_h_new = [
            [w_h[0][0] - lr * (delta_h1 * x1), w_h[0][1] - lr * (delta_h2 * x1)],
            [w_h[1][0] - lr * (delta_h1 * x2), w_h[1][1] - lr * (delta_h2 * x2)]
        ]

        raw_states.append({
            "action": "complete",
            "message": f"Weight Update Complete! Output weights updated to [{w_o_new[0]:.4f}, {w_o_new[1]:.4f}]. Loss decreased from {loss:.6f}.",
            "variables": {
                "prediction": round(a_o1, 4),
                "loss": round(loss, 6),
                "updated_w_output": [round(w_o_new[0], 4), round(w_o_new[1], 4)],
                "updated_w_hidden": w_h_new
            }
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
                result={"prediction": a_o1, "loss": loss, "updated_weights": w_o_new} if idx == total else None
            ))

        return AlgorithmExecuteResponse(
            success=True,
            algorithm="neural_network",
            totalSteps=total,
            steps=steps,
            result={"prediction": a_o1, "loss": loss, "updated_weights": w_o_new},
            complexity={"time": "O(layers * neurons)", "space": "O(neurons)"}
        )
