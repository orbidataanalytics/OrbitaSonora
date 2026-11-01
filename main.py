from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Órbita Sonora API",
    description="Backend oficial de Órbita Sonora conectado con productos NASA",
    version="1.0.0"
)

# Permitir conexiones desde cualquier origen (incluyendo GitHub Pages)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {
        "status": "online",
        "mensaje": "API de Órbita Sonora funcionando desde la nube en Render"
    }

@app.get("/api/datos")
def obtener_datos():
    return {
        "proyecto": "Órbita Sonora",
        "organizacion": "ORBIDATA",
        "planeta": "Tierra",
        "estado": "Óptimo",
        "origen": "NASA Open Data",
        "pista_actual": "Emisiones de Plasma Espacial - Voyager 1"
    }
