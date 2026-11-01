from typing import Literal
from fastapi import APIRouter,Query


def crear_rutas(analisis,partituras):
    router=APIRouter(prefix='/api',tags=['Canciones e imágenes'])
    router.add_api_route('/canciones',analisis.obtener_canciones,methods=['GET'])
    router.add_api_route('/analisis/{cancion_id}',analisis.obtener_analisis,methods=['GET'])
    router.add_api_route('/ocupacion/{cancion_id}',analisis.obtener_ocupacion,methods=['GET'])
    router.add_api_route('/imagenes/{cancion_id}/{canal}.png',analisis.obtener_imagen,methods=['GET'])

    @router.get('/estado/{cancion_id}')
    def obtener_estado(cancion_id:str,tiempo:float=Query(default=0,ge=0),recorrido:Literal['filas','serpentina','hilbert']='filas'):
        estado=analisis.obtener_estado(cancion_id,tiempo,recorrido)
        estado['partituras']=partituras.estado(cancion_id,estado['indice'])
        return estado
    return router
