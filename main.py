from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import time

app = FastAPI(
    title="Órbita Sonora API",
    description="Backend oficial de Órbita Sonora / ORBIDATA",
    version="1.0.0"
)

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
        "sistema": "Órbita Sonora API"
    }

# Endpoint que sirve el catálogo oficial a la rocola
@app.get("/api/datos")
def obtener_datos():
    return {
        "proyecto": "Órbita Sonora",
        "organizacion": "ORBIDATA",
        "planeta": "Tierra (GOES-16)",
        "estado": "Óptimo",
        "origen": "NOAA / NASA Open Data",
        "album": "TRON: Legacy OST",
        "autores": "Daft Punk",
        "genero": "Electronic / Synthwave / Cyberpunk",
        "catalogo": [
            {
                "id": 1,
                "titulo": "End Of Line",
                "album": "TRON: Legacy OST",
                "autores": "Daft Punk",
                "genero": "Electronic / Cyberpunk"
            },
            {
                "id": 2,
                "titulo": "Derezzed",
                "album": "TRON: Legacy OST",
                "autores": "Daft Punk",
                "genero": "Electro House / Synthwave"
            },
            {
                "id": 3,
                "titulo": "The Son Of Flynn",
                "album": "TRON: Legacy OST",
                "autores": "Daft Punk",
                "genero": "Ambient Synth / Electronic"
            }
        ]
    }

@app.get("/api/goes")
def obtener_goes():
    timestamp = int(time.time())
    return {
        "satelite": "GOES-16 (GOES-East)",
        "coordenadas": "75.2° W (Centrado en Suramérica)",
        "tipo_captura": "GeoColor Full Disk",
        "image_url": f"https://cdn.star.nesdis.noaa.gov/GOES16/ABI/FD/GEOCOLOR/1808x1808.jpg?t={timestamp}"
    }
