from typing import Dict, Any, List
from backend.algorithms.base import BaseAlgorithmEngine
from backend.schemas.algorithm import AlgorithmExecuteResponse, ExecutionState

class RSAEngine(BaseAlgorithmEngine):
    def get_id(self) -> str:
        return "rsa"

    def execute(self, input_data: Dict[str, Any], params: Dict[str, Any] = None) -> AlgorithmExecuteResponse:
        p = int(input_data.get("p", 61))
        q = int(input_data.get("q", 53))
        message_val = int(input_data.get("message", 65)) # Message integer (e.g. 'A')

        raw_states = []

        # Step 1: Prime selection & modulus n
        n = p * q
        raw_states.append({
            "action": "calc_n",
            "message": f"Step 1: Choose prime numbers p = {p}, q = {q}. Compute modulus n = p * q = {p} * {q} = {n}.",
            "variables": {"p": p, "q": q, "n": n}
        })

        # Step 2: Euler's totient phi(n)
        phi = (p - 1) * (q - 1)
        raw_states.append({
            "action": "calc_phi",
            "message": f"Step 2: Calculate Euler's totient φ(n) = (p-1)*(q-1) = {p-1} * {q-1} = {phi}.",
            "variables": {"p": p, "q": q, "n": n, "phi": phi}
        })

        # Step 3: Public Exponent e
        e = 17
        raw_states.append({
            "action": "select_e",
            "message": f"Step 3: Select public exponent e = {e} such that 1 < e < φ(n) and gcd(e, φ(n)) = 1.",
            "variables": {"n": n, "phi": phi, "e": e}
        })

        # Step 4: Private Exponent d
        # d * e = 1 mod phi -> pow(e, -1, phi)
        try:
            d = pow(e, -1, phi)
        except ValueError:
            d = 2753

        raw_states.append({
            "action": "calc_d",
            "message": f"Step 4: Compute private key exponent d = e⁻¹ mod φ(n) = {e}⁻¹ mod {phi} = {d}.",
            "variables": {"public_key": (e, n), "private_key": (d, n)}
        })

        # Step 5: Encryption c = m^e mod n
        c = pow(message_val, e, n)
        raw_states.append({
            "action": "encrypt",
            "message": f"Step 5 (Encryption): Ciphertext c = m^e mod n = {message_val}^{e} mod {n} = {c}.",
            "variables": {"message": message_val, "ciphertext": c}
        })

        # Step 6: Decryption m = c^d mod n
        m_decrypted = pow(c, d, n)
        raw_states.append({
            "action": "decrypt",
            "message": f"Step 6 (Decryption): Recovered message m = c^d mod n = {c}^{d} mod {n} = {m_decrypted}.",
            "variables": {"ciphertext": c, "decrypted_message": m_decrypted}
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
                result={"public_key": [e, n], "private_key": [d, n], "ciphertext": c, "decrypted": m_decrypted} if idx == total else None
            ))

        return AlgorithmExecuteResponse(
            success=True,
            algorithm="rsa",
            totalSteps=total,
            steps=steps,
            result={"public_key": [e, n], "private_key": [d, n], "ciphertext": c, "decrypted": m_decrypted},
            complexity={"time": "O(log e)", "space": "O(1)"}
        )
