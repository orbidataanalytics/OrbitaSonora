import {audio,playlist,pistaCargadaIndex,pistaSeleccionada} from './reproductor.js';
import {emitir,escuchar} from './eventos.js';
export class RelojReproduccion {
    constructor(datos){
        this.catalogo=new Map(datos.canciones.map(c=>[c.id,c]));this.raf=null;this.esperando=false;
        for(const nombre of ['loadedmetadata','durationchange','timeupdate','seeking','seeked','play','pause','ended','emptied','ratechange','loadeddata'])audio.addEventListener(nombre,()=>this.actualizar());
        audio.addEventListener('waiting',()=>{this.esperando=true;this.actualizar();});
        audio.addEventListener('playing',()=>{this.esperando=false;this.actualizar();});
        escuchar('orbita:pista',()=>{this.esperando=false;this.actualizar();});
        document.addEventListener('visibilitychange',()=>{if(!document.hidden)this.actualizar();});
        this.actualizar();
    }
    actualizar(){
        const index=pistaCargadaIndex>=0?pistaCargadaIndex:pistaSeleccionada;
        const cancion=this.catalogo.get(playlist[index].id);if(!cancion)return;
        const tiempo=pistaCargadaIndex>=0?Math.max(0,audio.currentTime||0):0;
        const indice=Math.min(cancion.pixeles-1,Math.floor(tiempo/cancion.duracion_s*cancion.pixeles));
        this.estado={id:cancion.id,tiempo,indice,duracion:cancion.duracion_s,pausado:audio.paused,buscando:audio.seeking,esperando:this.esperando};
        emitir('orbita:reloj',this.estado);
        if(!audio.paused&&!audio.ended&&this.raf===null){this.raf=requestAnimationFrame(()=>{this.raf=null;this.actualizar();});}
        if((audio.paused||audio.ended)&&this.raf!==null){cancelAnimationFrame(this.raf);this.raf=null;}
    }
}
