from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import time

app = FastAPI(
    title="Órbita Sonora API",
    description="Backend oficial de Órbita Sonora / ORBIDATA con telemetría satelital GOES-16",
    version="1.0.0"
)

# Permitir solicitudes desde GitHub Pages
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
        "sistema": "Órbita Sonora API - Servidor Activo"
    }

@app.get("/api/datos")
def obtener_datos():
    return {
        "proyecto": "Órbita Sonora",
        "organizacion": "ORBIDATA",
        "planeta": "Tierra (GOES-16)",
        "estado": "Conectado",
        "origen": "NOAA / NASA Open Data",
        "album": "TRON: Legacy OST",
        "autores": "Daft Punk",
        "genero": "Electronic / Synthwave / Cyberpunk"
    }

# Telemetría del satélite GOES-16 centrado en Suramérica
@app.get("/api/goes")
def obtener_goes():
    timestamp = int(time.time())
    return {
        "satelite": "GOES-16 (GOES-East)",
        "coordenadas": "75.2° W (Suramérica)",
        "tipo_captura": "GeoColor Full Disk",
        "image_url": f"https://cdn.star.nesdis.noaa.gov/GOES16/ABI/FD/GEOCOLOR/1808x1808.jpg?t={timestamp}"
    }
