/* ============================================================
   DISEÑO Y MARKETING · Regia by CM y Fraganza by CM
   Lo usan tienda.html y fraganza.html. Súbelo a GitHub junto a ellas.

   ─── EDITA SOLO ESTE BLOQUE ───
   Deja en blanco ('') lo que todavía no tengas: esa parte no se muestra.
   ============================================================ */
window.MARKETING = {
  whatsapp:         '3128556822',   // número de WhatsApp de las dos tiendas
  direccion:        'Centro Comercial Plaza Malambo, Malambo - Atlántico',
  instagramRegia:   'regiabycm',      // usuario sin @
  instagramFraganza:'fraganzabycm',
  tiktokRegia:      'regia.by.cm',
  tiktokFraganza:   'fraganzabycm',
  llaveNequi:       '0092801187',     // Llave Nequi Negocios (Bre-B)
  titularNequi:     'Regia By Cm · Maidet Hernandez',
  facebook:         '',   // URL completa de la página
  horario:          '',   // ej: 'Lun a Sáb 9:00 a.m. – 8:00 p.m. · Dom 10:00 a.m. – 2:00 p.m.'
  politicaCambios:  '',   // ej: 'Cambios de talla dentro de los 5 días siguientes a la compra, con la prenda sin uso y con etiquetas.'
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Centro+Comercial+Plaza+Malambo%2C+Malambo%2C+Atl%C3%A1ntico',

  // Medición para anuncios (pega aquí los códigos cuando los crees)
  metaPixelId:      '',   // Facebook / Instagram · ej: '123456789012345'
  tiktokPixelId:    '',   // ej: 'C1ABCDEFGHIJ'
  googleAnalyticsId:''    // ej: 'G-XXXXXXXXXX'
};
/* ─── FIN DE LO EDITABLE ─── */

(function(){
'use strict';
const M = window.MARKETING || {};
const TID = window.MK_TIENDA === 'fraganza' ? 'fraganza' : 'regia';
document.documentElement.dataset.mk = TID;

const TEXTOS = {
  regia: {
    marca: 'Regia by CM',
    instagram: M.instagramRegia,
    tiktok: M.tiktokRegia,
    palabra: ['prenda', 'prendas'],
    cruzado: 'Combínalo con',
    guiaTallas: true,
    waSaludo: 'Hola Regia by CM, vi la tienda en línea y quiero asesoría',
    otra: { url: 'fraganza.html', titulo: 'Fraganza by CM', texto: 'Perfumes en el mismo local. Tu bolsa de aquí queda guardada.', cta: 'Ver perfumes' },
    pie: 'Ropa deportiva para mujer, para entrenar y para el día a día.',
    cats: { 'basica':'Básicas', 'chaleco':'Chalecos', 'chaqueta':'Chaquetas', 'enterizo':'Enterizos', 'falda':'Faldas',
            'gorra':'Accesorios', 'termo':'Accesorios', 'media':'Accesorios', 'accesorio':'Accesorios',
            'leggin':'Leggins', 'legging':'Leggins', 'running':'Running', 'set':'Sets', 'set largo':'Sets', 'set corto':'Sets',
            'short':'Shorts', 'short corto':'Shorts', 'top':'Tops', 'vestido':'Vestidos' }
  },
  fraganza: {
    marca: 'Fraganza by CM',
    instagram: M.instagramFraganza,
    tiktok: M.tiktokFraganza,
    palabra: ['perfume', 'perfumes'],
    cruzado: 'También te puede gustar',
    guiaTallas: false,
    quitarPrefijo: /^perfumes?\s+/i,
    waSaludo: 'Hola Fraganza by CM, vi la tienda en línea y quiero asesoría para elegir un perfume',
    otra: { url: 'tienda.html', titulo: 'Regia by CM', texto: 'Ropa deportiva en el mismo local. Tu bolsa de aquí queda guardada.', cta: 'Ver ropa deportiva' },
    pie: 'Perfumes para ella y para él, con asesoría para encontrar tu aroma.',
    cats: { 'perfume':'Perfumes' }
  }
}[TID];

let CFG = {}, PRODS = [], minPub = 0;
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = n => '$' + Math.round(n || 0).toLocaleString('es-CO');
const stock = p => (p.variantes || []).reduce((s, v) => s + (v.stock || 0), 0);
const $ = id => document.getElementById(id);
const quieto = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- textos: nombres y categorías ordenados ---------- */
const MENORES = new Set(['de','del','y','e','con','a','al','en','la','el','las','los','por','para','sin','o','u']);
function titulo(s){
  return String(s || '').trim().replace(/\s+/g, ' ').toLowerCase().split(' ').map((w, i) => {
    if (!w) return w;
    if (/\d/.test(w)) return w;                       // 9am, x3, 100ml
    if (i > 0 && MENORES.has(w)) return w;
    return w.charAt(0).toUpperCase() + w.slice(1);
  }).join(' ').replace(/\+(\p{L})/gu, (m, c) => '+' + c.toUpperCase());
}
function nombre(n){
  let s = String(n || '');
  if (TEXTOS.quitarPrefijo){ const r = s.replace(TEXTOS.quitarPrefijo, ''); if (r.trim()) s = r; }
  return titulo(s);
}
const canon = c => String(c || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
const singular = k => k.split(' ').map(w => w.length > 3 ? w.replace(/s$/, '') : w).join(' ');
const catCache = {};
function catLabel(c){
  if (!c) return '';
  const k = canon(c), ks = singular(k);
  if (TEXTOS.cats[k]) return TEXTOS.cats[k];
  if (TEXTOS.cats[ks]) return TEXTOS.cats[ks];
  return catCache[ks] || (catCache[ks] = titulo(c));
}
function ordenCats(a, b){
  if (a === 'Accesorios') return 1; if (b === 'Accesorios') return -1;
  return a.localeCompare(b, 'es');
}
function palabra(n){ return n + ' ' + (n === 1 ? TEXTOS.palabra[0] : TEXTOS.palabra[1]); }

/* ---------- tallas y colores escritos de varias formas ---------- */
// "NEGRO", "Negro" y "negro" se muestran como un solo color; "Xl" y "XL" como una sola talla.
function tallaCanon(t){
  const x = String(t == null ? '' : t).trim();
  if (!x || /^(unic[ao]|única|único|unica|unico)$/i.test(x)) return 'Única';
  return x.length <= 4 ? x.toUpperCase() : titulo(x);
}
function colorCanon(c){
  const x = String(c == null ? '' : c).trim().replace(/\s+/g, ' ');
  if (!x || /^(unic[ao]|único|única)$/i.test(x)) return 'Único';
  const l = x.toLowerCase();
  return l.charAt(0).toUpperCase() + l.slice(1);
}
function normalizar(lista){
  (lista || []).forEach(p => {
    (p.variantes || []).forEach(v => { v.talla = tallaCanon(v.talla); v.color = colorCanon(v.color); });
    if (p.fotosColor){ const fc = {}; Object.keys(p.fotosColor).forEach(k => { const c = colorCanon(k); if (!fc[c]) fc[c] = p.fotosColor[k]; }); p.fotosColor = fc; }
  });
  return lista;
}

/* ---------- etiquetas de las tarjetas ---------- */
// "Nuevo": solo lo que se publicó después de la carga inicial y en los últimos 21 días.
function esNuevo(p){
  const t = p.publicadoEn || 0;
  return t > minPub + 86400000 && Date.now() - t < 21 * 86400000;
}
function etiqueta(p){
  if (stock(p) <= 0) return '<span class="tag">Agotado</span>';
  if (p.etiqueta) return `<span class="tag mk-tag">${esc(p.etiqueta)}</span>`;
  if (esNuevo(p)) return '<span class="tag mk-tag">Nuevo</span>';
  return '';
}
function setProds(lista){
  PRODS = lista || [];
  const ts = PRODS.map(p => p.publicadoEn || 0).filter(Boolean);
  minPub = ts.length ? Math.min(...ts) : 0;
}

/* ---------- WhatsApp ---------- */
function waLink(texto){
  const n = String(CFG.whatsapp || '').replace(/\D/g, '');
  return n ? 'https://wa.me/' + n + '?text=' + encodeURIComponent(texto) : '';
}

/* ---------- iconos ---------- */
const IC = {
  envio: '<path d="M3 7h11v9H3z"/><path d="M14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.6"/><circle cx="17" cy="17.5" r="1.6"/>',
  tienda: '<path d="M4 9l1.5-5h13L20 9"/><path d="M4 9h16v11H4z"/><path d="M9 20v-6h6v6"/>',
  cuotas: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h4"/>',
  chat: '<path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.1A8 8 0 1 1 20 12z"/>',
  regla: '<path d="M3 15.5 15.5 3 21 8.5 8.5 21z"/><path d="m7 12 2 2M10 9l2 2M13 6l2 2"/>',
  cambio: '<path d="M4 9h13l-3.5-3.5M20 15H7l3.5 3.5"/>'
};
const IG_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="17.3" cy="6.7" r="1.2" fill="currentColor"/></svg>';
const TT_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M16.6 3c.3 2.2 1.6 3.7 3.9 3.9v3a7.3 7.3 0 0 1-3.9-1.2v6.1a5.8 5.8 0 1 1-5.8-5.8c.3 0 .6 0 .9.1v3.1a2.8 2.8 0 1 0 2 2.7V3h2.9z"/></svg>';
const ico = k => `<svg viewBox="0 0 24 24" aria-hidden="true">${IC[k]}</svg>`;
const WA_SVG = '<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3zm0 23.7c-2 0-4-.5-5.7-1.6l-.4-.2-3.9 1 1-3.8-.3-.4A10.7 10.7 0 1 1 16 26.7zm5.9-8c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2l-1 1.2c-.2.2-.4.2-.7.1a8.8 8.8 0 0 1-4.4-3.8c-.3-.6.3-.5 1-1.7.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4s-1.2 1.1-1.2 2.8 1.2 3.2 1.4 3.5c.2.2 2.3 3.6 5.7 5 2.1.9 2.9 1 4 .8.6-.1 1.9-.8 2.2-1.5.3-.8.3-1.4.2-1.5l-.6-.3z"/></svg>';

/* ---------- diseño minimalista (se aplica encima del estilo de cada página) ---------- */
const CSS = `
:root{--line:#ECE9F1;--wash:#F6F4F8;--r:6px;}
:root[data-mk="fraganza"]{--line:#EFE7DC;--wash:#F8F4EE;}
body{background:#fff;font-size:14.5px;}
:focus-visible{outline:2px solid var(--ink);outline-offset:2px;}

/* barra de avisos */
.aviso{background:var(--wash);color:var(--ink);font-size:12.5px;padding:8px 16px;min-height:34px;display:flex;align-items:center;justify-content:center;}
.aviso[hidden]{display:none;}
.aviso span{transition:opacity .35s ease;}
.aviso span.fuera{opacity:0;}

/* cabecera */
header.top{background:rgba(255,255,255,.97);border-bottom:1px solid var(--line);}
.top-in{padding:8px 16px;gap:14px;}
.brand img{height:42px;}
:root[data-mk="fraganza"] .brand img{height:48px;}
.search input{background:transparent;border:0;border-bottom:1px solid var(--line);border-radius:0;padding:10px 4px 10px 28px;font-size:14px;}
.search input:focus{outline:none;border-bottom-color:var(--ink);}
.search svg{left:2px;}
.bag{background:transparent;width:42px;height:42px;}
.bag svg{stroke:var(--ink);width:23px;height:23px;}
.bag .n{background:var(--ink);color:#fff;border:2px solid #fff;top:2px;right:0;min-width:18px;height:18px;font-size:10px;}
@media(max-width:620px){ .brand img{height:36px;} :root[data-mk="fraganza"] .brand img{height:42px;} }

/* categorías como pestañas */
.cats{gap:22px;padding:2px 16px 0;}
.chip{border:0;background:none;border-radius:0;padding:10px 0 11px;font-size:13.5px;font-weight:400;color:var(--soft);border-bottom:2px solid transparent;}
.chip:hover{color:var(--ink);border-color:transparent;}
.chip[aria-pressed="true"]{background:none;color:var(--ink);font-weight:500;border-bottom-color:var(--ink);}

/* portada */
main{scroll-margin-top:110px;}
.mk-hero{max-width:1180px;margin:0 auto;padding:30px 16px 8px;}
.mk-hero[hidden]{display:none;}
.mk-hero h1{font-family:'Jost',sans-serif;font-weight:300;font-size:clamp(32px,8.6vw,58px);line-height:1.04;letter-spacing:-.02em;max-width:15ch;margin:0;text-wrap:balance;}
:root[data-mk="fraganza"] .mk-hero h1{font-family:'Cormorant Garamond',serif;font-weight:500;letter-spacing:-.01em;font-size:clamp(36px,10vw,66px);line-height:1;}
.mk-sub{color:var(--soft);font-size:15px;line-height:1.5;margin:12px 0 0;max-width:38ch;}
.mk-trend{margin-top:30px;}
.mk-trend[hidden]{display:none;}
.mk-trend-h{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-bottom:12px;}
.mk-trend-h h2{font-family:'Jost',sans-serif;font-weight:500;font-size:19px;letter-spacing:0;}
:root[data-mk="fraganza"] .mk-trend-h h2{font-family:'Cormorant Garamond',serif;font-weight:600;font-size:24px;}
.mk-trend-h a{font-size:13.5px;color:var(--ink);text-underline-offset:4px;}
.mk-rail{display:flex;gap:10px;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;margin:0 -16px;padding:0 16px 4px;scroll-padding:0 16px;}
.mk-rail::-webkit-scrollbar{display:none;}
.mk-tc{flex:0 0 42%;scroll-snap-align:start;border:0;background:none;padding:0;text-align:left;color:var(--ink);display:flex;flex-direction:column;justify-content:flex-start;align-self:flex-start;}
.mk-tc:first-child{flex-basis:70%;}
.mk-tc .im{aspect-ratio:3/4;background:var(--wash);border-radius:var(--r);overflow:hidden;}
.mk-tc:first-child .im{aspect-ratio:4/5;}
.mk-tc img{width:100%;height:100%;object-fit:cover;}
.mk-tc .nm2{display:block;font-size:13.5px;margin-top:8px;line-height:1.3;}
.mk-tc .pr2{display:block;font-family:'Jost',sans-serif;font-size:14.5px;font-weight:500;margin-top:1px;}
.mk-tc:first-child .nm2{font-size:15px;}
@media(min-width:760px){
  .mk-hero{padding-top:44px;}
  .mk-rail{margin:0;padding:0;gap:14px;}
  .mk-tc{flex-basis:calc(30% - 10px);}
  .mk-tc:first-child{flex-basis:calc(40% - 10px);}
}
@media(min-width:1000px){
  .mk-hero:has(.mk-trend:not([hidden])){display:grid;grid-template-columns:minmax(300px,1fr) 2.3fr;gap:56px;align-items:end;}
  .mk-hero:has(.mk-trend:not([hidden])) .mk-trend{margin-top:0;min-width:0;}
  .mk-hero h1{font-size:clamp(36px,3.5vw,48px);}
  :root[data-mk="fraganza"] .mk-hero h1{font-size:clamp(46px,5vw,64px);}
}

/* portada: pagos y redes */
.mk-inicio{display:grid;gap:12px;margin-top:30px;grid-template-columns:1fr;}
@media(min-width:760px){.mk-inicio{grid-template-columns:1fr 1fr;gap:16px;}}
@media(min-width:1000px){.mk-hero:has(.mk-trend:not([hidden])) .mk-inicio{grid-column:1 / -1;margin-top:8px;}}
.mk-blk{border:1px solid var(--line);border-radius:12px;padding:18px 18px 16px;background:#fff;}
.mk-blk h2{font-family:'Jost',sans-serif;font-weight:500;font-size:17px;margin:0;}
:root[data-mk="fraganza"] .mk-blk h2{font-family:'Cormorant Garamond',serif;font-weight:600;font-size:22px;}
.mk-blk p{font-size:13.5px;color:var(--soft);margin:6px 0 0;line-height:1.5;}
.mk-logos{display:flex;flex-wrap:wrap;align-items:center;gap:10px 18px;margin:14px 0 4px;}
.mk-logos img{height:24px;width:auto;}
.mk-logos img[alt="Sistecrédito"]{height:19px;}
.mk-qr-btn{margin-top:14px;font-size:13.5px;padding:10px 14px;}
.mk-cuentas{display:grid;gap:8px;margin-top:12px;grid-template-columns:1fr 1fr;}
.mk-cuenta{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--line);border-radius:10px;text-decoration:none;color:var(--ink);min-width:0;}
.mk-cuenta svg{width:22px;height:22px;flex-shrink:0;}
.mk-cuenta span{min-width:0;}
.mk-cuenta b{display:block;font-size:13.5px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.mk-cuenta small{display:block;font-size:11.5px;color:var(--soft);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.mk-cuenta.otra{background:var(--wash);border-color:transparent;}
@media(max-width:520px){.mk-cuentas{grid-template-columns:1fr;}}
/* QR de pago */
.mk-qr-in{text-align:center;}
.mk-qr-in p{margin:6px 0 12px;}
.mk-qr-img{width:min(300px,100%);border-radius:12px;display:block;margin:0 auto 12px;}
.mk-llave{display:flex;align-items:center;justify-content:space-between;gap:10px;background:var(--wash);border-radius:10px;padding:10px 12px;text-align:left;}
.mk-llave small{display:block;font-size:11.5px;color:var(--soft);}
.mk-llave b{font-size:18px;letter-spacing:.04em;font-weight:600;}
.mk-llave .btn,.done .mk-llave .btn{padding:8px 12px;font-size:13px;flex-shrink:0;width:auto;margin-top:0;}
.mk-qr-in .mk-ask{margin-top:12px;}
.mk-pago-listo{background:var(--wash);border-radius:14px;padding:14px;margin:14px 0;text-align:center;}
.mk-pago-listo > b{display:block;font-size:14px;margin-bottom:8px;}
.mk-pago-listo img{width:min(240px,100%);border-radius:10px;display:block;margin:0 auto 10px;}
.mk-pago-listo .mk-llave{background:#fff;}
.mk-pago-listo > small{display:block;font-size:12px;color:var(--soft);margin-top:8px;}

/* catálogo */
main{padding-top:6px;}
.count{font-size:13px;margin:26px 0 14px;color:var(--soft);}
.count:has(.mk-cnt-t){display:flex;align-items:baseline;justify-content:space-between;margin-top:40px;border-top:1px solid var(--line);padding-top:22px;}
.mk-cnt-t{font-family:'Jost',sans-serif;font-size:19px;font-weight:500;color:var(--ink);}
.mk-hero[hidden] ~ main .count:has(.mk-cnt-t){margin-top:18px;border-top:0;padding-top:0;}
:root[data-mk="fraganza"] .mk-cnt-t{font-family:'Cormorant Garamond',serif;font-weight:600;font-size:24px;}
.grid{gap:30px 10px;}
@media(min-width:760px){.grid{gap:40px 18px;}}
.ph{border-radius:var(--r);}
@media(hover:hover){.card:hover .ph img{transform:scale(1.025);}}
.card .nm{font-size:13.5px;font-weight:400;margin-top:9px;color:var(--ink);}
.card .pr{font-family:'Jost',sans-serif;font-size:15px;font-weight:500;margin-top:1px;}
.card .sz,.card .cl{font-size:12px;}
.tag{left:8px;top:8px;border-radius:4px;font-size:11.5px;font-weight:500;padding:3px 8px;background:#fff;color:var(--ink);}
.tag.mk-tag{background:#fff;color:var(--ink);}
.agotado .tag{background:var(--ink);color:#fff;}

/* botones */
.btn{border-radius:10px;font-weight:500;}
.btn.pri{background:var(--ink);box-shadow:none;}
.btn.pri:hover:not(:disabled){filter:none;opacity:.88;}
.btn.ghost{border:1px solid var(--line);}
.btn.dark{background:var(--ink);}

/* ficha de producto */
.sheet-prod{border-radius:18px 18px 0 0;}
@media(min-width:860px){.sheet-prod{border-radius:16px;}}
.sh-close{box-shadow:none;border:1px solid var(--line);background:#fff;}
.info h2{font-family:'Jost',sans-serif;font-weight:400;font-size:25px;letter-spacing:-.01em;}
:root[data-mk="fraganza"] .info h2{font-family:'Cormorant Garamond',serif;font-weight:600;font-size:30px;}
.info .precio{font-family:'Jost',sans-serif;font-size:19px;font-weight:500;}
.opt{border-radius:8px;border-width:1px;font-weight:400;}
.opt[aria-pressed="true"]{font-weight:500;}
.gal-th button{border-radius:4px;}
.gal-th button[aria-current="true"]{border-color:var(--ink);}
.stock-note.ultimas{color:var(--ink);}
.mk-guia{border:0;background:none;padding:0;margin-left:10px;font-size:13px;font-weight:400;color:var(--ink);text-decoration:underline;text-underline-offset:3px;display:inline-flex;align-items:center;gap:5px;}
.mk-guia svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:1.5;}
.mk-ask{color:var(--ink);display:flex;align-items:center;justify-content:center;gap:8px;width:100%;margin-top:10px;text-decoration:none;font-size:14px;}
.mk-ask svg{width:18px;height:18px;color:#1FAF55;}
.btn.wa.mk-ask{color:#fff;}
.btn.wa.mk-ask svg{color:#fff;}
.mk-info{list-style:none;padding:16px 0 0;margin:18px 0 0;border-top:1px solid var(--line);display:grid;gap:10px;}
.mk-info li{display:flex;gap:10px;align-items:flex-start;font-size:13.5px;color:var(--soft);}
.mk-info b{color:var(--ink);font-weight:500;}
.mk-info svg{width:18px;height:18px;fill:none;stroke:var(--ink);stroke-width:1.4;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0;margin-top:1px;}
.mk-xs{margin-top:26px;}
.mk-xs h3{font-family:'Jost',sans-serif;font-weight:500;font-size:16px;margin-bottom:10px;}
:root[data-mk="fraganza"] .mk-xs h3{font-family:'Cormorant Garamond',serif;font-weight:600;font-size:21px;}
.mk-xs-row{display:flex;gap:10px;overflow-x:auto;scrollbar-width:none;padding-bottom:4px;}
.mk-xs-row::-webkit-scrollbar{display:none;}
.mk-xs-it{flex:0 0 112px;border:0;background:none;padding:0;text-align:left;color:var(--ink);display:flex;flex-direction:column;justify-content:flex-start;align-self:flex-start;}
.mk-xs-it .im{aspect-ratio:3/4;border-radius:var(--r);overflow:hidden;background:var(--wash);}
.mk-xs-it img{width:100%;height:100%;object-fit:cover;}
.mk-xs-it span{display:block;font-size:12.5px;margin-top:6px;line-height:1.25;}
.mk-xs-it strong{display:block;font-family:'Jost',sans-serif;font-weight:500;font-size:13.5px;}

/* bolsa y confirmación */
.ln .im{border-radius:4px;}
.done .ck{background:var(--ink);}
.bag-h h2{font-family:'Jost',sans-serif;font-weight:400;}
.mk-otra{display:block;margin-top:20px;padding:14px 0 0;border-top:1px solid var(--line);text-decoration:none;color:var(--ink);}
.mk-otra b{display:block;font-size:14px;font-weight:500;}
.mk-otra small{display:block;color:var(--soft);font-size:12.5px;margin:2px 0 6px;}
.mk-otra span{font-size:13.5px;text-decoration:underline;text-underline-offset:3px;}

/* WhatsApp flotante */
.mk-wa{position:fixed;right:16px;bottom:calc(18px + env(safe-area-inset-bottom));z-index:30;width:52px;height:52px;border-radius:50%;background:#1FAF55;color:#fff;display:grid;place-items:center;box-shadow:0 6px 18px -6px rgba(0,0,0,.35);text-decoration:none;}
.mk-wa:active{transform:scale(.95);}
.mk-wa svg{width:28px;height:28px;}
.mk-wa[hidden],body.lock .mk-wa{display:none;}

/* guía de tallas */
.mk-modal{position:fixed;inset:0;z-index:70;background:rgba(20,18,24,.45);display:none;align-items:flex-end;justify-content:center;}
.mk-modal.on{display:flex;}
.mk-modal-in{background:#fff;width:min(520px,100%);max-height:88dvh;overflow:auto;border-radius:18px 18px 0 0;padding:24px 20px calc(22px + env(safe-area-inset-bottom));position:relative;}
@media(min-width:620px){.mk-modal{align-items:center;}.mk-modal-in{border-radius:16px;}}
.mk-modal h3{font-family:'Jost',sans-serif;font-weight:400;font-size:24px;}
.mk-modal p{font-size:13.5px;color:var(--soft);margin:8px 0 14px;}
.mk-modal table{width:100%;border-collapse:collapse;font-size:14px;}
.mk-modal th,.mk-modal td{padding:11px 6px;text-align:center;border-bottom:1px solid var(--line);}
.mk-modal th{font-size:12.5px;color:var(--soft);font-weight:500;}
.mk-modal td:first-child{font-weight:600;}
.mk-modal .x{position:absolute;top:12px;right:12px;width:36px;height:36px;border-radius:50%;border:1px solid var(--line);background:#fff;font-size:20px;}

/* pie de página */
footer.mk-foot{text-align:left;padding:40px 16px calc(100px + env(safe-area-inset-bottom));background:#fff;border-top:1px solid var(--line);color:var(--ink);margin-top:20px;}
.mk-foot-in{max-width:1180px;margin:0 auto;display:grid;gap:30px;grid-template-columns:1fr;}
@media(min-width:760px){.mk-foot-in{grid-template-columns:1.3fr 1fr 1fr;}}
.mk-foot img{height:40px;margin:0 0 12px;}
.mk-foot h4{font-family:'Jost',sans-serif;font-size:15px;font-weight:500;margin:0 0 10px;}
.mk-foot p{margin:0 0 7px;font-size:14px;line-height:1.55;color:var(--soft);}
.mk-foot a{color:var(--ink);text-underline-offset:3px;}
.mk-redes{display:flex;gap:16px;flex-wrap:wrap;margin-top:12px;font-size:14px;}
.mk-copy{max-width:1180px;margin:30px auto 0;font-size:12.5px;color:var(--soft);}
.mk-foot .mk-otra{margin-top:16px;}
`;
function estilos(){ if ($('mk-css')) return; const s = document.createElement('style'); s.id = 'mk-css'; s.textContent = CSS; document.head.appendChild(s); }

/* ---------- portada: prendas en tendencia ---------- */
// Se eligen en el sistema (Tienda online → ☆ Tendencia). Si no hay ninguna marcada, se escogen solas.
let firmaTend = '';
function enTendencia(){
  const marcadas = PRODS.filter(p => p.tendencia > 0 && stock(p) > 0 && p.thumb).sort((a, b) => b.tendencia - a.tendencia);
  if (marcadas.length >= 2) return marcadas.slice(0, 8);
  const cand = PRODS.filter(p => p.thumb && stock(p) > 0 && !marcadas.includes(p))
    .sort((a, b) => (b.nFotos || 0) - (a.nFotos || 0) || (b.publicadoEn || 0) - (a.publicadoEn || 0) || (b.precio || 0) - (a.precio || 0));
  const vistas = new Set(), out = [...marcadas];
  cand.forEach(p => { const c = catLabel(p.categoria); if (out.length < 6 && !vistas.has(c)){ vistas.add(c); out.push(p); } });
  cand.forEach(p => { if (out.length < 6 && !out.includes(p)) out.push(p); });
  return out;
}
function pintarTendencia(){
  const box = $('mk-trend'), row = $('mk-rail'); if (!box || !row) return;
  const lista = enTendencia();
  const firma = lista.map(p => p.id + ':' + p.precio + ':' + (p.thumb || '').length).join('|');
  if (firma === firmaTend) return;
  firmaTend = firma;
  box.hidden = lista.length < 2;
  row.innerHTML = lista.map(p => `<button type="button" class="mk-tc" data-mk-open="${esc(p.id)}"><div class="im"><img src="${esc(p.thumb)}" alt="${esc(nombre(p.nombre))}"></div><span class="nm2">${esc(nombre(p.nombre))}</span><span class="pr2">${fmt(p.precio)}</span></button>`).join('');
}
function despuesRender(estado){
  const h = $('mk-hero');
  const inicio = estado.categoria === 'Todo' && !String(estado.texto || '').trim();
  if (h) h.hidden = !inicio;
  pintarTendencia();
  const cnt = $('count');
  if (cnt && inicio && cnt.textContent && !cnt.querySelector('.mk-cnt-t')) cnt.innerHTML = `<span class="mk-cnt-t">Toda la colección</span><span>${esc(cnt.textContent)}</span>`;
  const txt = String(estado.texto || '').trim();
  if (cnt && !txt && estado.categoria !== 'Todo' && cnt.textContent && !cnt.querySelector('.mk-cnt-t')) cnt.innerHTML = `<span class="mk-cnt-t">${esc(estado.categoria)}</span><span>${esc(cnt.textContent)}</span>`;
  // al cambiar de categoría o de búsqueda, se ve de una el comienzo de lo elegido
  const clave = estado.categoria + '|' + txt;
  if (clave !== ultimaVista){
    const habia = ultimaVista !== null; ultimaVista = clave;
    if (habia){ if (inicio) window.scrollTo(0, 0); else irAResultados(); }
  }
  busqueda(txt);
}
let ultimaVista = null;
function irAResultados(){
  const main = $('main'); if (!main) return;
  const head = document.querySelector('header.top');
  const top = Math.max(0, main.getBoundingClientRect().top + window.scrollY - (head ? head.offsetHeight : 110) - 6);
  if (Math.abs(window.scrollY - top) > 4 && window.scrollY > top) window.scrollTo(0, top);
}

/* ---------- buscador: muestra la prenda de una ---------- */
// Al escribir se oculta la portada y se ven solo los resultados. Si queda una sola prenda, se abre sola
// (al hacer una pausa al escribir o al pulsar Enter).
let busqT = null, busqAbierta = '';
const tarjetas = () => [...document.querySelectorAll('#grid .card[data-id]')];
const hojaAbierta = () => { const sh = $('sheet-prod'); return sh && sh.classList.contains('on'); };
function abrirUnica(txt){
  const c = tarjetas();
  if (c.length !== 1 || hojaAbierta() || typeof window.abrirProducto !== 'function') return false;
  busqAbierta = txt;
  const q = $('q'); if (q) q.blur();
  window.abrirProducto(c[0].dataset.id);
  return true;
}
function busqueda(txt){
  clearTimeout(busqT);
  const cnt = $('count');
  if (!txt){ busqAbierta = ''; return; }
  const n = tarjetas().length;
  if (cnt && n) cnt.innerHTML = `<span class="mk-cnt-t">Resultados para “${esc(txt)}”</span><span>${esc(palabra(n))}</span>`;
  if (n === 1 && txt.length >= 3 && txt !== busqAbierta) busqT = setTimeout(() => {
    const q = $('q'); if (q && q.value.trim() === txt) abrirUnica(txt);
  }, 1100);
}
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter' || !e.target || e.target.id !== 'q') return;
  e.preventDefault();
  const txt = e.target.value.trim();
  if (!abrirUnica(txt)) e.target.blur();   // varias prendas: cierra el teclado para verlas
});

/* ---------- barra de avisos (rota: cuotas, envíos, recogida...) ---------- */
let avisoT = null;
function mensajesAviso(){
  const m = [];
  const md = (CFG.medios || []).map(x => x.id);
  if (CFG.aviso) m.push(CFG.aviso);
  if (md.includes('addi') || md.includes('sistecredito'))
    m.push('Paga a cuotas con ' + [md.includes('addi') ? 'Addi' : '', md.includes('sistecredito') ? 'Sistecrédito' : ''].filter(Boolean).join(' o '));
  if (M.llaveNequi) m.push('Paga con Nequi o Bre-B');
  if (CFG.envioActivo) m.push('Envíos a domicilio' + (CFG.tiempoEnvio ? ' en ' + CFG.tiempoEnvio : ''));
  if (CFG.retiroEnTienda) m.push('Recoge tu pedido en el Centro Comercial Plaza Malambo');
  if (md.includes('contraentrega')) m.push('También puedes pagar contra entrega');
  return m;
}
function barraAvisos(){
  const av = $('aviso'); if (!av) return;
  const m = mensajesAviso();
  clearInterval(avisoT);
  if (!m.length){ av.hidden = true; return; }
  av.hidden = false;
  let i = 0;
  av.innerHTML = `<span>${esc(m[0])}</span>`;
  if (m.length < 2 || quieto()) return;
  avisoT = setInterval(() => {
    const sp = av.querySelector('span'); if (!sp) return;
    sp.classList.add('fuera');
    setTimeout(() => { i = (i + 1) % m.length; sp.textContent = m[i]; sp.classList.remove('fuera'); }, 350);
  }, 4200);
}

/* ---------- portada: medios de pago y redes sociales ---------- */
const LOGOS_PAGO = [
  { id:'nequi', src:'pago-nequi.png', alt:'Nequi' },
  { id:'breb', src:'pago-breb.png', alt:'Bre-B' },
  { id:'addi', src:'pago-addi.png', alt:'Addi' },
  { id:'sistecredito', src:'pago-sistecredito.png', alt:'Sistecrédito' }
];
function cuentasRedes(){
  const r = [];
  const add = (red, usuario, marca, propia) => { if (!usuario) return; usuario = String(usuario).replace(/^@/, '');
    r.push({ red, usuario, marca, propia, url: red === 'ig' ? 'https://www.instagram.com/' + usuario : 'https://www.tiktok.com/@' + usuario }); };
  const yo = TID, otra = TID === 'regia' ? 'fraganza' : 'regia';
  const datos = { regia:{ marca:'Regia by CM', ig:M.instagramRegia, tt:M.tiktokRegia }, fraganza:{ marca:'Fraganza by CM', ig:M.instagramFraganza, tt:M.tiktokFraganza } };
  [yo, otra].forEach(t => { add('ig', datos[t].ig, datos[t].marca, t === yo); add('tt', datos[t].tt, datos[t].marca, t === yo); });
  return r;
}
function seccionInicio(){
  const hero = $('mk-hero'); if (!hero) return;
  let box = $('mk-inicio');
  if (!box){ box = document.createElement('div'); box.id = 'mk-inicio'; box.className = 'mk-inicio'; hero.appendChild(box); }
  const md = (CFG.medios || []).map(m => m.id);
  const logos = LOGOS_PAGO.filter(l => l.id === 'nequi' || l.id === 'breb' || md.includes(l.id) || !md.length);
  const otros = [md.includes('contraentrega') ? 'contra entrega' : '', md.includes('tienda') || CFG.retiroEnTienda ? 'efectivo en tienda' : ''].filter(Boolean);
  const redes = cuentasRedes();
  box.innerHTML = `
    <section class="mk-blk mk-pagos-blk" aria-labelledby="mk-pagos-t">
      <h2 id="mk-pagos-t">Paga como prefieras</h2>
      <div class="mk-logos">${logos.map(l => `<img src="${l.src}" alt="${esc(l.alt)}" loading="lazy">`).join('')}</div>
      <p>Transferencia por Nequi o Bre-B${md.includes('addi') || md.includes('sistecredito') ? ', compra a cuotas con ' + [md.includes('addi') ? 'Addi' : '', md.includes('sistecredito') ? 'Sistecrédito' : ''].filter(Boolean).join(' o ') : ''}${otros.length ? ' y ' + otros.join(' o ') : ''}.</p>
    </section>
    ${redes.length ? `<section class="mk-blk mk-redes-blk" aria-labelledby="mk-redes-t">
      <h2 id="mk-redes-t">Síguenos</h2>
      <p>Novedades, videos de las prendas y promociones.</p>
      <div class="mk-cuentas">${redes.map(c => `<a class="mk-cuenta${c.propia ? '' : ' otra'}" href="${esc(c.url)}" target="_blank" rel="noopener">${c.red === 'ig' ? IG_SVG : TT_SVG}<span><b>@${esc(c.usuario)}</b><small>${c.red === 'ig' ? 'Instagram' : 'TikTok'} · ${esc(c.marca)}</small></span></a>`).join('')}</div>
    </section>` : ''}`;
}
function abrirQR(){
  let m = $('mk-qr');
  if (!m){
    m = document.createElement('div'); m.id = 'mk-qr'; m.className = 'mk-modal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.setAttribute('aria-label', 'Pagar con Nequi o Bre-B');
    m.innerHTML = `<div class="mk-modal-in mk-qr-in"><button class="x" type="button" data-mk-cerrar aria-label="Cerrar">×</button>
      <h3>Paga con Nequi o Bre-B</h3>
      <p>Escanea el código desde la app de Nequi o de tu banco, o envía a la llave.</p>
      <img class="mk-qr-img" src="nequi-qr.jpg" alt="Código QR de Nequi y Bre-B de ${esc(M.titularNequi || 'la tienda')}">
      <div class="mk-llave"><span><small>Llave Nequi Negocios</small><b>${esc(M.llaveNequi)}</b></span><button type="button" class="btn ghost" data-mk-copiar="${esc(M.llaveNequi)}">Copiar</button></div>
      ${M.titularNequi ? `<p style="margin-top:10px">A nombre de ${esc(M.titularNequi)}.</p>` : ''}
      ${CFG.whatsapp ? `<a class="btn wa mk-ask" href="${esc(waLink('Hola, ya hice el pago por Nequi/Bre-B. Te envío el comprobante.'))}" target="_blank" rel="noopener" data-mk-ev="contacto">${WA_SVG}Enviar comprobante por WhatsApp</a>` : ''}</div>`;
    document.body.appendChild(m);
  }
  m.classList.add('on');
}
// después de hacer un pedido pagado por transferencia: muestra el QR y la llave
function enListo(p, sh){
  if (!p || !sh || p.medioPago !== 'transferencia' || !M.llaveNequi) return;
  const d = sh.querySelector('.done'); if (!d || d.querySelector('.mk-pago-listo')) return;
  const ref = d.querySelector('.pago') || d.querySelector('p strong')?.closest('p');
  const html = `<div class="mk-pago-listo"><b>Para pagar ${fmt(p.total)}</b><img src="nequi-qr.jpg" alt="Código QR de Nequi y Bre-B">
    <div class="mk-llave"><span><small>Llave Nequi Negocios</small><b>${esc(M.llaveNequi)}</b></span><button type="button" class="btn ghost" data-mk-copiar="${esc(M.llaveNequi)}">Copiar</button></div>
    <small>Envía el comprobante en el mismo chat de WhatsApp.</small></div>`;
  if (ref) ref.insertAdjacentHTML('afterend', html); else d.insertAdjacentHTML('beforeend', html);
  // sin salto automático a WhatsApp, para que alcance a ver el QR
  clearInterval(window.__waT);
  const c = d.querySelector('#wa-cuenta'); if (c) c.textContent = 'Paga con el QR o la llave y toca el botón verde para enviarnos tu pedido.';
}

/* ---------- configuración de la tienda (WhatsApp, pagos, envíos) ---------- */
function config(cfg){
  CFG = cfg || {};
  // datos fijos de las dos tiendas (tienen prioridad sobre lo que llegue del sistema)
  if (M.whatsapp){ let n = String(M.whatsapp).replace(/\D/g, ''); if (/^3\d{9}$/.test(n)) n = '57' + n; CFG.whatsapp = n; }
  if (M.direccion) CFG.direccionTienda = M.direccion;
  estilos();
  barraAvisos();
  const wa = waLink(TEXTOS.waSaludo + ' 😊');
  let f = $('mk-wa');
  if (!f){ f = document.createElement('a'); f.id = 'mk-wa'; f.className = 'mk-wa'; f.target = '_blank'; f.rel = 'noopener'; f.setAttribute('aria-label', 'Escríbenos por WhatsApp'); f.innerHTML = WA_SVG; f.addEventListener('click', () => evento('contacto', {})); document.body.appendChild(f); }
  f.hidden = !wa; if (wa) f.href = wa;
  seccionInicio();
  pie();
}

/* ---------- pie de página ---------- */
function pie(){
  const ft = document.querySelector('footer'); if (!ft) return;
  ft.classList.add('mk-foot');
  const logo = (typeof LOGO !== 'undefined' && LOGO) || '';
  const dir = CFG.direccionTienda || 'Centro Comercial Plaza Malambo, Malambo - Atlántico';
  const redes = [
    TEXTOS.instagram ? `<a href="https://www.instagram.com/${esc(TEXTOS.instagram.replace(/^@/, ''))}" target="_blank" rel="noopener">Instagram</a>` : '',
    TEXTOS.tiktok ? `<a href="https://www.tiktok.com/@${esc(TEXTOS.tiktok.replace(/^@/, ''))}" target="_blank" rel="noopener">TikTok</a>` : '',
    M.facebook ? `<a href="${esc(/^https?:/.test(M.facebook) ? M.facebook : 'https://facebook.com/' + M.facebook)}" target="_blank" rel="noopener">Facebook</a>` : '',
    CFG.whatsapp ? `<a href="${esc(waLink(TEXTOS.waSaludo))}" target="_blank" rel="noopener">WhatsApp</a>` : ''
  ].filter(Boolean).join('');
  const tel = CFG.whatsapp ? 'WhatsApp ' + String(CFG.whatsapp).replace(/^57(\d{3})(\d{3})(\d{4})$/, '$1 $2 $3') : '';
  const pagos = (CFG.medios || []).map(m => esc(m.label)).join('<br>');
  ft.innerHTML = `<div class="mk-foot-in">
    <div>${logo ? `<img src="${logo}" alt="${esc(TEXTOS.marca)}">` : ''}
      <p>${esc(TEXTOS.pie)}</p>
      ${redes ? `<div class="mk-redes">${redes}</div>` : ''}</div>
    <div><h4>Visítanos</h4>
      <p>${esc(dir)}<br><a href="${esc(M.mapsUrl)}" target="_blank" rel="noopener">Cómo llegar</a></p>
      ${M.horario ? `<p>${esc(M.horario)}</p>` : ''}
      ${tel ? `<p><a href="${esc(waLink(TEXTOS.waSaludo))}" target="_blank" rel="noopener">${esc(tel)}</a></p>` : ''}
    </div>
    <div><h4>Pagos y envíos</h4>
      ${pagos ? `<p>${pagos}</p>` : ''}
      ${CFG.envioActivo ? `<p>Envíos a domicilio${CFG.tiempoEnvio ? ' en ' + esc(CFG.tiempoEnvio) : ''}.</p>` : ''}
      ${M.politicaCambios ? `<p>Cambios: ${esc(M.politicaCambios)}</p>` : ''}
      <a class="mk-otra" href="${TEXTOS.otra.url}"><b>${esc(TEXTOS.otra.titulo)}</b><small>${esc(TEXTOS.otra.texto)}</small><span>${esc(TEXTOS.otra.cta)}</span></a>
    </div></div>
    <div class="mk-copy">© ${new Date().getFullYear()} ${esc(TEXTOS.marca)}</div>`;
}

/* ---------- ficha de producto ---------- */
function recomendados(p){
  const cp = catLabel(p.categoria);
  const sem = [...String(p.id)].reduce((s, c) => (s * 31 + c.charCodeAt(0)) >>> 0, 7);
  return PRODS.filter(x => x.id !== p.id && x.thumb && stock(x) > 0)
    .map(x => ({ x, s: (TID === 'regia' ? (catLabel(x.categoria) !== cp ? 2 : 0) : (catLabel(x.categoria) === cp ? 1 : 0)) + (x.tendencia > 0 ? 1 : 0) + ((sem ^ [...String(x.id)].reduce((s, c) => (s * 33 + c.charCodeAt(0)) >>> 0, 5)) % 1000) / 1000 }))
    .sort((a, b) => b.s - a.s).slice(0, 8).map(o => o.x);
}
function enProducto(p, sh, sel){
  if (!p || !sh) return;
  const info = sh.querySelector('.info'); if (!info) return;
  sel = sel || {};
  const h = info.querySelector('h2'); if (h) h.textContent = nombre(p.nombre);
  const gi = sh.querySelector('.gal-main img'); if (gi) gi.alt = nombre(p.nombre);
  if (TEXTOS.guiaTallas){
    info.querySelectorAll('.opt-t').forEach(o => { if (/^Talla/.test(o.textContent) && !o.querySelector('.mk-guia')) o.insertAdjacentHTML('beforeend', `<button type="button" class="mk-guia">${ico('regla')}Guía de tallas</button>`); });
  }
  const share = info.querySelector('#btn-share');
  const detalle = [sel.color && sel.color !== 'Único' ? sel.color : '', sel.talla && sel.talla !== 'Única' ? 'talla ' + sel.talla : ''].filter(Boolean).join(', ');
  const wa = waLink(`Hola, me interesa ${nombre(p.nombre)}${detalle ? ' (' + detalle + ')' : ''} de ${fmt(p.precio)}. ¿Me das más información?\n${location.origin + location.pathname}?p=${encodeURIComponent(p.id)}`);
  if (wa && share){
    share.insertAdjacentHTML('beforebegin', `<a class="btn ghost mk-ask" href="${esc(wa)}" target="_blank" rel="noopener" data-mk-ev="contacto">${WA_SVG}Preguntar por WhatsApp</a>`);
  }
  const li = [];
  if (!p.descripcion){
    li.push(TID === 'regia'
      ? ['chat', '<b>¿Dudas con la talla?</b> Escríbenos y te ayudamos a elegir la ideal.']
      : ['chat', '<b>¿Quieres saber cómo huele?</b> Escríbenos y te contamos sus notas y su duración.']);
  }
  if (CFG.envioActivo) li.push(['envio', '<b>Envío a domicilio</b>' + (CFG.tiempoEnvio ? ' en ' + esc(CFG.tiempoEnvio) : '')]);
  if (CFG.retiroEnTienda) li.push(['tienda', '<b>Recoge en tienda</b>, ' + esc(CFG.direccionTienda || 'Centro Comercial Plaza Malambo')]);
  const md = (CFG.medios || []).map(m => m.id);
  if (md.includes('addi') || md.includes('sistecredito')) li.push(['cuotas', '<b>Paga a cuotas</b> con ' + [md.includes('addi') ? 'Addi' : '', md.includes('sistecredito') ? 'Sistecrédito' : ''].filter(Boolean).join(' o ')]);
  if (M.politicaCambios && TID === 'regia') li.push(['cambio', '<b>Cambios:</b> ' + esc(M.politicaCambios)]);
  if (li.length) info.insertAdjacentHTML('beforeend', `<ul class="mk-info">${li.map(([i, t]) => `<li>${ico(i)}<span>${t}</span></li>`).join('')}</ul>`);
  const rec = recomendados(p);
  if (rec.length >= 2){
    info.insertAdjacentHTML('beforeend', `<div class="mk-xs"><h3>${esc(TEXTOS.cruzado)}</h3><div class="mk-xs-row">${rec.map(x => `<button type="button" class="mk-xs-it" data-mk-open="${esc(x.id)}"><div class="im"><img src="${esc(x.thumb)}" alt="${esc(nombre(x.nombre))}" loading="lazy"></div><span>${esc(nombre(x.nombre))}</span><strong>${fmt(x.precio)}</strong></button>`).join('')}</div></div>`);
  }
}

/* ---------- bolsa ---------- */
function enBolsa(sh){
  const b = sh && sh.querySelector('.bag-b'); if (!b || !b.querySelector('.ln')) return;
  b.insertAdjacentHTML('beforeend', `<a class="mk-otra" href="${TEXTOS.otra.url}"><b>${esc(TEXTOS.otra.titulo)}</b><small>${esc(TEXTOS.otra.texto)}</small><span>${esc(TEXTOS.otra.cta)}</span></a>`);
}

/* ---------- guía de tallas ---------- */
function abrirGuia(){
  let m = $('mk-guia');
  if (!m){
    m = document.createElement('div'); m.id = 'mk-guia'; m.className = 'mk-modal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.setAttribute('aria-label', 'Guía de tallas');
    m.innerHTML = `<div class="mk-modal-in"><button class="x" type="button" data-mk-cerrar aria-label="Cerrar">×</button>
      <h3>Guía de tallas</h3><p>Medidas del cuerpo en centímetros. Si estás entre dos tallas, elige la mayor para más comodidad o la menor para más compresión.</p>
      <table><thead><tr><th>Talla</th><th>Busto</th><th>Cintura</th><th>Cadera</th></tr></thead><tbody>
      <tr><td>S</td><td>84–88</td><td>62–66</td><td>90–94</td></tr>
      <tr><td>M</td><td>88–92</td><td>66–70</td><td>94–98</td></tr>
      <tr><td>L</td><td>92–96</td><td>70–76</td><td>98–104</td></tr>
      <tr><td>XL</td><td>96–102</td><td>76–82</td><td>104–110</td></tr>
      <tr><td>Única</td><td colspan="3">Se ajusta aprox. de S a M</td></tr></tbody></table>
      <p style="margin-top:14px">Las medidas son aproximadas y pueden variar según la referencia y la tela.</p>
      ${CFG.whatsapp ? `<a class="btn wa mk-ask" href="${esc(waLink('Hola, necesito ayuda para elegir mi talla. Mis medidas son: busto __ cm, cintura __ cm, cadera __ cm.'))}" target="_blank" rel="noopener" data-mk-ev="contacto">${WA_SVG}Te ayudamos a elegir tu talla</a>` : ''}</div>`;
    document.body.appendChild(m);
  }
  m.classList.add('on');
}

/* ---------- medición: Meta, TikTok y Google ---------- */
function cargarPixeles(){
  if (M.metaPixelId){
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', M.metaPixelId); fbq('track', 'PageView');
  }
  if (M.tiktokPixelId){
    !function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load(M.tiktokPixelId);ttq.page();}(window,document,'ttq');
  }
  if (M.googleAnalyticsId){
    const s = document.createElement('script'); s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(M.googleAnalyticsId); document.head.appendChild(s);
    window.dataLayer = window.dataLayer || []; window.gtag = function(){ dataLayer.push(arguments); };
    gtag('js', new Date()); gtag('config', M.googleAnalyticsId);
  }
}
// tipo: ver | agregar | pagar | pedido | contacto
function evento(tipo, d){
  d = d || {};
  const valor = Math.round(d.valor || 0), items = d.items || [];
  const ids = items.map(i => String(i.id));
  try{
    if (window.fbq){
      const base = { content_ids: ids, content_type: 'product', value: valor, currency: 'COP' };
      if (tipo === 'ver') fbq('track', 'ViewContent', Object.assign({ content_name: (items[0] || {}).nombre }, base));
      if (tipo === 'agregar') fbq('track', 'AddToCart', base);
      if (tipo === 'pagar') fbq('track', 'InitiateCheckout', Object.assign({ num_items: items.length }, base));
      if (tipo === 'pedido') fbq('track', 'Purchase', base);
      if (tipo === 'contacto') fbq('track', 'Contact');
    }
    if (window.ttq){
      const base = { contents: items.map(i => ({ content_id: String(i.id), content_name: i.nombre, quantity: i.cantidad || 1, price: i.precio || 0 })), content_type: 'product', value: valor, currency: 'COP' };
      const n = { ver: 'ViewContent', agregar: 'AddToCart', pagar: 'InitiateCheckout', pedido: 'PlaceAnOrder', contacto: 'Contact' }[tipo];
      if (n) ttq.track(n, tipo === 'contacto' ? {} : base);
    }
    if (window.gtag && M.googleAnalyticsId){
      const n = { ver: 'view_item', agregar: 'add_to_cart', pagar: 'begin_checkout', pedido: 'purchase', contacto: 'generate_lead' }[tipo];
      const g = { currency: 'COP', value: valor, items: items.map(i => ({ item_id: String(i.id), item_name: i.nombre, price: i.precio || 0, quantity: i.cantidad || 1, item_brand: TEXTOS.marca })) };
      if (tipo === 'pedido') g.transaction_id = d.codigo;
      if (n) gtag('event', n, g);
    }
  }catch(e){ console.warn('medición', e); }
}

/* ---------- clics de los elementos nuevos ---------- */
document.addEventListener('click', e => {
  const o = e.target.closest('[data-mk-open]');
  if (o && typeof window.abrirProducto === 'function'){
    e.preventDefault(); e.stopPropagation();
    window.abrirProducto(o.dataset.mkOpen);
    const sh = $('sheet-prod'); if (sh) setTimeout(() => { sh.querySelectorAll('.prod-body,.info').forEach(x => x.scrollTop = 0); }, 30);
    return;
  }
  if (e.target.closest('.mk-guia')){ e.preventDefault(); e.stopPropagation(); abrirGuia(); return; }
  if (e.target.closest('[data-mk-qr]')){ e.preventDefault(); abrirQR(); return; }
  const cp = e.target.closest('[data-mk-copiar]');
  if (cp){ e.preventDefault(); const v = cp.dataset.mkCopiar, ok = () => { cp.textContent = '¡Copiada!'; setTimeout(() => { cp.textContent = 'Copiar'; }, 1800); };
    try{ navigator.clipboard.writeText(v).then(ok).catch(() => { prompt('Copia la llave:', v); }); }catch(x){ prompt('Copia la llave:', v); } return; }
  const abierto = document.querySelector('.mk-modal.on');
  if (abierto && (e.target === abierto || e.target.closest('[data-mk-cerrar]'))){ abierto.classList.remove('on'); return; }
  if (e.target.closest('[data-mk-ev="contacto"]')) evento('contacto', {});
}, true);
document.addEventListener('keydown', e => { const m = document.querySelector('.mk-modal.on'); if (e.key === 'Escape' && m){ m.classList.remove('on'); e.stopPropagation(); } }, true);

estilos();
cargarPixeles();
window.MK = { enListo, normalizar, colorCanon, titulo, nombre, catLabel, ordenCats, palabra, etiqueta, setProds, despuesRender, config, enProducto, enBolsa, evento };
})();
