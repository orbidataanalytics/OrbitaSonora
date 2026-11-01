from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"mensaje": "API de Órbita Sonora funcionando desde la nube"}

@app.get("/api/datos")
def obtener_datos():
    return {"planeta": "Tierra", "estado": "Óptimo", "origen": "NASA"}
