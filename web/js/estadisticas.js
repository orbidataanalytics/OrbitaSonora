export function decodificar(base64){return Uint8Array.from(atob(base64),c=>c.charCodeAt(0));}
function percentil(orden,q){const i=(orden.length-1)*q,a=Math.floor(i),b=Math.min(orden.length-1,a+1);return orden[a]+(orden[b]-orden[a])*(i-a);}
function resumen(valores){const orden=valores.slice().sort((a,b)=>a-b),media=valores.reduce((a,b)=>a+b,0)/valores.length;return {minimo:orden[0],maximo:orden.at(-1),media,mediana:percentil(orden,.5),desviacion_poblacional:Math.sqrt(valores.reduce((s,v)=>s+(v-media)**2,0)/valores.length),p05:percentil(orden,.05),p95:percentil(orden,.95)};}
export function calcularInforme(cancion,niveles,marcas=[]){
    const rgb=decodificar(cancion.rgb_base64),activos=decodificar(cancion.activos_base64),n=cancion.pixeles;
    const valores=Array.from({length:n},(_,i)=>Array.from(rgb.slice(i*3,i*3+3)));
    const conteos=new Map(),primeros=new Map();let total=0;
    for(let i=0;i<n;i++)if(activos[i]){const firma=valores[i].map(v=>Math.min(niveles-1,Math.floor(v*niveles/256))),key=firma.join(',');conteos.set(key,(conteos.get(key)||0)+1);if(!primeros.has(key))primeros.set(key,i);total++;}
    const firmas=[...conteos].map(([key,veces])=>({firma:key.split(',').map(Number),veces,primero:primeros.get(key),porcentaje:veces/total*100})).sort((a,b)=>b.veces-a.veces||a.firma[0]-b.firma[0]||a.firma[1]-b.firma[1]||a.firma[2]-b.firma[2]);
    const puntos=new Map(),agregar=(i,motivo)=>{if(!puntos.has(i))puntos.set(i,[]);puntos.get(i).push(motivo);};
    for(let b=0;b<3;b++){let mayor=0;for(let i=1;i<n;i++)if(valores[i][b]>valores[mayor][b])mayor=i;agregar(mayor,'Máximo '+ 'RGB'[b]);}
    let conjunto=0,cambio=1,valorCambio=-1;
    for(let i=1;i<n;i++){if(valores[i].reduce((a,b)=>a+b,0)>valores[conjunto].reduce((a,b)=>a+b,0))conjunto=i;const v=valores[i].reduce((s,x,b)=>s+(x-valores[i-1][b])**2,0);if(v>valorCambio){valorCambio=v;cambio=i;}}
    agregar(conjunto,'Máxima intensidad visual conjunta');agregar(cambio,'Mayor cambio de firma entre píxeles consecutivos');
    if(firmas.length)agregar(firmas[0].primero,'Primera aparición de la firma más frecuente');
    for(const m of marcas)if(m.indice>=0&&m.indice<n)agregar(m.indice,'Marca manual'+(m.nota?': '+m.nota:''));
    const estadisticas=Object.fromEntries([...'RGB'].map((ch,b)=>[ch,resumen(valores.map(v=>v[b]))]));
    const histogramas=Array.from({length:3},(_,b)=>{const h=Array(16).fill(0);valores.forEach(v=>h[Math.min(15,Math.floor(v[b]/16))]++);return h;});
    return {rgb,activos,valores,firmas,total,estadisticas,histogramas,puntos:[...puntos].sort((a,b)=>a[0]-b[0]).map(([indice,motivos])=>({indice,motivos}))};
}
