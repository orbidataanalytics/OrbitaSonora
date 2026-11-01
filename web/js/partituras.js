import {escuchar} from './eventos.js';
import {audio} from './reproductor.js';
import {pentagrama,eventoEn,nombreNota} from './notacion.js';
export class Partituras {
    constructor(datos,imagenes){
        this.datos=structuredClone(datos);this.imagenes=imagenes;this.ventana=8;this.inicio=-1;this.actualId=null;this.eventosActivos={};
        document.getElementById('score-window').addEventListener('change',e=>{this.ventana=Number(e.target.value);this.inicio=-1;this.actualizar(this.ultimo);});
        for(const canal of 'RGB')document.getElementById('score-'+canal).addEventListener('click',e=>{
            const svg=e.currentTarget.querySelector('svg');if(!svg||!this.ultimo)return;
            const rect=svg.getBoundingClientRect(),x=(e.clientX-rect.left)/rect.width*1000;
            if(x<88||x>976)return;const t=this.inicio+(x-88)/888*(this.fin-this.inicio);
            this.imagenes.buscar(Math.floor(t/this.imagenes.cancion.segundos_por_pixel));
        });
        escuchar('orbita:reloj',e=>this.actualizar(e.detail));
    }
    actualizar(estado){
        if(!estado)return;this.ultimo=estado;
        const c=this.imagenes.catalogo.get(estado.id),partitura=this.datos.canciones[estado.id];
        if(!partitura)return;
        const inicio=Math.floor(Math.min(estado.tiempo,Math.max(0,c.duracion_s-.0001))/this.ventana)*this.ventana;
        if(this.actualId!==estado.id||inicio!==this.inicio){
            this.actualId=estado.id;this.inicio=inicio;this.fin=Math.min(c.duracion_s,inicio+this.ventana);this.eventosActivos={};
            document.getElementById('score-range').textContent=`${c.titulo} · ${inicio.toFixed(1)}–${this.fin.toFixed(1)} s`;
            for(const canal of 'RGB')document.getElementById('score-'+canal).innerHTML=pentagrama(c,partitura,canal,inicio,this.fin,estado.indice);
        }
        const x=88+Math.max(0,Math.min(1,(estado.tiempo-inicio)/(this.fin-inicio)))*888;
        for(const canal of 'RGB'){
            const contenedor=document.getElementById('score-'+canal),cursor=contenedor.querySelector('.score-cursor');
            if(cursor){cursor.setAttribute('x1',x);cursor.setAttribute('x2',x);}
            const eventos=partitura.bandas[canal].eventos,activo=eventoEn(eventos,estado.indice);
            if(this.eventosActivos[canal]!==activo){
                contenedor.querySelectorAll('.score-active').forEach(n=>n.classList.remove('score-active'));
                contenedor.querySelector(`[data-evento="${activo}"]`)?.classList.add('score-active');
                this.eventosActivos[canal]=activo;const nota=eventos[activo];
                document.getElementById('score-current-'+canal).textContent=nombreNota(nota[2])+(nota[3]!==null?` · ${nota[3].toFixed(1)} Hz`:'');
            }
        }
        document.getElementById('score-time').textContent=`${estado.tiempo.toFixed(3)} s · píxel ${estado.indice+1}`;
    }
}
