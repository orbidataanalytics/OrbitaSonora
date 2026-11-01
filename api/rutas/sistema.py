import time
from fastapi import APIRouter


def crear_rutas():
    router=APIRouter(tags=['Sistema y GOES'])

    @router.get('/')
    def home():
        return {'status':'online','sistema':'Órbita Sonora API - Servidor Activo'}

    @router.get('/api/datos')
    def obtener_datos():
        return {'proyecto':'Órbita Sonora','organizacion':'ORBIDATA','planeta':'Tierra (GOES-16)',
                'estado':'Conectado','origen':'NOAA / NASA Open Data','album':'TRON: Legacy OST',
                'autores':'Daft Punk','genero':'Electronic / Synthwave / Cyberpunk'}

    @router.get('/api/goes')
    def obtener_goes():
        timestamp=int(time.time())
        return {'satelite':'GOES-16 (GOES-East)','coordenadas':'75.2° W (Suramérica)',
                'tipo_captura':'GeoColor Full Disk',
                'image_url':f'https://cdn.star.nesdis.noaa.gov/GOES16/ABI/FD/GEOCOLOR/1808x1808.jpg?t={timestamp}'}
    return router
