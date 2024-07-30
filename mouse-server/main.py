import asyncio
import json
from typing import Any, Dict

import pyautogui
import websockets
from websockets.server import WebSocketServerProtocol

async def handle_connection(websocket: WebSocketServerProtocol, path: str) -> None:
    if path != "/ws":
        response: Dict[str, Any] = {'status': 'error', 'message': 'Invalid path'}
        await websocket.send(json.dumps(response))
        await websocket.close()
        return

    async for message in websocket:
        try:
            data: Dict[str, Any] = json.loads(message)
            action: str = data.get('action', '')

            if action == 'movemouse':
                x: int = data.get('x', 0)
                y: int = data.get('y', 0)
                print(x, y, '\n')
                pyautogui.moveTo(x, y, _pause=False)
                # response: Dict[str, Any] = {'status': 'success', 'action': 'movemouse', 'x': x, 'y': y}
                # await websocket.send(json.dumps(response))
            elif action == 'click':
                pyautogui.click()
                response: Dict[str, Any] = {'status': 'success', 'action': 'click'}
                await websocket.send(json.dumps(response))
            else:
                response: Dict[str, Any] = {'status': 'error', 'message': 'Unknown action'}
                await websocket.send(json.dumps(response))
        except json.JSONDecodeError:
            response: Dict[str, Any] = {'status': 'error', 'message': 'Invalid JSON'}
            await websocket.send(json.dumps(response))
        except Exception as e:
            response: Dict[str, Any] = {'status': 'error', 'message': str(e)}
            await websocket.send(json.dumps(response))

async def main() -> None:
    async with websockets.serve(handle_connection, "0.0.0.0", 8765):
        await asyncio.Future()  # Run forever

if __name__ == "__main__":
    asyncio.run(main())
