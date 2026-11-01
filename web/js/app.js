import {iniciarReproductor} from './reproductor.js';
import {leerDatos} from './conexion.js';
import {OrbitaPixel} from './imagenes.js';
import {Partituras} from './partituras.js';
import {Informes} from './informes.js';
import {RelojReproduccion} from './reloj.js';

iniciarReproductor();
try {
    const [pixeles,notas]=await Promise.all([leerDatos('pixeles'),leerDatos('partituras')]);
    for(const c of pixeles.canciones)if(notas.canciones[c.id]?.sha256_audio!==c.sha256_audio)throw new Error('El análisis y las partituras no corresponden al mismo audio.');
    const imagenes=new OrbitaPixel(pixeles);
    const partituras=new Partituras(notas,imagenes);
    const informes=new Informes(imagenes,notas);
    const reloj=new RelojReproduccion(pixeles);
    // Punto único de integración para futuras ampliaciones, sin reproductores adicionales.
    window.orbitaSonora={imagenes,partituras,informes,reloj};
} catch(error) {
    const estado=document.getElementById('pixel-state');estado.textContent='No se pudo iniciar el análisis: '+error.message;estado.classList.add('error');
}
