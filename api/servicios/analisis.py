from collections import Counter
from typing import Literal
import math
import struct
import zlib
from fastapi import HTTPException, Query
from fastapi.responses import Response


class ServicioAnalisis:
    def __init__(self, repositorio):
        self.datos = repositorio.pixeles
        self.canciones = {c['id']: c for c in repositorio.pixeles['canciones']}
        self.rgb = dict(repositorio.rgb)
        self.activos = dict(repositorio.activos)
        self.rutas = {}

    def buscar_cancion(self, cancion_id):
        if cancion_id not in self.canciones:
            raise HTTPException(status_code=404, detail='Canción no encontrada')
        return self.canciones[cancion_id]

    def obtener_canciones(self):
        return {
            'version': self.datos['version'], 'revision': self.datos['revision'],
            'reloj': 'HTMLMediaElement.currentTime del reproductor existente',
            'canciones': [
                {k: c[k] for k in ('id', 'titulo', 'archivo_audio', 'duracion_s', 'lado', 'pixeles', 'segundos_por_pixel', 'sha256_audio', 'bandas')}
                for c in self.canciones.values()
            ],
        }

    def obtener_analisis(self, cancion_id: str):
        return self.buscar_cancion(cancion_id)

    def coordenada_hilbert(self, indice, lado):
        x = y = 0
        temporal = indice
        escala = 1
        while escala < lado:
            rx = 1 & (temporal // 2)
            ry = 1 & (temporal ^ rx)
            if ry == 0:
                if rx == 1:
                    x, y = escala-1-x, escala-1-y
                x, y = y, x
            x += escala*rx
            y += escala*ry
            temporal //= 4
            escala *= 2
        return x, y

    def obtener_recorrido(self, lado, recorrido):
        clave = (lado, recorrido)
        if clave not in self.rutas:
            coordenadas = []
            for i in range(lado*lado):
                y, x = divmod(i, lado)
                if recorrido == 'serpentina' and y % 2:
                    x = lado-1-x
                elif recorrido == 'hilbert':
                    x, y = self.coordenada_hilbert(i, lado)
                coordenadas.append((x, y))
            self.rutas[clave] = tuple(coordenadas)
        return self.rutas[clave]

    def indice_en_tiempo(self, cancion, tiempo):
        if not math.isfinite(tiempo) or tiempo < 0:
            raise HTTPException(status_code=422, detail='Tiempo inválido')
        return min(cancion['pixeles']-1, int(tiempo/cancion['duracion_s']*cancion['pixeles']))

    def obtener_estado(
        self, cancion_id: str, tiempo: float = Query(default=0, ge=0),
        recorrido: Literal['filas', 'serpentina', 'hilbert'] = 'filas',
    ):
        c = self.buscar_cancion(cancion_id)
        indice = self.indice_en_tiempo(c, tiempo)
        x, y = self.obtener_recorrido(c['lado'], recorrido)[indice]
        color = list(self.rgb[cancion_id][indice*3:indice*3+3])
        return {
            'cancion_id': cancion_id, 'indice': indice, 'pixel': indice+1, 'x': x, 'y': y,
            'intervalo_s': [indice*c['segundos_por_pixel'], (indice+1)*c['segundos_por_pixel']],
            'rgb': color, 'intensidad_porcentaje': [v/255*100 for v in color],
            'activo': bool(self.activos[cancion_id][indice]), 'recorrido': recorrido,
        }

    def obtener_ocupacion(
        self, cancion_id: str, niveles: Literal[4, 8, 16] = 8,
        tiempo: float | None = Query(default=None, ge=0),
    ):
        c = self.buscar_cancion(cancion_id)
        limite = c['pixeles'] if tiempo is None else self.indice_en_tiempo(c, tiempo)+1
        secuencia = self.rgb[cancion_id]
        conteos = Counter()
        primeros = {}
        for i in range(limite):
            if not self.activos[cancion_id][i]:
                continue
            firma = tuple(min(niveles-1, v*niveles//256) for v in secuencia[3*i:3*i+3])
            conteos[firma] += 1
            primeros.setdefault(firma, i)
        total = sum(conteos.values())
        ordenadas = sorted(conteos.items(), key=lambda kv: (-kv[1], kv[0]))
        return {
            'cancion_id': cancion_id, 'niveles_por_banda': niveles,
            'criterio': 'coincidencia de tres intensidades RGB cuantizadas; silencios excluidos',
            'ambito': 'canción completa' if tiempo is None else 'hasta el cursor',
            'pixeles_considerados': limite, 'pixeles_activos': total,
            'firmas_distintas': len(conteos), 'unidad': 'intervalos de tiempo; no número de reproducciones',
            'firmas': [
                {'firma': list(firma), 'repeticiones': veces, 'ocupacion_pct': veces/total*100,
                 'duracion_s': veces*c['segundos_por_pixel'], 'primer_indice': primeros[firma]}
                for firma, veces in ordenadas
            ],
        }

    def crear_png(self, lado, pixeles):
        def bloque(tipo, datos):
            return struct.pack('!I', len(datos))+tipo+datos+struct.pack('!I', zlib.crc32(tipo+datos)&0xffffffff)
        filas = b''.join(b'\0'+pixeles[y*lado*3:(y+1)*lado*3] for y in range(lado))
        return (b'\x89PNG\r\n\x1a\n'+bloque(b'IHDR', struct.pack('!2I5B', lado, lado, 8, 2, 0, 0, 0))
                +bloque(b'IDAT', zlib.compress(filas, 9))+bloque(b'IEND', b''))

    def obtener_imagen(
        self, cancion_id: str, canal: Literal['RGB', 'R', 'G', 'B'],
        recorrido: Literal['filas', 'serpentina', 'hilbert'] = 'filas',
    ):
        c = self.buscar_cancion(cancion_id)
        imagen = bytearray(c['pixeles']*3)
        datos = self.rgb[cancion_id]
        seleccion = {'R': 0, 'G': 1, 'B': 2}.get(canal)
        for i, (x, y) in enumerate(self.obtener_recorrido(c['lado'], recorrido)):
            destino = (y*c['lado']+x)*3
            for banda in range(3):
                if seleccion is None or seleccion == banda:
                    imagen[destino+banda] = datos[3*i+banda]
        return Response(self.crear_png(c['lado'], bytes(imagen)), media_type='image/png',
                        headers={'Cache-Control': 'public, max-age=3600'})
