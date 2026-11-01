from pathlib import Path
import sys,base64,math,importlib.util
from collections import Counter
import json
r=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(r))
from main import app
from fastapi.testclient import TestClient
client=TestClient(app)
a=app.state.analisis
assert client.get('/').json()=={'status':'online','sistema':'Órbita Sonora API - Servidor Activo'}
assert client.get('/api/datos').json()['album']=='TRON: Legacy OST'
assert client.get('/api/goes').json()['image_url'].startswith('https://cdn.star.nesdis.noaa.gov/GOES16/')
for c in a.canciones.values():
 cid=c['id'];n=c['pixeles'];dt=c['segundos_por_pixel']
 p=client.get('/api/partituras/'+cid).json()
 assert p['sha256_audio']==c['sha256_audio']
 for ch,band in p['bandas'].items():
  anterior=0
  for e in band['eventos']:
   assert e[0]==anterior and 0<=e[0]<e[1]<=n
   assert e[2] in (-2,-1) or 0<=e[2]<=140
   if e[2]>=0:
    assert band['min_hz']<=e[3]<=band['max_hz']
    assert (e[1]-e[0])*dt>=.1-1e-6
   anterior=e[1]
  assert anterior==n
  assert abs(sum(band['resumen'][k] for k in ['segundos_con_altura','segundos_sin_altura','segundos_silencio'])-c['duracion_s'])<.003
 for camino in ['filas','serpentina','hilbert']:
  coordenadas=a.obtener_recorrido(c['lado'],camino)
  assert len(set(coordenadas))==n
  if camino!='filas':assert all(abs(x[0]-y[0])+abs(x[1]-y[1])==1 for x,y in zip(coordenadas,coordenadas[1:]))
  for t in [0,.05,c['duracion_s']*.5,c['duracion_s'],c['duracion_s']+1]:
   estado=client.get('/api/estado/'+cid,params={'tiempo':t,'recorrido':camino}).json()
   i=min(n-1,int(t/c['duracion_s']*n))
   assert estado['indice']==i
   assert (estado['x'],estado['y'])==coordenadas[i]
   for nota in estado['partituras'].values():assert nota['inicio_pixel']<=i<nota['fin_pixel_exclusivo']
  for canal in ['RGB','R','G','B']:
   im=client.get(f'/api/imagenes/{cid}/{canal}.png',params={'recorrido':camino})
   assert im.status_code==200 and im.content[:8]==b'\x89PNG\r\n\x1a\n'
  informe=client.get('/api/informe/'+cid,params={'recorrido':camino,'marcados':'0,101'}).json()
  assert any(p['indice']==101 and 'Marca manual' in p['motivos'] for p in informe['pixeles_importantes'])
  assert sum(f['repeticiones'] for f in informe['ocupacion']['firmas'])==informe['pixeles_activos']
  for punto in informe['pixeles_importantes']:
   assert (punto['x'],punto['y'])==coordenadas[punto['indice']]
 assert client.get('/audio/'+c['archivo_audio'],headers={'Range':'bytes=0-31'}).status_code==206
 print('OK',cid,'recorridos, imágenes, alturas, informe y tiempo común')
for path in ['/api/partituras/no-existe','/api/informe/no-existe']:assert client.get(path).status_code==404
for query in ['marcados=x','marcados=-1','marcados=4096','niveles=5','recorrido=otro']:
 assert client.get('/api/informe/derezzed?'+query).status_code==422
for path in ['/api/estado/derezzed?tiempo=nan','/api/estado/derezzed?tiempo=-1']:assert client.get(path).status_code==422
print('OK rutas originales y validación de parámetros')
