import {coordenadasRecorrido} from './recorridos.js';
import {audio,playlist,pistaCargadaIndex,pistaSeleccionada,seleccionarItem} from './reproductor.js';
import {emitir,escuchar} from './eventos.js';
import {API_BASE} from './conexion.js';
// El tiempo siempre procede del audio de la rocola. requestAnimationFrame solo pinta.
export class OrbitaPixel {
    constructor(datos) {
        this.datos = structuredClone(datos);
        this.catalogo = new Map(this.datos.canciones.map(c => [c.id,c]));
        this.canales = ['rgb','r','g','b'];
        this.lienzos = this.canales.map(c => document.getElementById(`pixel-${c}`));
        this.heat = document.getElementById('pixel-heat');
        this.token = 0;
        this.indice = -1;
        this.filtro = null;
        this.esperando = false;
        this.ruta = 'filas';
        this.enlazarControles();
        this.enlazarReloj();
        this.cargar(playlist[pistaSeleccionada].id);
    }
    decodificar(texto) {
        return Uint8Array.from(atob(texto), c => c.charCodeAt(0));
    }
    enlazarControles() {
        document.getElementById('pixel-path').addEventListener('change', e => {
            this.ruta = e.target.value;
            this.crearRecorrido();
            this.crearImagenes();
            this.crearMapaRepeticion();
            this.actualizar(true);
        });
        for (const id of ['pixel-levels','pixel-scope']) {
            document.getElementById(id).addEventListener('change', () => {
                this.filtro = null;
                this.prepararFirmas();
                this.actualizar(true);
            });
        }
        document.getElementById('pixel-show-all').addEventListener('click', () => {
            this.filtro = null;
            document.getElementById('pixel-filter-label').textContent = 'Se muestran todas las firmas.';
            this.crearMapaRepeticion();
            this.pintarImagenes();
        });
        document.getElementById('pixel-save').textContent = 'Descargar cuatro PNG (ZIP)';
        document.getElementById('pixel-save').addEventListener('click', () => this.descargarImagenes());
        for (const canvas of [...this.lienzos,this.heat]) {
            canvas.addEventListener('click', e => {
                const rect = canvas.getBoundingClientRect();
                const x = Math.min(this.cancion.lado-1,Math.max(0,Math.floor((e.clientX-rect.left)/rect.width*this.cancion.lado)));
                const y = Math.min(this.cancion.lado-1,Math.max(0,Math.floor((e.clientY-rect.top)/rect.height*this.cancion.lado)));
                this.buscar(this.inversa[y*this.cancion.lado+x]);
            });
            canvas.addEventListener('keydown', e => {
                let objetivo;
                if (e.key==='ArrowRight' || e.key==='ArrowDown') objetivo = this.indice+1;
                if (e.key==='ArrowLeft' || e.key==='ArrowUp') objetivo = this.indice-1;
                if (e.key==='Home') objetivo = 0;
                if (e.key==='End') objetivo = this.cancion.pixeles-1;
                if (objetivo!==undefined) { e.preventDefault(); this.buscar(objetivo); }
            });
        }
    }
    enlazarReloj() {
        escuchar('orbita:reloj', e => {
            const estado=e.detail;
            if(this.cancion?.id!==estado.id)this.cargar(estado.id);
            this.esperando=estado.esperando;
            this.actualizar(false,estado);
        });
        escuchar('orbita:error', e=>this.estado(e.detail.mensaje,true));
        audio.addEventListener('error',()=>this.estado('No se pudo abrir la pista. Revisa tu carpeta audio.',true));
    }
    cargar(id) {
        const cancion = this.catalogo.get(id);
        if (!cancion) { this.estado('Esta pista no tiene análisis de bandas.',true); return; }
        this.token += 1;
        this.cancion = cancion;
        this.rgb = this.decodificar(cancion.rgb_base64);
        this.activos = this.decodificar(cancion.activos_base64);
        this.indice = -1;
        this.filtro = null;
        this.esperando = false;
        document.getElementById('pixel-filter-label').textContent = 'Se muestran todas las firmas.';
        document.getElementById('pixel-song').textContent = `${cancion.titulo} · ${(cancion.segundos_por_pixel*1000).toFixed(1)} ms por píxel · ${cancion.duracion_s.toFixed(3)} s`;
        this.crearRecorrido();
        this.crearImagenes();
        this.prepararFirmas();
        this.actualizar(true);
        this.consultarAPI(id,this.token);
    }
    async consultarAPI(id,token) {
        // Los datos integrados permiten usar GitHub Pages aunque Render esté arrancando.
        const controlador = new AbortController();
        const limite = setTimeout(() => controlador.abort(),4000);
        try {
            const respuesta = await fetch(`${API_BASE}/api/analisis/${encodeURIComponent(id)}`,{signal:controlador.signal});
            if (!respuesta.ok) return;
            const datos = await respuesta.json();
            if (token!==this.token || datos.id!==id || datos.version!==2 || datos.sha256_audio!==this.cancion.sha256_audio) return;
            // Comprueba el contrato antes de aceptar una respuesta de una API desplegada.
            if (datos.rgb_base64!==this.cancion.rgb_base64 || datos.pixeles!==this.cancion.pixeles) return;
            this.catalogo.set(id,datos);
        } catch (_) { /* El análisis local de la misma pista sigue disponible. */ }
        finally { clearTimeout(limite); }
    }
    crearRecorrido() {
        this.coordenadas=coordenadasRecorrido(this.cancion.lado,this.ruta);
        this.inversa=new Uint32Array(this.cancion.pixeles);
        this.coordenadas.forEach(([x,y],i)=>{this.inversa[y*this.cancion.lado+x]=i;});
    }
    nuevoLienzo() {
        const canvas=document.createElement('canvas');
        canvas.width=canvas.height=this.cancion.lado;
        return canvas;
    }
    crearImagenes() {
        const lado=this.cancion.lado;
        this.bases=this.canales.map((_,canal) => {
            const canvas=this.nuevoLienzo(),ctx=canvas.getContext('2d');
            const img=ctx.createImageData(lado,lado);
            for (let i=0;i<this.cancion.pixeles;i++) {
                const [x,y]=this.coordenadas[i],j=(y*lado+x)*4;
                for (let b=0;b<3;b++) img.data[j+b]=(canal===0 || canal===b+1)?this.rgb[i*3+b]:0;
                img.data[j+3]=255;
            }
            ctx.putImageData(img,0,0);
            return canvas;
        });
    }
    prepararFirmas() {
        this.niveles=Number(document.getElementById('pixel-levels').value);
        this.claves=new Int32Array(this.cancion.pixeles).fill(-1);
        for (let i=0;i<this.cancion.pixeles;i++) {
            if (!this.activos[i]) continue;
            const q=[0,1,2].map(b => Math.min(this.niveles-1,Math.floor(this.rgb[i*3+b]*this.niveles/256)));
            this.claves[i]=(q[0]*this.niveles+q[1])*this.niveles+q[2];
        }
        this.conteos=new Uint32Array(this.niveles**3);
        this.contado=0;
        this.totalActivo=0;
        this.contarHasta(document.getElementById('pixel-scope').value==='completa'?this.cancion.pixeles:Math.max(1,this.indice+1));
        this.actualizarOcupacion();
    }
    contarHasta(limite) {
        if (limite<this.contado) {this.conteos.fill(0);this.contado=0;this.totalActivo=0;}
        for (let i=this.contado;i<limite;i++) if (this.claves[i]>=0) {this.conteos[this.claves[i]]++;this.totalActivo++;}
        this.contado=limite;
    }
    firmaDeClave(clave) {
        const l=this.niveles;
        return [Math.floor(clave/(l*l)),Math.floor(clave/l)%l,clave%l];
    }
    semaforo(veces) {
        const t=this.maximo===this.minimo?1:Math.max(0,Math.min(1,(veces-this.minimo)/(this.maximo-this.minimo)));
        const a=t<.5?[25,190,110]:[250,214,75];
        const b=t<.5?[250,214,75]:[245,77,78];
        const f=t<.5?t*2:(t-.5)*2;
        return a.map((v,i)=>Math.round(v+(b[i]-v)*f));
    }
    actualizarOcupacion() {
        this.ranking=[];
        this.conteos.forEach((veces,clave)=>{if(veces)this.ranking.push({clave,veces});});
        this.ranking.sort((a,b)=>b.veces-a.veces || a.clave-b.clave);
        this.maximo=this.ranking.length?this.ranking[0].veces:0;
        this.minimo=this.ranking.length?this.ranking[this.ranking.length-1].veces:0;
        this.crearMapaRepeticion();
        this.pintarCurvasFrecuentes();
        const formato=new Intl.NumberFormat('es-CO');
        document.getElementById('pixel-occupancy-summary').textContent=`${formato.format(this.ranking.length)} firmas distintas en ${formato.format(this.totalActivo)} intervalos con energía. ${this.cancion.pixeles-this.activos.reduce((a,b)=>a+b,0)} intervalos de silencio excluidos en la canción.`;
        this.pintarTabla();
    }
    pintarTabla() {
        const tbody=document.getElementById('pixel-ranks');
        if(!this.filasRanking) this.filasRanking=[];
        for(let i=0;i<6;i++) {
            if(!this.filasRanking[i]) {
                const fila=document.createElement('tr');
                const nombre=document.createElement('td'),punto=document.createElement('span'),texto=document.createTextNode('');
                punto.className='pixel-rank-dot';nombre.append(punto,texto);
                const veces=document.createElement('td'),porcentaje=document.createElement('td'),accion=document.createElement('td'),boton=document.createElement('button');
                boton.type='button';boton.textContent='Ver píxeles';
                boton.addEventListener('click',()=>{
                    const clave=Number(boton.dataset.clave),firma=this.firmaDeClave(clave);
                    this.filtro=clave;
                    document.getElementById('pixel-filter-label').textContent=`Se destacan los píxeles de la firma ${firma.map(v=>v+1).join(' · ')} de ${this.niveles} niveles por banda.`;
                    this.crearMapaRepeticion();
                    const primer=this.claves.findIndex((v,j)=>v===clave && j<this.contado);
                    if(primer>=0)this.buscar(primer);
                    this.pintarImagenes();
                });
                accion.append(boton);fila.append(nombre,veces,porcentaje,accion);tbody.append(fila);
                this.filasRanking.push({fila,punto,texto,veces,porcentaje,boton});
            }
            const row=this.filasRanking[i],item=this.ranking[i];
            row.fila.hidden=!item;
            if(!item)continue;
            row.punto.style.background=`rgb(${this.semaforo(item.veces).join(',')})`;
            row.texto.textContent=this.firmaDeClave(item.clave).map(v=>`${v+1}/${this.niveles}`).join(' · ');
            row.veces.textContent=String(item.veces);
            row.veces.title=`${(item.veces*this.cancion.segundos_por_pixel).toFixed(3)} segundos acumulados`;
            row.porcentaje.textContent=`${(item.veces/this.totalActivo*100).toFixed(2)} %`;
            row.boton.dataset.clave=String(item.clave);
        }
    }
    crearMapaRepeticion() {
        if (!this.conteos) return;
        const lado=this.cancion.lado;
        this.baseHeat=this.nuevoLienzo();
        const ctx=this.baseHeat.getContext('2d'),img=ctx.createImageData(lado,lado);
        for (let i=0;i<this.cancion.pixeles;i++) {
            const [x,y]=this.coordenadas[i],j=(y*lado+x)*4,clave=this.claves[i];
            let color=[0,0,0];
            if(i>=this.contado) color=[29,39,53];
            else if (clave>=0) color=this.semaforo(this.conteos[clave]);
            if(this.filtro!==null && clave!==this.filtro) color=color.map(v=>Math.round(v*.13));
            img.data.set([...color,255],j);
        }
        ctx.putImageData(img,0,0);
    }
    ejes(canvas,titulo) {
        const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;
        ctx.clearRect(0,0,w,h);ctx.fillStyle='#08121e';ctx.fillRect(0,0,w,h);
        const x=[100,w/2,w-100],top=44,bottom=h-69;
        ctx.font='15px Poppins, sans-serif';ctx.textAlign='left';ctx.fillStyle='#b6c9df';ctx.fillText(titulo,24,24);
        for(let n=0;n<=100;n+=25){const y=bottom-(bottom-top)*n/100;ctx.strokeStyle='#21344b';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(65,y);ctx.lineTo(w-33,y);ctx.stroke();ctx.fillStyle='#8fa4bc';ctx.textAlign='right';ctx.fillText(String(n),53,y+5);}
        const labels=[['R · bajos','20–250 Hz'],['G · medios','350–500 Hz'],['B · altos','600–20 000 Hz']];
        labels.forEach((l,i)=>{ctx.textAlign='center';ctx.fillStyle=['#ff828b','#8aefae','#8cb4ff'][i];ctx.font='16px Poppins, sans-serif';ctx.fillText(l[0],x[i],h-39);ctx.fillStyle='#90a5be';ctx.font='14px Poppins, sans-serif';ctx.fillText(l[1],x[i],h-16);});
        return {ctx,x,top,bottom};
    }
    dibujarCurva(ejes,valores,color,grueso=3) {
        const {ctx,x,top,bottom}=ejes;
        ctx.strokeStyle=color;ctx.lineWidth=grueso;ctx.beginPath();
        valores.forEach((v,i)=>{const y=bottom-v*(bottom-top);if(i)ctx.lineTo(x[i],y);else ctx.moveTo(x[i],y);});ctx.stroke();
        valores.forEach((v,i)=>{ctx.fillStyle=color;ctx.beginPath();ctx.arc(x[i],bottom-v*(bottom-top),grueso+2,0,Math.PI*2);ctx.fill();});
    }
    pintarFirma() {
        const valores=[0,1,2].map(b=>this.rgb[this.indice*3+b]/255);
        const ejes=this.ejes(document.getElementById('pixel-signature'),'Intensidad visual común (%)');
        const grad=ejes.ctx.createLinearGradient(ejes.x[0],0,ejes.x[2],0);grad.addColorStop(0,'#ff7186');grad.addColorStop(.5,'#69e49a');grad.addColorStop(1,'#7ba6ff');
        this.dibujarCurva(ejes,valores,grad,4);
        for(let b=0;b<3;b++)document.getElementById(`pixel-value-${['r','g','b'][b]}`).textContent=`${(valores[b]*100).toFixed(1)} %`;
        const bytes=Array.from(this.rgb.slice(this.indice*3,this.indice*3+3));
        const hex='#'+bytes.map(v=>v.toString(16).padStart(2,'0')).join('');
        document.getElementById('pixel-rgb-label').textContent=hex.toUpperCase();
        document.getElementById('pixel-swatch').style.background=hex;
        document.getElementById('pixel-signature-text').textContent=this.activos[this.indice]?`RGB ${bytes.join(' · ')} · escala común de 70 dB.`:'Silencio excluido del conteo de firmas.';
    }
    pintarCurvasFrecuentes() {
        const ejes=this.ejes(document.getElementById('pixel-occupancy'),'Centros de las firmas más repetidas (%)');
        // Las más frecuentes se pintan al final para mantener visible el rojo.
        for(const item of this.ranking.slice(0,6).reverse()) {
            const valores=this.firmaDeClave(item.clave).map(v=>(v+.5)/this.niveles);
            this.dibujarCurva(ejes,valores,`rgb(${this.semaforo(item.veces).join(',')})`,item.veces===this.maximo?4:2);
        }
        if(!this.ranking.length){ejes.ctx.textAlign='center';ejes.ctx.fillStyle='#b4c7dc';ejes.ctx.fillText('Sin intervalos con energía en este tramo',450,140);}
    }
    marcador(canvas,base) {
        if(!base || this.indice<0)return;
        const ctx=canvas.getContext('2d'),lado=this.cancion.lado;
        ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(base,0,0,canvas.width,canvas.height);
        const [x,y]=this.coordenadas[this.indice],s=canvas.width/lado;
        ctx.strokeStyle='#000';ctx.lineWidth=3;ctx.strokeRect(x*s+.5,y*s+.5,s-1,s-1);
        ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.strokeRect(x*s+.5,y*s+.5,s-1,s-1);
        const cx=(x+.5)*s,cy=(y+.5)*s;
        ctx.strokeStyle='#ffffffa0';ctx.lineWidth=1;ctx.beginPath();
        for(const [a,b,c,d] of [[cx-13,cy,cx-6,cy],[cx+6,cy,cx+13,cy],[cx,cy-13,cx,cy-6],[cx,cy+6,cx,cy+13]]){ctx.moveTo(a,b);ctx.lineTo(c,d);}ctx.stroke();
    }
    pintarImagenes() {
        this.lienzos.forEach((canvas,i)=>this.marcador(canvas,this.bases[i]));
        this.marcador(this.heat,this.baseHeat);
    }
    estado(texto,error=false) {
        const e=document.getElementById('pixel-state');
        if(e.textContent!==texto)e.textContent=texto;
        e.classList.toggle('error',error);
    }
    actualizar(forzar=false, reloj=null) {
        if(!this.cancion)return;
        const coincide=pistaCargadaIndex>=0 && playlist[pistaCargadaIndex].id===this.cancion.id;
        const tiempo=reloj?.tiempo ?? (coincide?Math.max(0,audio.currentTime||0):0);
        if(coincide && Number.isFinite(audio.duration) && Math.abs(audio.duration-this.cancion.duracion_s)>Math.max(1,this.cancion.duracion_s*.01)) {
            this.estado('La duración de este audio no coincide con el análisis.',true);return;
        }
        const nuevo=reloj?.indice ?? Math.max(0,Math.min(this.cancion.pixeles-1,Math.floor(tiempo/this.cancion.duracion_s*this.cancion.pixeles)));
        if(nuevo!==this.indice || forzar) {
            this.indice=nuevo;
            if(document.getElementById('pixel-scope').value==='cursor') {this.contarHasta(nuevo+1);this.actualizarOcupacion();}
            const [x,y]=this.coordenadas[nuevo],dt=this.cancion.segundos_por_pixel;
            document.getElementById('pixel-position').textContent=`${nuevo+1} / ${this.cancion.pixeles} · columna ${x+1}, fila ${y+1}`;
            document.getElementById('pixel-time').textContent=`${(nuevo*dt).toFixed(3)}–${((nuevo+1)*dt).toFixed(3)} s`;
            document.getElementById('pixel-progress').textContent=`${(Math.min(1,tiempo/this.cancion.duracion_s)*100).toFixed(2)} %`;
            this.pintarImagenes();this.pintarFirma();
            emitir('orbita:pixel',{id:this.cancion.id,indice:this.indice,tiempo,recorrido:this.ruta});
        }
        if(!audio.error)this.estado(audio.seeking?'Buscando instante':this.esperando&&!audio.paused?'Esperando audio':audio.paused?'Pausado · mismo píxel': 'Sincronizado con la rocola');
    }
    buscar(indice) {
        if(pistaCargadaIndex!==pistaSeleccionada) seleccionarItem(pistaSeleccionada);
        const objetivo=Math.max(0,Math.min(this.cancion.pixeles-1,indice));
        const tiempo=(objetivo+.5)*this.cancion.segundos_por_pixel;
        const token=this.token;
        const aplicar=()=>{if(token!==this.token)return;audio.currentTime=tiempo;this.actualizar(true);};
        if(audio.readyState>=1)aplicar();else audio.addEventListener('loadedmetadata',aplicar,{once:true});
    }
    crc32(bytes) {
        let crc=0xffffffff;
        for(const b of bytes){crc^=b;for(let j=0;j<8;j++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}
        return (crc^0xffffffff)>>>0;
    }
    crearZip(archivos) {
        const partes=[],directorio=[];let offset=0;
        for(const a of archivos) {
            const nombre=new TextEncoder().encode(a.nombre),crc=this.crc32(a.bytes);
            const local=new Uint8Array(30+nombre.length),v=new DataView(local.buffer);
            v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint16(12,33,true);v.setUint32(14,crc,true);v.setUint32(18,a.bytes.length,true);v.setUint32(22,a.bytes.length,true);v.setUint16(26,nombre.length,true);local.set(nombre,30);
            const central=new Uint8Array(46+nombre.length),c=new DataView(central.buffer);
            c.setUint32(0,0x02014b50,true);c.setUint16(4,20,true);c.setUint16(6,20,true);c.setUint16(14,33,true);c.setUint32(16,crc,true);c.setUint32(20,a.bytes.length,true);c.setUint32(24,a.bytes.length,true);c.setUint16(28,nombre.length,true);c.setUint32(42,offset,true);central.set(nombre,46);
            partes.push(local,a.bytes);directorio.push(central);offset+=local.length+a.bytes.length;
        }
        const fin=new Uint8Array(22),f=new DataView(fin.buffer),longitud=directorio.reduce((s,x)=>s+x.length,0);
        f.setUint32(0,0x06054b50,true);f.setUint16(8,archivos.length,true);f.setUint16(10,archivos.length,true);f.setUint32(12,longitud,true);f.setUint32(16,offset,true);
        return new Blob([...partes,...directorio,fin],{type:'application/zip'});
    }
    async descargarImagenes() {
        const boton=document.getElementById('pixel-save');boton.disabled=true;
        const nombre=`${this.cancion.id}_${this.ruta}`;
        const bases=this.bases.slice();
        try {
            const blobs=await Promise.all(bases.map(canvas=>new Promise(resolve=>canvas.toBlob(resolve,'image/png'))));
            const archivos=await Promise.all(blobs.map(async (blob,i)=>({nombre:`${nombre}_${this.canales[i].toUpperCase()}.png`,bytes:new Uint8Array(await blob.arrayBuffer())})));
            const url=URL.createObjectURL(this.crearZip(archivos)),enlace=document.createElement('a');
            enlace.href=url;enlace.download=`${nombre}_RGB_y_bandas.zip`;document.body.append(enlace);enlace.click();enlace.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);
        } catch (_) {this.estado('No se pudieron descargar las imágenes.',true);}
        finally {boton.disabled=false;}
    }
}
