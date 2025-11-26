from typing import List, Dict
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        # Map user_id to list of active connections (multiple tabs/devices)
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)

    def disconnect(self, websocket: WebSocket, user_id: int):
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def send_personal_message(self, message: dict, user_id: int):
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    # Handle disconnected clients that weren't properly removed
                    self.disconnect(connection, user_id)

    async def broadcast(self, message: dict):
        for user_id, user_connections in self.active_connections.items():
            for connection in user_connections:
                try:
                    await connection.send_json(message)
                except Exception:
                    self.disconnect(connection, user_id)

manager = ConnectionManager()
