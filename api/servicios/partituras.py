from bisect import bisect_right
from fastapi import HTTPException


class ServicioPartituras:
    def __init__(self, repositorio):
        self.canciones=dict(repositorio.partituras['canciones'])
        self.metodo=dict(repositorio.partituras['metodo'])
        self.inicios={cid:{canal:[e[0] for e in banda['eventos']] for canal,banda in c['bandas'].items()} for cid,c in self.canciones.items()}

    def obtener(self,cancion_id):
        if cancion_id not in self.canciones:
            raise HTTPException(status_code=404,detail='Partitura no encontrada')
        return {'metodo':self.metodo,**self.canciones[cancion_id]}

    def nombre_nota(self,midi):
        if midi==-2:return 'Silencio'
        if midi==-1:return 'Sin altura definida'
        return ['Do','Do♯','Re','Re♯','Mi','Fa','Fa♯','Sol','Sol♯','La','La♯','Si'][midi%12]+str(midi//12-1)

    def estado(self,cancion_id,indice):
        cancion=self.obtener(cancion_id)
        salida={}
        for canal,banda in cancion['bandas'].items():
            eventos=banda['eventos']
            posicion=max(0,bisect_right(self.inicios[cancion_id][canal],indice)-1)
            evento=eventos[posicion]
            salida[canal]={'indice_evento':posicion,'inicio_pixel':evento[0],'fin_pixel_exclusivo':evento[1],
                'midi':evento[2] if evento[2]>=0 else None,'nombre':self.nombre_nota(evento[2]),
                'frecuencia_hz':evento[3],'confianza_espectral':evento[4],
                'inicio_s':evento[0]*cancion['segundos_por_pixel'],'fin_s':evento[1]*cancion['segundos_por_pixel']}
        return salida
