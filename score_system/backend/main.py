import asyncio
import websockets

# Set of connected WebSocket clients
connected_clients = set()

async def handler(websocket):
    # Register new clients
    connected_clients.add(websocket)
    try:
        async for message in websocket:
            # On receiving a message from a client, broadcast it to all clients
            await broadcast(message)
    finally:
        # Unregister client on disconnect
        connected_clients.remove(websocket)

async def broadcast(message):
    # Send a message to all connected clients
    if connected_clients:  # Check if there are any connected clients
        await asyncio.gather(*(client.send(message) for client in connected_clients))

async def main():
    async with websockets.serve(handler, "127.0.0.1", 8500):
        await asyncio.Future()  # Run forever

if __name__ == "__main__":
    asyncio.run(main())