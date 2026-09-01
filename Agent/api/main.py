from fastapi import FastAPI # type: ignore
from fastapi.middleware.cors import CORSMiddleware  #type: ignore
from pydantic import BaseModel

import requests  # type: ignore
import ollama

app = FastAPI()

origins = [
    "http://localhost.tiangolo.com",
    "https://localhost.tiangolo.com",
    "http://localhost",
    "http://localhost:8080",
    "http://localhost:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)




@app.get("/")
def read_api():
    return {"hello": "world"}


@app.get("/ai")
def response_ai(prompt: str):
    invoke_url = "https://integrate.api.nvidia.com/v1/chat/completions"
    stream = True

    headers = {
        "Authorization": "Bearer $NVIDIA_API_KEY",
        "Accept": "text/event-stream" if stream else "application/json",
    }

    payload = {
        "messages": [{"role": "user", "content": [{"type": "text", "text": "prompt"}]}],
        "model": "moonshotai/kimi-k3",
        "max_tokens": 16384,
        "seed": 0,
        "stream": stream,
        "temperature": 1,
        "reasoning_effort": "max",
    }

    response = requests.post(invoke_url, headers=headers, json=payload, stream=stream)

    return {
        "answer" : response
    }



class input_field(BaseModel):
    prompt:str



@app.post("/ollama/ai")
def response_ollama(data:input_field):
    print(data)

    print("prompt : ", data.prompt)

    response = ollama.generate(
        model="llama3",
        prompt=data.prompt
    )

    print("response : ", response.response)
    return {
        "answer":response.response
    }