"""Entrada de Render. Las rutas y los servicios se mantienen en el paquete api.

uvicorn main:app --host 0.0.0.0 --port $PORT
"""
from api.aplicacion import crear_app

app = crear_app()
