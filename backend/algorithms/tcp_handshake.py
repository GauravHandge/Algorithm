from typing import Dict, Any, List
from backend.algorithms.base import BaseAlgorithmEngine
from backend.schemas.algorithm import AlgorithmExecuteResponse, ExecutionState

class TCPHandshakeEngine(BaseAlgorithmEngine):
    def get_id(self) -> str:
        return "tcp_handshake"

    def execute(self, input_data: Dict[str, Any], params: Dict[str, Any] = None) -> AlgorithmExecuteResponse:
        client_seq = int(input_data.get("client_seq", 100))
        server_seq = int(input_data.get("server_seq", 300))

        raw_states = []

        # Step 0: Closed / Listen
        raw_states.append({
            "action": "initialize",
            "message": "TCP Handshake Initialized. Client state: CLOSED, Server state: LISTEN.",
            "variables": {"client_state": "CLOSED", "server_state": "LISTEN", "active_packet": None}
        })

        # Step 1: Client sends SYN
        raw_states.append({
            "action": "send_syn",
            "message": f"Step 1 (SYN): Client sends SYN packet to Server with Seq={client_seq}. Client state transitions to SYN_SENT.",
            "variables": {
                "client_state": "SYN_SENT",
                "server_state": "LISTEN",
                "active_packet": {"flags": ["SYN"], "seq": client_seq, "ack": 0, "from": "Client", "to": "Server"}
            }
        })

        # Step 2: Server receives SYN and responds SYN-ACK
        server_ack = client_seq + 1
        raw_states.append({
            "action": "send_syn_ack",
            "message": f"Step 2 (SYN-ACK): Server receives SYN, sends SYN-ACK packet back with Seq={server_seq}, Ack={server_ack}. Server state transitions to SYN_RCVD.",
            "variables": {
                "client_state": "SYN_SENT",
                "server_state": "SYN_RCVD",
                "active_packet": {"flags": ["SYN", "ACK"], "seq": server_seq, "ack": server_ack, "from": "Server", "to": "Client"}
            }
        })

        # Step 3: Client receives SYN-ACK and sends ACK
        client_ack = server_seq + 1
        raw_states.append({
            "action": "send_ack",
            "message": f"Step 3 (ACK): Client receives SYN-ACK, transitions to ESTABLISHED, and sends final ACK packet with Seq={server_ack}, Ack={client_ack}.",
            "variables": {
                "client_state": "ESTABLISHED",
                "server_state": "SYN_RCVD",
                "active_packet": {"flags": ["ACK"], "seq": server_ack, "ack": client_ack, "from": "Client", "to": "Server"}
            }
        })

        # Step 4: Server receives ACK -> Both ESTABLISHED
        raw_states.append({
            "action": "complete",
            "message": "Step 4 (Connection Established): Server receives final ACK and transitions to ESTABLISHED. TCP 3-Way Handshake is complete! Data transfer can begin.",
            "variables": {
                "client_state": "ESTABLISHED",
                "server_state": "ESTABLISHED",
                "active_packet": None
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
                result={"connection": "ESTABLISHED"} if idx == total else None
            ))

        return AlgorithmExecuteResponse(
            success=True,
            algorithm="tcp_handshake",
            totalSteps=total,
            steps=steps,
            result={"connection": "ESTABLISHED"},
            complexity={"time": "O(1)", "space": "O(1)"}
        )
