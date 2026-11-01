export const COLORES={R:'#e94b65',G:'#268e55',B:'#3e78d3'};
export const escapar=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function nombreNota(midi){if(midi===-2)return 'Silencio';if(midi===-1)return 'Sin altura definida';return ['Do','Do♯','Re','Re♯','Mi','Fa','Fa♯','Sol','Sol♯','La','La♯','Si'][midi%12]+(Math.floor(midi/12)-1);}
export function eventoEn(eventos,indice){let a=0,b=eventos.length;while(a<b){const m=(a+b)>>1;if(eventos[m][0]<=indice)a=m+1;else b=m;}return Math.max(0,a-1);}
function diatonica(midi){return (Math.floor(midi/12)-1)*7+[0,0,1,1,2,3,3,4,4,5,5,6][midi%12];}
function altura(midi,clave,canal){let escrito=midi+(canal==='R'?12:canal==='B'?-12:0),octavas=0;const base=clave==='fa'?18:30;let y=116-(diatonica(escrito)-base)*4;while(y<38){escrito-=12;octavas++;y=116-(diatonica(escrito)-base)*4;}while(y>154){escrito+=12;octavas--;y=116-(diatonica(escrito)-base)*4;}return {y,octavas,sostenido:[1,3,6,8,10].includes(escrito%12)};}
export function pentagrama(cancion,partitura,canal,t0,t1,indice=-1,impreso=false){
    const banda=partitura.bandas[canal],color=COLORES[canal],dt=cancion.segundos_por_pixel;
    const X=t=>88+(t-t0)/(t1-t0)*888;
    const piezas=[`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 200" class="score-svg" data-canal="${canal}" role="img" aria-label="Partitura espectral ${canal}, de ${t0.toFixed(2)} a ${t1.toFixed(2)} segundos"><rect width="1000" height="200" rx="8" fill="${impreso?'#fff':'#0a1625'}"/><text x="18" y="24" fill="${color}" font-family="sans-serif" font-size="19" font-weight="bold">${canal} · ${banda.min_hz}–${banda.max_hz.toLocaleString('es-CO')} Hz${canal==='R'?' · 8vb':canal==='B'?' · 8va':''}</text>`];
    for(let j=0;j<5;j++)piezas.push(`<line x1="78" y1="${84+j*8}" x2="979" y2="${84+j*8}" stroke="${impreso?'#777':'#71849d'}" stroke-width="1"/>`);
    piezas.push(`<text x="17" y="113" font-family="'Noto Music','Segoe UI Symbol',serif" font-size="46" fill="${impreso?'#222':'#dce7f5'}">${banda.clave==='fa'?'𝄢':'𝄞'}</text><text x="17" y="141" font-size="11" fill="${impreso?'#555':'#aabbd0'}">${banda.clave==='fa'?'Fa · 8vb':canal==='B'?'Sol · 8va':'Sol'}</text>`);
    const ticks=4;for(let i=0;i<=ticks;i++){const t=t0+(t1-t0)*i/ticks,x=X(t);piezas.push(`<line x1="${x}" x2="${x}" y1="45" y2="154" stroke="${impreso?'#ddd':'#21354a'}" stroke-dasharray="2 5"/><text x="${x}" y="190" text-anchor="middle" font-size="14" font-family="sans-serif" fill="${impreso?'#444':'#b6c6da'}">${t.toFixed(1)} s</text>`);}
    const eventos=banda.eventos;
    for(let k=eventoEn(eventos,Math.floor(t0/dt));k<eventos.length;k++){
        const e=eventos[k],inicio=e[0]*dt,fin=e[1]*dt;if(inicio>=t1)break;if(fin<=t0)continue;
        const x=Math.max(89,X(inicio)),xe=Math.min(976,X(fin)),ancho=Math.max(1,xe-x),activo=indice>=e[0]&&indice<e[1];
        const tooltip=`${nombreNota(e[2])}${e[3]!==null?' · '+e[3].toFixed(2)+' Hz':''} · ${inicio.toFixed(3)}–${fin.toFixed(3)} s`;
        piezas.push(`<g class="score-event${activo?' score-active':''}" data-evento="${k}" data-inicio="${inicio}" data-fin="${fin}"><title>${escapar(tooltip)}</title>`);
        if(e[2]>=0){
            const a=altura(e[2],banda.clave,canal),nx=x+Math.min(6,ancho/2);
            piezas.push(`<rect class="score-duration" x="${x}" y="${a.y-4}" width="${ancho}" height="8" fill="${color}" opacity=".25"/>`);
            if(ancho>=4){
                for(let yy=76;yy>=a.y-1;yy-=8)piezas.push(`<line x1="${nx-9}" x2="${nx+9}" y1="${yy}" y2="${yy}" stroke="${impreso?'#333':'#b2c6dd'}"/>`);
                for(let yy=124;yy<=a.y+1;yy+=8)piezas.push(`<line x1="${nx-9}" x2="${nx+9}" y1="${yy}" y2="${yy}" stroke="${impreso?'#333':'#b2c6dd'}"/>`);
                if(a.sostenido)piezas.push(`<text x="${nx-15}" y="${a.y+5}" fill="${color}" font-size="16">♯</text>`);
                piezas.push(`<ellipse class="score-note" cx="${nx}" cy="${a.y}" rx="6" ry="4" transform="rotate(-20 ${nx} ${a.y})" fill="${color}"/><line x1="${nx+5}" x2="${nx+5}" y1="${a.y}" y2="${a.y-23}" stroke="${color}" stroke-width="1.5"/>`);
                if(a.octavas&&ancho>20)piezas.push(`<text x="${nx}" y="${Math.max(40,a.y-29)}" fill="${color}" font-size="11">${a.octavas>0?'↑':'↓'}${Math.abs(a.octavas)}</text>`);
                if(ancho>55)piezas.push(`<text x="${x+2}" y="166" fill="${impreso?'#444':'#c4d3e5'}" font-size="12">${nombreNota(e[2])}</text>`);
            }
        }else if(e[2]===-1){
            piezas.push(`<rect x="${x}" y="96" width="${ancho}" height="7" fill="${impreso?'#aaa':'#60788f'}" opacity=".5"/>`);
            if(ancho>8)piezas.push(`<path d="M${x+1} 95 l9 9 m0 -9 l-9 9" stroke="${impreso?'#555':'#cbd5e1'}" stroke-width="2"/>`);
            if(ancho>100)piezas.push(`<text x="${x+4}" y="166" font-size="12" fill="${impreso?'#555':'#aabbce'}">Sin altura definida</text>`);
        }else if(ancho>10){piezas.push(`<rect x="${x+3}" y="96" width="10" height="4" fill="${impreso?'#444':'#aabbce'}"/>`);if(ancho>100)piezas.push(`<text x="${x+3}" y="166" font-size="12" fill="${impreso?'#555':'#aabbce'}">Silencio</text>`);}
        piezas.push('</g>');
    }
    if(!impreso)piezas.push('<line class="score-cursor" x1="88" x2="88" y1="34" y2="164" stroke="#ffcf68" stroke-width="2"/>');
    piezas.push('</svg>');return piezas.join('');
}
