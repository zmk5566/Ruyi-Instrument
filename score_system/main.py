from fastapi import FastAPI, Request
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import os
import asyncio
from fastapi import WebSocket,WebSocketDisconnect
from typing import List
import json

app = FastAPI()

# Define your static directory
static_dir = "static"

# Optionally, mount the static directory at a specific path for direct access
# This line can be adjusted or removed based on your preferences
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# mount another directory for the scrolls folder, which is located in ../scrolls
app.mount("/scrolls", StaticFiles(directory="../scrolls"), name="scrolls")


@app.middleware("http")
async def serve_static_files(request: Request, call_next):
    # Construct the path to the file within the static directory
    file_path = os.path.join(static_dir, request.url.path.strip("/"))
    
    # Check if the file exists and is not a directory
    if os.path.isfile(file_path):
        return FileResponse(file_path)
    
    # If no file is matched, proceed with the next middleware or route
    response = await call_next(request)
    return response

#create a resful style api to list all the files in the ../scroll directory
@app.get("/scroll/")
async def list_scrolls():
    # List all files in the ../scroll directory
    scroll_dir = "../scrolls"
    scroll_files = os.listdir(scroll_dir)
    # filter out any non-folder files
    scroll_files = [file for file in scroll_files if os.path.isdir(os.path.join(scroll_dir, file))]
    # iterate through all the scroll files, use the list_scroll function to return the files in each folder,make a dictionary with the scroll name and the files in the folder. use the list_scroll_safe function to return the dictionary but maintain it as a json object
    scroll_files = [list_scroll_safe(scroll) for scroll in scroll_files]
    return {"scrolls": scroll_files}


# restful style enter the scroll name and return all the files with the extension .abc
@app.get("/scroll/{scroll_name}")
async def list_scroll(scroll_name: str):
    # List all files with the .abc extension in the specified scroll directory
    scroll_dir = f"../scrolls/{scroll_name}"
    scroll_files = os.listdir(scroll_dir)
    scroll_files = [file for file in scroll_files if file.endswith(".abc")]
    # reform the object so it would look like {"name": "scroll_name", "files": ["file1.abc", "file2.abc"]}
    return {"scroll": scroll_name, "parts": scroll_files}

def list_scroll_safe(scroll_name: str):
    # List all files with the .abc extension in the specified scroll directory
    scroll_dir = f"../scrolls/{scroll_name}"
    scroll_files = os.listdir(scroll_dir)
    scroll_files = [file for file in scroll_files if file.endswith(".abc")]
    # reform the object so it would look like {"name": "scroll_name", "files": ["file1.abc", "file2.abc"]}
    scroll_files = {"name": scroll_name, "parts": scroll_files}
    return scroll_files


@app.get("/current/")
async def current_directory():
    # Example API route
    return {"message": "This is the /current/ endpoint."}



class ConnectionManager:
    def __init__(self):
        self.active_connections = []
        self.user_list = []  # To maintain a list of active users based on userName and userColor
        self.last_heartbeat = {}  # Track the last heartbeat for each user
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
    
    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)
    
    def add_user(self, user_info):
        if user_info not in self.user_list:
            self.user_list.append(user_info)
            self.last_heartbeat[user_info['userName']] = asyncio.get_event_loop().time()
            
    def remove_user(self, user_info):
        if user_info in self.user_list:
            self.user_list.remove(user_info)
            del self.last_heartbeat[user_info['userName']]
            
    async def check_heartbeat(self):
        while True:
            current_time = asyncio.get_event_loop().time()
            disconnected_users = []
            for user, last_time in self.last_heartbeat.items():
                if current_time - last_time > 3:  # 6 seconds to account for possible slight delays
                    disconnected_users.append(user)
            for user in disconnected_users:
                user_info = next((u for u in self.user_list if u['userName'] == user), None)
                if user_info:
                    self.remove_user(user_info)
                    await self.broadcast(json.dumps({"type": "userList", "data": self.user_list}))
            await manager.broadcast(json.dumps({"type": "userList", "data": manager.user_list}))
            await asyncio.sleep(2)  # Check every 5 seconds

manager = ConnectionManager()

@app.on_event("startup")
async def startup_event():
    # Start the heartbeat check as soon as the app starts
    asyncio.create_task(manager.check_heartbeat())

@app.websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            json_data = json.loads(data)
            if "userName" in json_data and "userColor" in json_data:
                user_info = {"userName": json_data["userName"], "userColor": json_data["userColor"]}
                if user_info not in manager.user_list:
                    manager.add_user(user_info)
                    await manager.broadcast(json.dumps({"type": "userList", "data": manager.user_list}))
                manager.last_heartbeat[json_data["userName"]] = asyncio.get_event_loop().time()  # Update heartbeat on any message received
    except WebSocketDisconnect:
        # On disconnect, remove user info handling is already covered by the heartbeat checker
        manager.disconnect(websocket)
    except Exception as e:
        print(e)
    finally:
        manager.disconnect(websocket)


