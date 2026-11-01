from fastapi import APIRouter


def crear_rutas(servicio):
    router=APIRouter(prefix='/api/partituras',tags=['Partituras'])
    @router.get('/{cancion_id}')
    def obtener_partitura(cancion_id:str):
        return servicio.obtener(cancion_id)
    return router
