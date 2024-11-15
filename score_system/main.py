from fastapi import FastAPI, Request
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import os
import aiofiles.os

app = FastAPI()

# Define your static directory
static_dir = "static"

# Optionally, mount the static directory at a specific path for direct access
# This line can be adjusted or removed based on your preferences
app.mount("/static", StaticFiles(directory=static_dir), name="static")


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
    # iterate through all the scroll files, use the list_scroll function to return the files in each folder,make a dictionary with the scroll name and the files in the folder
    scroll_files = {scroll: list_scroll_safe(scroll) for scroll in scroll_files}
    return {"scrolls": scroll_files}


# restful style enter the scroll name and return all the files with the extension .abc
@app.get("/scroll/{scroll_name}")
async def list_scroll(scroll_name: str):
    # List all files with the .abc extension in the specified scroll directory
    scroll_dir = f"../scrolls/{scroll_name}"
    scroll_files = os.listdir(scroll_dir)
    scroll_files = [file for file in scroll_files if file.endswith(".abc")]
    return {"scroll": scroll_name, "files": scroll_files}

def list_scroll_safe(scroll_name: str):
    # List all files with the .abc extension in the specified scroll directory
    scroll_dir = f"../scrolls/{scroll_name}"
    scroll_files = os.listdir(scroll_dir)
    scroll_files = [file for file in scroll_files if file.endswith(".abc")]
    return scroll_files


@app.get("/current/")
async def current_directory():
    # Example API route
    return {"message": "This is the /current/ endpoint."}