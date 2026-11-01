// Bus común: ningún panel crea su propio reloj de reproducción.
const bus=new EventTarget();
export function emitir(nombre,detalle){bus.dispatchEvent(new CustomEvent(nombre,{detail:detalle}));}
export function escuchar(nombre,funcion){bus.addEventListener(nombre,funcion);return ()=>bus.removeEventListener(nombre,funcion);}
