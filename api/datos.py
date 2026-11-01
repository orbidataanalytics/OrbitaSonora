from pathlib import Path
import base64
import json


class RepositorioDatos:
    def __init__(self, raiz):
        self.leer_archivos(raiz)
        self.decodificar()
        self.validar()

    def leer_archivos(self, raiz):
        self.raiz=Path(raiz).resolve()
        self.pixeles=json.loads((self.raiz/'datos/pixeles.json').read_text(encoding='utf-8'))
        self.partituras=json.loads((self.raiz/'datos/partituras.json').read_text(encoding='utf-8'))

    def decodificar(self):
        self.rgb={c['id']:base64.b64decode(c['rgb_base64']) for c in self.pixeles['canciones']}
        self.activos={c['id']:base64.b64decode(c['activos_base64']) for c in self.pixeles['canciones']}

    def validar(self):
        for c in self.pixeles['canciones']:
            if len(self.rgb[c['id']])!=c['pixeles']*3 or len(self.activos[c['id']])!=c['pixeles']:
                raise ValueError(f"Datos de píxeles incompletos para {c['id']}")
            p=self.partituras['canciones'].get(c['id'])
            if not p or p['sha256_audio']!=c['sha256_audio'] or p['pixeles']!=c['pixeles']:
                raise ValueError(f"Partituras y píxeles no corresponden al mismo audio: {c['id']}")
