from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from typing import List, Dict
import os

app = FastAPI()

# Serve the "../static" folder.
app.mount("/", StaticFiles(directory=".", html=True), name="static")

# Serve the "../../scroll" folder.
app.mount("/scroll", StaticFiles(directory="../scrolls/"), name="scroll")

def list_files_with_extension_in_directory(directory_path: str, extension: str) -> List[Dict]:
    print(f"Listing files with extension '{extension}' in directory '{directory_path}'")
    """
    Lists all files with a given extension within a directory and its subdirectories.
    
    :param directory_path: The path to the directory to scan.
    :param extension: The file extension to filter by.
    :return: A list of dictionaries containing folder names and their respective files with the specified extension.
    """
    result = []
    for root, dirs, files in os.walk(directory_path):
        filtered_files = [file for file in files if file.endswith(extension)]
        if filtered_files:
            # Format the root to show a relative path from the directory_path
            formatted_root = os.path.relpath(root, directory_path)
            result.append({"folder": formatted_root, "files": filtered_files})
    return result

@app.get("/list-folders/", response_model=List[Dict])
async def list_folders_with_abc_files(directory: str):
    """
    Endpoint to list folders and '.abc' files within a specified directory.
    
    :param directory: Query parameter specifying the base directory to search within.
    :return: JSON response with folders and their '.abc' files.
    """
    if not os.path.isdir(directory):
        raise HTTPException(status_code=404, detail="Directory not found")
    
    return list_files_with_extension_in_directory(directory, ".abc")


# write a function list all the folder names in the /scrolls directory
@app.get("/scroll/", response_model=List[str])
def list_folders_in_directory(directory_path: str) -> List[str]:
    print(f"Listing folders in directory '{directory_path}'")
    """
    Lists all folders within a directory.
    
    :param directory_path: The path to the directory to scan.
    :return: A list of folder names.
    """
    return [folder for folder in os.listdir(directory_path) if os.path.isdir(os.path.join(directory_path, folder))]


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
