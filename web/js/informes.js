import {audio} from './reproductor.js';
import {escuchar} from './eventos.js';
import {calcularInforme} from './estadisticas.js';
import {coordenadasRecorrido} from './recorridos.js';
import {pentagrama,nombreNota,eventoEn,escapar,COLORES} from './notacion.js';

export class Informes {
    constructor(imagenes,partituras){
        this.imagenes=imagenes;this.partituras=partituras;this.marcas={};this.idMostrado=null;
        try{this.marcas=JSON.parse(localStorage.getItem('orbita-marcas-v1')||'{}');}catch(_){this.marcas={};}
        document.getElementById('report-mark').addEventListener('click',()=>this.marcar());
        document.getElementById('report-build').addEventListener('click',()=>this.preparar());
        escuchar('orbita:pixel',e=>{
            document.getElementById('report-current-pixel').textContent=`Píxel ${e.detail.indice+1}`;
            if(this.idMostrado!==e.detail.id){this.idMostrado=e.detail.id;this.pintarMarcas();}
        });
        this.pintarMarcas();
    }
    guardarMarcas(){try{localStorage.setItem('orbita-marcas-v1',JSON.stringify(this.marcas));}catch(_){/* Se conservan durante esta sesión. */}}
    marcar(){
        const id=this.imagenes.cancion.id,indice=this.imagenes.indice,nota=document.getElementById('report-mark-note').value.trim().slice(0,240);
        if(!this.marcas[id])this.marcas[id]=[];
        const existe=this.marcas[id].find(m=>m.indice===indice);
        if(existe)existe.nota=nota;else this.marcas[id].push({indice,nota});
        this.guardarMarcas();this.pintarMarcas();document.getElementById('report-mark-note').value='';
    }
    pintarMarcas(){
        const id=this.imagenes.cancion.id,lista=document.getElementById('report-marks');lista.replaceChildren();
        for(const marca of (this.marcas[id]||[]).slice().sort((a,b)=>a.indice-b.indice)){
            const boton=document.createElement('button');boton.type='button';boton.textContent=`Píxel ${marca.indice+1} ×`;boton.title=(marca.nota?marca.nota+'. ':'')+'Quitar esta marca';
            boton.addEventListener('click',()=>{this.marcas[id]=this.marcas[id].filter(m=>m.indice!==marca.indice);this.guardarMarcas();this.pintarMarcas();});lista.append(boton);
        }
        const cantidad=(this.marcas[id]||[]).length;
        document.getElementById('report-mark-count').textContent=`${cantidad} ${cantidad===1?'marca manual':'marcas manuales'} en esta pista`;
    }
    semaforo(veces,min,max){const t=max===min?1:Math.max(0,Math.min(1,(veces-min)/(max-min)));const a=t<.5?[25,190,110]:[250,214,75],b=t<.5?[250,214,75]:[245,77,78],f=t<.5?t*2:(t-.5)*2;return a.map((v,i)=>Math.round(v+(b[i]-v)*f));}
    imagen(c,datos,ruta,canal,puntos,calor=false){
        const canvas=document.createElement('canvas');canvas.width=canvas.height=c.lado;
        const ctx=canvas.getContext('2d'),img=ctx.createImageData(c.lado,c.lado),coordenadas=coordenadasRecorrido(c.lado,ruta);
        const conteo=new Map(datos.firmas.map(f=>[f.firma.join(','),f.veces])),niveles=Number(document.getElementById('pixel-levels').value),min=datos.firmas.at(-1)?.veces||0,max=datos.firmas[0]?.veces||0;
        for(let i=0;i<c.pixeles;i++){
            const [x,y]=coordenadas[i],j=(y*c.lado+x)*4;let rgb=datos.valores[i];
            if(calor){const key=rgb.map(v=>Math.min(niveles-1,Math.floor(v*niveles/256))).join(',');rgb=datos.activos[i]?this.semaforo(conteo.get(key)||0,min,max):[0,0,0];}
            else if(canal!=='RGB')rgb=rgb.map((v,b)=>'RGB'[b]===canal?v:0);
            img.data.set([...rgb,255],j);
        }
        ctx.putImageData(img,0,0);
        const salida=document.createElement('canvas');salida.width=salida.height=512;const g=salida.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(canvas,0,0,512,512);
        if(!calor)puntos.forEach((p,j)=>{const [x,y]=coordenadas[p.indice],px=(x+.5)*512/c.lado,py=(y+.5)*512/c.lado,cx=Math.max(10,Math.min(502,px)),cy=Math.max(10,Math.min(502,py));g.strokeStyle='#fff';g.lineWidth=2;g.beginPath();g.moveTo(px,py);g.lineTo(cx,cy);g.stroke();g.fillStyle='#fff';g.beginPath();g.arc(cx,cy,9,0,Math.PI*2);g.fill();g.strokeStyle='#111';g.lineWidth=1.2;g.stroke();g.fillStyle='#111';g.font='bold 11px Arial';g.textAlign='center';g.textBaseline='middle';g.fillText(String(j+1),cx,cy);});
        return salida.toDataURL('image/png');
    }
    histograma(h){
        const max=Math.max(...h.flat()),colores=Object.values(COLORES);let s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 185" role="img" aria-label="Histogramas de intensidad RGB"><rect width="680" height="185" fill="white"/>';
        for(let n=0;n<4;n++){const v=max*n/3,y=141-n*105/3;s+=`<line x1="43" x2="661" y1="${y}" y2="${y}" stroke="#d9e0e9"/><text x="38" y="${y+4}" text-anchor="end" font-size="10">${Math.round(v)}</text>`;}
        for(let i=0;i<16;i++)for(let b=0;b<3;b++){const x=46+i*38+b*10,y=141-h[b][i]/max*105;s+=`<rect x="${x}" y="${y}" width="9" height="${141-y}" fill="${colores[b]}"/>`;}
        for(let i=0;i<=4;i++)s+=`<text x="${46+i*152}" y="159" font-size="11">${Math.round(i*255/4)}</text>`;
        return s+'<text x="240" y="180" font-size="11">Intensidad visual 0–255 · R / G / B</text></svg>';
    }
    curvas(firmas,niveles){
        const min=firmas.at(-1)?.veces||0,max=firmas[0]?.veces||0;
        let svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 200" role="img" aria-label="Firmas más frecuentes"><rect width="680" height="200" fill="white"/>';
        for(let n=0;n<=100;n+=25){const y=150-n;svg+=`<line x1="55" x2="650" y1="${y}" y2="${y}" stroke="#d7e0eb"/><text x="43" y="${y+4}" text-anchor="end" font-size="11">${n}</text>`;}
        for(const firma of firmas.slice(0,6).reverse()){const p=firma.firma.map((v,i)=>`${90+i*260},${150-(v+.5)/niveles*100}`),color=`rgb(${this.semaforo(firma.veces,min,max)})`;svg+=`<polyline points="${p.join(' ')}" fill="none" stroke="${color}" stroke-width="${firma.veces===max?3:1.5}"/>`;}
        return svg+['R · bajos','G · medios','B · altos'].map((t,i)=>`<text x="${90+i*260}" y="180" text-anchor="middle" font-size="12">${t}</text>`).join('')+'</svg>';
    }
    tabla(headers,filas){return `<table><thead><tr>${headers.map(v=>`<th>${escapar(v)}</th>`).join('')}</tr></thead><tbody>${filas.map(f=>`<tr>${f.map(v=>`<td>${escapar(v)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;}
    paginas(c,ruta,niveles,completas){
        const d=calcularInforme(c,niveles,this.marcas[c.id]||[]),p=this.partituras.canciones[c.id],coords=coordenadasRecorrido(c.lado,ruta),fecha=new Date().toLocaleString('es-CO');
        const encabezado=`<p class="report-meta">ÓRBITA SONORA · ORBIDATA · ${escapar(c.titulo)} · ${escapar(fecha)}</p>`;
        let salida=`<article class="report-page">${encabezado}<h1>Informe de imagen y sonido</h1><h2>${escapar(c.titulo)}</h2><p>${c.duracion_s.toFixed(3)} s · ${c.lado} × ${c.lado} píxeles · recorrido ${escapar(ruta)} · ${niveles} niveles por banda</p><p class="report-meta">Audio ${escapar(c.archivo_audio)}<br>SHA-256 ${escapar(c.sha256_audio)}</p><div class="report-grid">`;
        for(const canal of ['RGB','R','G','B'])salida+=`<figure><img alt="Imagen ${canal} con píxeles destacados" src="${this.imagen(c,d,ruta,canal,d.puntos)}"><figcaption>${canal==='RGB'?'Composición RGB':canal+' · '+c.bandas['RGB'.indexOf(canal)].min_hz+'–'+c.bandas['RGB'.indexOf(canal)].max_hz+' Hz'}</figcaption></figure>`;
        salida+=`</div><p class="report-caption">Las etiquetas numéricas localizan los puntos de la tabla de píxeles importantes. Las tres componentes usan exactamente la misma posición y el mismo intervalo de tiempo. Guardas excluidas 250–350 y 500–600 Hz.</p><p class="report-caption">Reloj común del reproductor original. Cada píxel representa ${(c.segundos_por_pixel*1000).toFixed(3)} ms de una estimación espectral suavizada.</p></article>`;
        salida+=`<article class="report-page">${encabezado}<h2>Estadísticas de intensidad</h2><p>${c.pixeles} intervalos · ${d.total} con energía · ${c.pixeles-d.total} excluidos por silencio · ${(d.total/c.pixeles*100).toFixed(2)} % activos.</p>`;
        salida+=this.tabla(['Banda','Mín.','Máx.','Media','Mediana','Desv.','P05','P95'],[...'RGB'].map(ch=>{const v=d.estadisticas[ch];return [ch,...['minimo','maximo','media','mediana','desviacion_poblacional','p05','p95'].map(k=>v[k].toFixed(2))];}));
        salida+='<p class="report-caption">Unidades visuales 0–255, en una escala común de 70 dB. La estadística incluye todos los píxeles; la ocupación de firmas excluye el silencio. Desviación estándar poblacional.</p>'+this.histograma(d.histogramas);
        salida+='<h2>Píxeles importantes</h2>';
        salida+=this.tabla(['ID','Píxel · col./fila','Intervalo s','R G B','Motivo'],d.puntos.map((v,j)=>{const [x,y]=coords[v.indice];return [j+1,`${v.indice+1} · ${x+1}/${y+1}`,`${(v.indice*c.segundos_por_pixel).toFixed(3)}–${((v.indice+1)*c.segundos_por_pixel).toFixed(3)}`,d.valores[v.indice].join(' '),v.motivos.join('; ')];}));
        salida+='<p class="report-caption">Criterios automáticos: máximos de R/G/B, máximo de la media visual conjunta, mayor cambio RGB consecutivo y primera aparición del grupo más frecuente. Las marcas manuales se identifican por separado.</p></article>';
        salida+=`<article class="report-page">${encabezado}<h2>Repetición y ocupación</h2><p>${d.firmas.length} firmas agrupadas. Ámbito: canción completa, sin filtro de selección. Agrupación: ${niveles} niveles por banda.</p><div class="report-heat-grid"><figure><img alt="Mapa de repetición" src="${this.imagen(c,d,ruta,'RGB',[],true)}"><div class="report-legend"></div><figcaption>Verde menos repetida · rojo más repetida. Negro silencio.</figcaption></figure><div>${this.curvas(d.firmas,niveles)}<p class="report-caption">Centros de las seis firmas más frecuentes; eje vertical de intensidad visual en porcentaje.</p></div></div>`;
        salida+=this.tabla(['Firma R G B','Intervalos','Ocupación activa','Tiempo acumulado s'],d.firmas.slice(0,12).map(f=>[f.firma.map(v=>(v+1)+'/'+niveles).join(' · '),f.veces,f.porcentaje.toFixed(2)+' %',(f.veces*c.segundos_por_pixel).toFixed(3)]));
        salida+='<h2>Resumen de las partituras</h2>';
        salida+=this.tabla(['Banda','Eventos con altura','Notas distintas','Con altura s','Sin altura s','Silencio s'],[...'RGB'].map(ch=>{const r=p.bandas[ch].resumen;return [ch,r.eventos_con_altura,r.notas_distintas,r.segundos_con_altura,r.segundos_sin_altura,r.segundos_silencio];}));
        salida+=`<p class="report-caption">La repetición cuenta intervalos de la misma firma cuantizada; no cuenta reproducciones. La partitura estima la componente dominante por banda, que puede ser un armónico. La cobertura de altura definida no es un porcentaje de exactitud musical.</p><h3>Método</h3><p class="report-caption">Intensidades: potencia integrada por banda, ventana Hann ${c.metodo.muestras_ventana} muestras, paso ${c.metodo.paso_muestras}, promedio de canales estéreo. Notas: Hann ${this.partituras.metodo.n_fft} muestras, paso ${this.partituras.metodo.hop}, picos interpolados y suavizado temporal. Las ventanas tienen resolución finita y pueden producir fuga espectral. El PNG no conserva la fase del audio.</p></article>`;
        if(completas){
            const tramo=12,total=Math.ceil(c.duracion_s/tramo);
            for(let j=0;j<total;j+=2){salida+=`<article class="report-page">${encabezado}<h2>Partituras espectrales completas</h2><p class="report-caption">Tiempo proporcional en segundos. Barras de duración; cruces sin altura definida; R en 8vb y B en 8va; nombres de altura sonora real. Sin compás ni tempo inferidos.</p>`;
                for(let k=j;k<Math.min(total,j+2);k++){const inicio=k*tramo,fin=Math.min(c.duracion_s,inicio+tramo);salida+=`<section class="report-score-system"><h3>${inicio.toFixed(1)}–${fin.toFixed(1)} segundos</h3>`;for(const canal of 'RGB')salida+=pentagrama(c,p,canal,inicio,fin,-1,true);salida+='</section>';}
                salida+='</article>';
            }
        }
        return salida;
    }
    async preparar(){
        const boton=document.getElementById('report-build');boton.disabled=true;audio.pause();
        try{
            const todas=document.getElementById('report-scope').value==='todas',completas=document.getElementById('report-full-scores').checked;
            const canciones=todas?[...this.imagenes.catalogo.values()]:[this.imagenes.cancion];
            const ruta=this.imagenes.ruta,niveles=Number(document.getElementById('pixel-levels').value);
            this.contenido=canciones.map(c=>this.paginas(c,ruta,niveles,completas)).join('');
            const zona=document.getElementById('print-report');zona.hidden=false;
            zona.innerHTML='<div class="report-controls"><strong>Informe preparado</strong><button id="report-print" type="button">Imprimir o guardar PDF</button><button id="report-html" type="button">Guardar informe HTML</button><button id="report-close" type="button">Cerrar informe</button></div>'+this.contenido;
            document.getElementById('report-print').addEventListener('click',()=>window.print());
            document.getElementById('report-html').addEventListener('click',()=>this.descargar());
            document.getElementById('report-close').addEventListener('click',()=>{zona.hidden=true;document.getElementById('report-build').focus();});
            zona.scrollIntoView({behavior:'smooth',block:'start'});
        }catch(error){this.imagenes.estado('No se pudo preparar el informe: '+error.message,true);}
        finally{boton.disabled=false;}
    }
    async descargar(){
        const respuesta=await fetch(new URL('../css/informes.css',import.meta.url));if(!respuesta.ok){this.imagenes.estado('No se pudo cargar el estilo de impresión.',true);return;}
        const css=await respuesta.text();
        const html='<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Informe Órbita Sonora</title><style>'+css+'</style></head><body><main id="print-report"><div class="report-controls"><button onclick="window.print()">Imprimir o guardar PDF</button></div>'+this.contenido+'</main></body></html>';
        const url=URL.createObjectURL(new Blob([html],{type:'text/html;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='Orbita_Sonora_Informe.html';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);
    }
}
