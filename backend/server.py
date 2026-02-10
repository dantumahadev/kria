from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import subprocess
import time
import time
import os
from pydantic import BaseModel

class GeneralActionRequest(BaseModel):
    command: str
    parameters: dict = {}

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def run_adb_command(command):
    """Run an ADB command and return output."""
    print(f"[ADB] Executing: {command}")
    try:
        # Check if we need to target specific device
        # For now, we trust ADB's default behavior unless we want to force -s <IP>
        # but adding -d or -e might help if mixed.
        # Let's just run it as is but Log it.
        
        if isinstance(command, str):
            cmd_list = ["adb", "-s", "100.108.90.174:5555"] + command.split()
        else:
            cmd_list = ["adb", "-s", "100.108.90.174:5555"] + command
            
        result = subprocess.run(
            cmd_list,
            capture_output=True,
            text=True,
            check=False, # Don't raise on error
            encoding='utf-8',
            errors='ignore'
        )
        if result.returncode != 0:
            print(f"[ADB] Failed: {result.stderr}")
        return result.stdout.strip()
    except Exception as e:
        print(f"ADB Error: {e}")
        return None

@app.get("/")
def read_root():
    return {"status": "KriaOS Backend Online"}

# --- JARVIS KNOWLEDGE BASE ---
APPS_MAP = {
    "whatsapp": "com.whatsapp",
    "youtube": "com.google.android.youtube",
    "spotify": "com.spotify.music",
    "instagram": "com.instagram.android",
    "chrome": "com.android.chrome",
    "maps": "com.google.android.apps.maps",
    "gmail": "com.google.android.gm",
    "settings": "com.android.settings",
    "camera": "com.android.camera", # Generic, might vary
    "uber": "com.ubercab",
    "ola": "com.olacabs.customer",
    "rapido": "com.rapido.passenger",
    "zomato": "com.application.zomato",
    "swiggy": "in.swiggy.android",
    "phone": "com.google.android.dialer",
    "play store": "com.android.vending"
}

@app.post("/action/general")
def general_action(request: GeneralActionRequest):
    """
    The Brain of Jarvis. Routes generic commands to specific ADB actions.
    Supported Intents: 'open', 'scroll', 'click', 'type', 'system'
    """
    command = request.command
    parameters = request.parameters
    intent = command.lower()
    
    # --- 1. APP LAUNCHING ---
    if intent == "open_app":
        app_name = parameters.get("app_name", "").lower().strip()
        pkg = APPS_MAP.get(app_name)
        
        # Fuzzy / Direct match fallback
        if not pkg:
            # Try to find a package that simply contains the name
            # simple helper: just assume they might mean a package containing the string
            # This is risky but "Jarvis" tries its best.
            pass

        if pkg:
            run_adb_command(f"shell monkey -p {pkg} -c android.intent.category.LAUNCHER 1")
            return {"status": "success", "message": f"Opening {app_name}"}
        else:
            # Fallback: Search in Play Store if we don't know it
            run_adb_command(f"shell am start -a android.intent.action.VIEW -d market://search?q={app_name}")
            return {"status": "search", "message": f"Searching Play Store for {app_name}"}

    # --- 2. SYSTEM CONTROLS ---
    if intent == "system":
        action = parameters.get("action", "")
        if action == "home":
            run_adb_command("shell input keyevent 3")
        elif action == "back":
            run_adb_command("shell input keyevent 4")
        elif action == "recent":
            run_adb_command("shell input keyevent 187")
        elif action == "volume_up":
            run_adb_command("shell input keyevent 24")
        elif action == "volume_down":
            run_adb_command("shell input keyevent 25")
        elif action == "lock":
            run_adb_command("shell input keyevent 26")
        elif action == "screenshot":
            run_adb_command("shell input keyevent 120") # SysRq, might vary
        
        return {"status": "success", "message": f"System action: {action}"}

    # --- 3. SCROLLING / NAVIGATION ---
    if intent == "scroll":
        direction = parameters.get("direction", "down")
        if direction == "down":
            # Swipe UP to scroll DOWN
            run_adb_command("shell input swipe 500 1500 500 500 300")
        elif direction == "up":
            # Swipe DOWN to scroll UP
            run_adb_command("shell input swipe 500 500 500 1500 300")
        
        return {"status": "success", "message": f"Scrolling {direction}"}

    # --- 4. TEXT INPUT ---
    if intent == "type":
        text = parameters.get("text", "")
        # Replace spaces with %s for ADB
        formatted_text = text.replace(" ", "%s")
        run_adb_command(f"shell input text {formatted_text}")
        return {"status": "success", "message": f"Typing: {text}"}

    return {"status": "unknown", "message": "Command not recognized by Neural Core."}

# Keep the specialized food/camera ones as shortcuts or legacy
@app.post("/action/order-food")
def order_food(food_item: str):
    # Reuse previous logic or redirect to 'open' if simplistic
    # ... (Keeping existing robust logic for Zomato)
    apps = [("com.application.zomato", "Zomato"), ("in.swiggy.android", "Swiggy")]
    for pkg, name in apps:
         # ... existing implementation ...
         check = run_adb_command(f"shell pm list packages {pkg}")
         if check and pkg in check:
             if "zomato" in pkg:
                 deep_link = f"zomato://search?q={food_item}"
             else:
                 # Swiggy fallback
                 deep_link = f"swiggy://explore?query={food_item}"
             
             run_adb_command(["shell", "am", "start", "-a", "android.intent.action.VIEW", "-d", deep_link, "-p", pkg])
             return {"status": "launched", "app": name, "action": f"Searching for {food_item}"}
    return {"status": "failed"}

@app.post("/action/camera-guide")
def camera_guide():
    """Lauches camera or prepares for guidance."""
    # The frontend will handle the specific 'guide' UI using the webcam stream.
    # But if we need to open the native camera:
    # run_adb_command("shell am start -a android.media.action.IMAGE_CAPTURE")
    return {"status": "ready", "message": "Camera guide active"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
