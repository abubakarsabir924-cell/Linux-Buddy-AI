import os
from dotenv import load_dotenv
load_dotenv()
import subprocess
from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
import requests

app = FastAPI()

API_KEY = ""
print(f"API KEY LOADED: {API_KEY[:10] if API_KEY else 'EMPTY'}")
MODEL = "anthropic/claude-haiku-4-5"

class Message(BaseModel):
    message: str

conversation = []

@app.get("/", response_class=HTMLResponse)
def home():
    with open("gui/index.html", "r") as f:
        return f.read()

@app.post("/chat")
def chat(msg: Message):
    conversation.append({
        "role": "user",
        "content": msg.message
    })

    system = """You are Linux Buddy AI — a friendly terminal assistant.
Help user understand their Linux goal before starting.
Ask clarifying questions if needed.
Keep responses short and conversational.
Do NOT give commands yet — just understand the problem."""

    response = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json"
        },
        json={
            "model": MODEL,
            "max_tokens": 300,
            "messages": [
                {"role": "system", "content": system},
                *conversation
            ]
        }
    )

    data = response.json()

    if "choices" in data:
        reply = data["choices"][0]["message"]["content"]
    elif "error" in data:
        reply = f"Error: {data['error']['message']}"
    else:
        reply = str(data)

    conversation.append({
        "role": "assistant",
        "content": reply
    })

    return {"reply": reply}

@app.post("/start")
def start():
    subprocess.Popen(
        ["bash", "-c",
         "source ~/linuxbuddy-env/bin/activate && python3 ~/linuxbuddy/main.py"],
        start_new_session=True
    )
    return {"status": "started"}

