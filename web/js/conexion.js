const configurada=document.querySelector('meta[name="orbita-api-base"]')?.content || 'https://orbita-sonora.onrender.com';
export const API_BASE=(['localhost','127.0.0.1'].includes(location.hostname)||location.hostname.endsWith('.onrender.com'))?location.origin:configurada;
export async function leerDatos(nombre){
    const url=new URL(`../../datos/${nombre}.json`,import.meta.url);
    const respuesta=await fetch(url);
    if(!respuesta.ok)throw new Error(`No se pudo cargar ${nombre}.json (${respuesta.status})`);
    return respuesta.json();
}
