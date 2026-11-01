from statistics import mean,median,pstdev
from fastapi import HTTPException


class ServicioInformes:
    def __init__(self,analisis,partituras):
        self.analisis=analisis
        self.partituras=partituras

    def estadisticas_banda(self,valores):
        orden=sorted(valores)
        return {'minimo':min(valores),'maximo':max(valores),'media':mean(valores),'mediana':median(valores),
                'desviacion_poblacional':pstdev(valores),'p05':self.percentil(orden,.05),'p95':self.percentil(orden,.95)}

    def percentil(self,orden,q):
        i=(len(orden)-1)*q;a=int(i);b=min(len(orden)-1,a+1)
        return orden[a]+(orden[b]-orden[a])*(i-a)

    def obtener(self,cancion_id,recorrido,niveles,manuales):
        c=self.analisis.buscar_cancion(cancion_id)
        rgb=self.analisis.rgb[cancion_id]
        valores=[list(rgb[i*3:i*3+3]) for i in range(c['pixeles'])]
        activos=self.analisis.activos[cancion_id]
        ocupacion=self.analisis.obtener_ocupacion(cancion_id,niveles,None)
        puntos={}
        def agregar(indice,motivo):puntos.setdefault(indice,[]).append(motivo)
        for b,ch in enumerate('RGB'):agregar(max(range(c['pixeles']),key=lambda i:valores[i][b]),'Máximo '+ch)
        agregar(max(range(c['pixeles']),key=lambda i:sum(valores[i])),'Máxima intensidad visual conjunta')
        cambio=max(range(1,c['pixeles']),key=lambda i:sum((valores[i][b]-valores[i-1][b])**2 for b in range(3)))
        agregar(cambio,'Mayor cambio de firma entre píxeles consecutivos')
        if ocupacion['firmas']:agregar(ocupacion['firmas'][0]['primer_indice'],'Primera aparición de la firma más frecuente')
        for i in manuales:
            if not 0<=i<c['pixeles']:raise HTTPException(status_code=422,detail='Píxel marcado fuera de la imagen')
            agregar(i,'Marca manual')
        ruta=self.analisis.obtener_recorrido(c['lado'],recorrido)
        return {
            'cancion_id':cancion_id,'titulo':c['titulo'],'duracion_s':c['duracion_s'],'sha256_audio':c['sha256_audio'],
            'lado':c['lado'],'pixeles':c['pixeles'],'recorrido':recorrido,'bandas':c['bandas'],'guardas_hz':c['guardas_hz'],
            'estadisticas':{ch:self.estadisticas_banda([fila[b] for fila in valores]) for b,ch in enumerate('RGB')},
            'unidad_estadisticas':'intensidades visuales RGB de 0 a 255, con la escala común de 70 dB del análisis',
            'pixeles_activos':sum(activos),'pixeles_silencio':c['pixeles']-sum(activos),
            'ocupacion':ocupacion,
            'pixeles_importantes':[{'indice':i,'pixel':i+1,'x':ruta[i][0],'y':ruta[i][1],'motivos':motivos,
                'intervalo_s':[i*c['segundos_por_pixel'],(i+1)*c['segundos_por_pixel']],
                'rgb':valores[i],'notas':self.partituras.estado(cancion_id,i)} for i,motivos in sorted(puntos.items())],
            'partituras':{ch:b['resumen'] for ch,b in self.partituras.obtener(cancion_id)['bandas'].items()},
        }
