/* ============================================================
   MEJORAS DE MARKETING · Regia by CM y Fraganza by CM
   Lo usan tienda.html y fraganza.html. Súbelo a GitHub junto a ellas.

   ─── EDITA SOLO ESTE BLOQUE ───
   Deja en blanco ('') lo que todavía no tengas: esa parte no se muestra.
   ============================================================ */
window.MARKETING = {
  instagramRegia:   '',   // usuario sin @  · ej: 'regiabycm'
  instagramFraganza:'',   // usuario sin @  · ej: 'fraganzabycm'
  tiktok:           '',   // usuario sin @
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

const TEXTOS = {
  regia: {
    marca: 'Regia by CM',
    instagram: M.instagramRegia,
    kicker: 'Ropa deportiva para mujer · Malambo',
    palabra: ['prenda', 'prendas'],
    cruzado: 'Completa tu look',
    guiaTallas: true,
    waSaludo: 'Hola Regia by CM, vi la tienda en línea y quiero asesoría',
    otra: { url: 'fraganza.html', titulo: '¿Un perfume para completar tu look?', texto: 'Mira las fragancias de Fraganza by CM, en el mismo local.', cta: 'Ver perfumes' },
    cats: { 'basica':'Básicas', 'chaleco':'Chalecos', 'chaqueta':'Chaquetas', 'enterizo':'Enterizos', 'falda':'Faldas',
            'gorra':'Accesorios', 'termo':'Accesorios', 'media':'Accesorios', 'accesorio':'Accesorios',
            'leggin':'Leggins', 'legging':'Leggins', 'running':'Running', 'set':'Sets', 'set largo':'Sets', 'set corto':'Sets',
            'short':'Shorts', 'short corto':'Shorts', 'top':'Tops', 'vestido':'Vestidos' }
  },
  fraganza: {
    marca: 'Fraganza by CM',
    instagram: M.instagramFraganza,
    kicker: 'Perfumería · Malambo',
    palabra: ['perfume', 'perfumes'],
    cruzado: 'También te puede gustar',
    guiaTallas: false,
    quitarPrefijo: /^perfumes?\s+/i,
    waSaludo: 'Hola Fraganza by CM, vi la tienda en línea y quiero asesoría para elegir un perfume',
    otra: { url: 'tienda.html', titulo: '¿Buscas ropa deportiva?', texto: 'Sets, enterizos y leggins en Regia by CM, en el mismo local.', cta: 'Ver Regia by CM' },
    cats: { 'perfume':'Perfumes' }
  }
}[TID];

let CFG = {}, PRODS = [], minPub = 0;
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = n => '$' + Math.round(n || 0).toLocaleString('es-CO');
const stock = p => (p.variantes || []).reduce((s, v) => s + (v.stock || 0), 0);
const $ = id => document.getElementById(id);

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
  efectivo: '<rect x="2.5" y="6.5" width="19" height="11" rx="2"/><circle cx="12" cy="12" r="2.6"/>',
  chat: '<path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.1A8 8 0 1 1 20 12z"/>',
  pin: '<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
  reloj: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  regla: '<path d="M3 15.5 15.5 3 21 8.5 8.5 21z"/><path d="m7 12 2 2M10 9l2 2M13 6l2 2"/>',
  cambio: '<path d="M4 9h13l-3.5-3.5M20 15H7l3.5 3.5"/>'
};
const ico = k => `<svg viewBox="0 0 24 24" aria-hidden="true">${IC[k]}</svg>`;
const WA_SVG = '<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3zm0 23.7c-2 0-4-.5-5.7-1.6l-.4-.2-3.9 1 1-3.8-.3-.4A10.7 10.7 0 1 1 16 26.7zm5.9-8c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2l-1 1.2c-.2.2-.4.2-.7.1a8.8 8.8 0 0 1-4.4-3.8c-.3-.6.3-.5 1-1.7.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4s-1.2 1.1-1.2 2.8 1.2 3.2 1.4 3.5c.2.2 2.3 3.6 5.7 5 2.1.9 2.9 1 4 .8.6-.1 1.9-.8 2.2-1.5.3-.8.3-1.4.2-1.5l-.6-.3z"/></svg>';

/* ---------- estilos (usan los colores de cada tienda) ---------- */
const CSS = `
main{scroll-margin-top:120px;}
.mk-hero{max-width:1180px;margin:0 auto;padding:14px 16px 0;}
.mk-hero[hidden]{display:none;}
.mk-hero-in{position:relative;overflow:hidden;border-radius:22px;background:var(--wash);border:1px solid var(--line);display:grid;grid-template-columns:1fr;gap:14px;padding:18px 16px 16px;}
.mk-hero-in::before{content:"";position:absolute;inset:auto -30% -60% 30%;height:120%;background:radial-gradient(closest-side,color-mix(in srgb,var(--pink) 22%,transparent),transparent);pointer-events:none;}
.mk-hero-tx{position:relative;}
.mk-kicker{font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--violet);font-weight:600;margin:0 0 8px;}
.mk-hero h1{font-size:clamp(26px,7vw,46px);line-height:1.05;margin:0;}
.mk-hero h1 em{font-style:normal;background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent;}
.mk-sub{color:var(--soft);font-size:14px;margin:8px 0 14px;max-width:44ch;}
.mk-cta{display:flex;gap:10px;flex-wrap:wrap;}
.mk-cta .btn{text-decoration:none;display:inline-flex;align-items:center;gap:8px;padding:11px 16px;font-size:14px;}
.mk-cta .btn.ghost{color:var(--ink);}
.mk-cta .btn.ghost svg{color:#1FAF55;}
.mk-cta .btn svg{width:18px;height:18px;}
.mk-cta .btn.pri{flex:0 0 auto;}
.mk-cta [hidden]{display:none !important;}
.mk-hero-ph{position:relative;display:grid;grid-template-columns:repeat(3,1fr);gap:8px;}
.mk-hero-ph:empty{display:none;}
.mk-hero-ph button{border:0;padding:0;background:#fff;border-radius:14px;overflow:hidden;aspect-ratio:1/1;box-shadow:0 10px 24px -16px rgba(0,0,0,.45);}
@media(min-width:760px){.mk-hero-ph button{aspect-ratio:4/5;}}
.mk-hero-ph img{width:100%;height:100%;object-fit:cover;}
@media(min-width:760px){
  .mk-hero-in{grid-template-columns:1.15fr 1fr;align-items:center;padding:40px 40px;}
  .mk-hero-ph{gap:12px;}
  .mk-sub{font-size:16px;}
  .mk-hero-ph button:nth-child(2){transform:translateY(-14px);}
}
.mk-trust{max-width:1180px;margin:12px auto 0;padding:0 16px;display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;}
.mk-trust::-webkit-scrollbar{display:none;}
.mk-trust[hidden]{display:none;}
.mk-ti{flex-shrink:0;display:flex;align-items:center;gap:9px;border:1px solid var(--line);border-radius:14px;padding:9px 13px;background:#fff;}
.mk-ti svg,.mk-info svg,.mk-foot svg{width:20px;height:20px;fill:none;stroke:var(--violet);stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0;}
.mk-ti b{display:block;font-size:12.5px;font-weight:600;line-height:1.2;}
.mk-ti small{display:block;font-size:11.5px;color:var(--soft);line-height:1.2;}
.tag.mk-tag{background:var(--grad);color:#fff;}
/* botón flotante de WhatsApp */
.mk-wa{position:fixed;right:16px;bottom:calc(18px + env(safe-area-inset-bottom));z-index:30;width:56px;height:56px;border-radius:50%;background:#1FAF55;color:#fff;display:grid;place-items:center;box-shadow:0 10px 26px -8px rgba(0,0,0,.45);text-decoration:none;transition:transform .15s;}
.mk-wa:active{transform:scale(.94);}
.mk-wa svg{width:30px;height:30px;}
.mk-wa[hidden],body.lock .mk-wa{display:none;}
/* ficha de producto */
.mk-guia{border:0;background:none;padding:0;margin-left:8px;font-size:12.5px;font-weight:600;color:var(--violet);text-decoration:underline;text-underline-offset:3px;display:inline-flex;align-items:center;gap:4px;}
.mk-guia svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:1.6;}
.mk-ask{color:var(--ink);display:flex;align-items:center;justify-content:center;gap:8px;width:100%;margin-top:10px;text-decoration:none;font-size:14px;}
.mk-ask svg{width:19px;height:19px;}
.btn.wa.mk-ask{color:#fff;}
.mk-info{list-style:none;padding:14px 0 0;margin:16px 0 0;border-top:1px solid var(--line);display:grid;gap:10px;}
.mk-info li{display:flex;gap:10px;align-items:flex-start;font-size:13.5px;color:#4A4755;}
.mk-info b{color:var(--ink);font-weight:600;}
.mk-xs{margin-top:22px;}
.mk-xs h3{font-size:18px;margin-bottom:10px;}
.mk-xs-row{display:flex;gap:10px;overflow-x:auto;scrollbar-width:none;padding-bottom:4px;}
.mk-xs-row::-webkit-scrollbar{display:none;}
.mk-xs-it{flex:0 0 118px;border:0;background:none;padding:0;text-align:left;}
.mk-xs-it .im{aspect-ratio:4/5;border-radius:12px;overflow:hidden;background:var(--wash);}
.mk-xs-it img{width:100%;height:100%;object-fit:contain;}
.mk-xs-it span{display:block;font-size:12.5px;margin-top:6px;line-height:1.25;}
.mk-xs-it strong{display:block;font-family:'Jost',sans-serif;font-weight:500;font-size:14px;}
/* guía de tallas */
.mk-modal{position:fixed;inset:0;z-index:70;background:rgba(27,26,33,.5);display:none;align-items:flex-end;justify-content:center;}
.mk-modal.on{display:flex;}
.mk-modal-in{background:#fff;width:min(520px,100%);max-height:88dvh;overflow:auto;border-radius:22px 22px 0 0;padding:22px 20px calc(22px + env(safe-area-inset-bottom));position:relative;}
@media(min-width:620px){.mk-modal{align-items:center;}.mk-modal-in{border-radius:22px;}}
.mk-modal h3{font-size:22px;margin-bottom:4px;}
.mk-modal p{font-size:13.5px;color:var(--soft);margin:6px 0 12px;}
.mk-modal table{width:100%;border-collapse:collapse;font-size:14px;}
.mk-modal th,.mk-modal td{padding:10px 6px;text-align:center;border-bottom:1px solid var(--line);}
.mk-modal th{font-size:12px;color:var(--soft);font-weight:600;}
.mk-modal td:first-child{font-weight:700;}
.mk-modal .x{position:absolute;top:12px;right:12px;width:36px;height:36px;border-radius:50%;border:0;background:var(--wash);font-size:20px;}
/* bolsa: tienda hermana */
.mk-otra{display:block;margin-top:18px;border-radius:14px;padding:14px 16px;background:var(--wash);border:1px dashed var(--line);text-decoration:none;color:var(--ink);}
.mk-otra b{display:block;font-size:14px;}
.mk-otra small{display:block;color:var(--soft);font-size:12.5px;margin:2px 0 6px;}
.mk-otra span{font-size:13px;font-weight:600;color:var(--violet);}
/* pie de página */
footer.mk-foot{text-align:left;padding:34px 16px calc(96px + env(safe-area-inset-bottom));background:var(--wash);color:var(--ink);}
.mk-foot-in{max-width:1180px;margin:0 auto;display:grid;gap:26px;grid-template-columns:1fr;}
@media(min-width:760px){.mk-foot-in{grid-template-columns:1.2fr 1fr 1fr;}}
.mk-foot img{height:46px;margin:0 0 10px;}
.mk-foot h4{font-family:'Jost',sans-serif;font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:var(--soft);font-weight:600;margin:0 0 10px;}
.mk-foot p{margin:0 0 8px;font-size:14px;line-height:1.5;}
.mk-foot .row{display:flex;gap:9px;align-items:flex-start;margin-bottom:9px;font-size:14px;}
.mk-foot a{color:var(--ink);}
.mk-redes{display:flex;gap:8px;flex-wrap:wrap;}
.mk-redes a{border:1px solid var(--line);background:#fff;border-radius:999px;padding:8px 14px;font-size:13px;font-weight:600;text-decoration:none;}
.mk-pagos{display:flex;flex-wrap:wrap;gap:6px;}
.mk-pagos span{background:#fff;border:1px solid var(--line);border-radius:8px;padding:5px 9px;font-size:12px;}
.mk-copy{max-width:1180px;margin:26px auto 0;padding-top:16px;border-top:1px solid var(--line);font-size:12px;color:var(--soft);}
`;
function estilos(){ if ($('mk-css')) return; const s = document.createElement('style'); s.id = 'mk-css'; s.textContent = CSS; document.head.appendChild(s); }

/* ---------- portada ---------- */
function portadaFotos(){
  const el = $('mk-hero-ph'); if (!el || el.dataset.ok) return;
  const cand = PRODS.filter(p => p.thumb && stock(p) > 0)
    .sort((a, b) => (b.nFotos || 0) - (a.nFotos || 0) || (b.precio || 0) - (a.precio || 0));
  // variedad: una por categoría primero
  const vistas = new Set(), elegidas = [];
  cand.forEach(p => { const c = catLabel(p.categoria); if (elegidas.length < 3 && !vistas.has(c)){ vistas.add(c); elegidas.push(p); } });
  cand.forEach(p => { if (elegidas.length < 3 && !elegidas.includes(p)) elegidas.push(p); });
  if (elegidas.length < 3) return;
  el.innerHTML = elegidas.map(p => `<button type="button" data-mk-open="${esc(p.id)}" aria-label="${esc(nombre(p.nombre))}"><img src="${esc(p.thumb)}" alt="${esc(nombre(p.nombre))}"></button>`).join('');
  el.dataset.ok = '1';
}
function despuesRender(estado){
  const h = $('mk-hero'), t = $('mk-trust');
  const inicio = estado.categoria === 'Todo' && !String(estado.texto || '').trim();
  if (h) h.hidden = !inicio;
  if (t) t.hidden = !inicio || !t.innerHTML;
  portadaFotos();
  document.querySelectorAll('#grid .card[data-id] .ph img').forEach(img => {
    if (!img.alt){ const c = img.closest('.card'); const n = c && c.querySelector('.nm'); if (n) img.alt = n.textContent; }
  });
}

/* ---------- configuración de la tienda (WhatsApp, pagos, envíos) ---------- */
function confianza(){
  const it = [];
  const medios = (CFG.medios || []).map(m => m.id);
  if (CFG.envioActivo) it.push(['envio', 'Envíos a domicilio', CFG.tiempoEnvio || 'Te confirmamos costo y tiempo']);
  if (CFG.retiroEnTienda) it.push(['tienda', 'Recoge en tienda', CFG.direccionTienda || 'Sin costo']);
  if (medios.includes('addi') || medios.includes('sistecredito'))
    it.push(['cuotas', 'Paga a cuotas', [medios.includes('addi') ? 'Addi' : '', medios.includes('sistecredito') ? 'Sistecrédito' : ''].filter(Boolean).join(' o ')]);
  if (medios.includes('contraentrega')) it.push(['efectivo', 'Paga contra entrega', 'En efectivo al recibir']);
  else if (medios.includes('transferencia')) it.push(['efectivo', 'Nequi y transferencia', 'Daviplata y más']);
  if (CFG.whatsapp) it.push(['chat', 'Asesoría por WhatsApp', 'Te ayudamos a elegir']);
  if (M.politicaCambios) it.push(['cambio', 'Cambios fáciles', 'Mira las condiciones abajo']);
  return it;
}
function config(cfg){
  CFG = cfg || {};
  estilos();
  // franja de confianza
  const t = $('mk-trust');
  if (t){ t.innerHTML = confianza().map(([i, b, s]) => `<div class="mk-ti">${ico(i)}<div><b>${esc(b)}</b><small>${esc(s)}</small></div></div>`).join(''); }
  // botones de WhatsApp
  const wa = waLink(TEXTOS.waSaludo + ' 😊');
  document.querySelectorAll('.mk-wa-link').forEach(a => { if (wa){ a.href = wa; a.hidden = false; } else a.hidden = true; });
  let f = $('mk-wa');
  if (!f){ f = document.createElement('a'); f.id = 'mk-wa'; f.className = 'mk-wa'; f.target = '_blank'; f.rel = 'noopener'; f.setAttribute('aria-label', 'Escríbenos por WhatsApp'); f.innerHTML = WA_SVG; f.addEventListener('click', () => evento('contacto', {})); document.body.appendChild(f); }
  f.hidden = !wa; if (wa) f.href = wa;
  pie();
}

/* ---------- pie de página ---------- */
function pie(){
  const ft = document.querySelector('footer'); if (!ft) return;
  ft.classList.add('mk-foot');
  const logo = (typeof LOGO !== 'undefined' && LOGO) || '';
  const dir = CFG.direccionTienda || 'C.C. Plaza Malambo';
  const redes = [
    TEXTOS.instagram ? `<a href="https://instagram.com/${esc(TEXTOS.instagram.replace(/^@/, ''))}" target="_blank" rel="noopener">Instagram</a>` : '',
    M.tiktok ? `<a href="https://www.tiktok.com/@${esc(M.tiktok.replace(/^@/, ''))}" target="_blank" rel="noopener">TikTok</a>` : '',
    M.facebook ? `<a href="${esc(/^https?:/.test(M.facebook) ? M.facebook : 'https://facebook.com/' + M.facebook)}" target="_blank" rel="noopener">Facebook</a>` : '',
    CFG.whatsapp ? `<a href="${esc(waLink(TEXTOS.waSaludo))}" target="_blank" rel="noopener">WhatsApp</a>` : ''
  ].filter(Boolean).join('');
  const pagos = (CFG.medios || []).map(m => `<span>${esc(m.label)}</span>`).join('');
  ft.innerHTML = `<div class="mk-foot-in">
    <div>${logo ? `<img src="${logo}" alt="${esc(TEXTOS.marca)}">` : ''}
      <p style="color:var(--soft)">${TID === 'regia' ? 'Ropa deportiva para mujer que estiliza tu figura, para entrenar y para el día a día.' : 'Perfumes para él y para ella, con asesoría para encontrar tu aroma ideal.'}</p>
      ${redes ? `<div class="mk-redes">${redes}</div>` : ''}</div>
    <div><h4>Visítanos</h4>
      <div class="row">${ico('pin')}<span>${esc(dir)}<br><a href="${esc(M.mapsUrl)}" target="_blank" rel="noopener">Cómo llegar</a></span></div>
      ${M.horario ? `<div class="row">${ico('reloj')}<span>${esc(M.horario)}</span></div>` : ''}
      ${CFG.whatsapp ? `<div class="row">${ico('chat')}<span><a href="${esc(waLink(TEXTOS.waSaludo))}" target="_blank" rel="noopener">+${esc(String(CFG.whatsapp).replace(/^(\d{2})(\d{3})(\d{3})(\d{4})$/, '$1 $2 $3 $4'))}</a></span></div>` : ''}
    </div>
    <div><h4>Pagos y envíos</h4>
      ${pagos ? `<div class="mk-pagos">${pagos}</div>` : ''}
      ${CFG.envioActivo ? `<p style="margin-top:12px">Envíos a domicilio${CFG.tiempoEnvio ? ' · ' + esc(CFG.tiempoEnvio) : ''}.</p>` : ''}
      ${M.politicaCambios ? `<p><b>Cambios:</b> ${esc(M.politicaCambios)}</p>` : ''}
      <a class="mk-otra" href="${TEXTOS.otra.url}"><b>${esc(TEXTOS.otra.titulo)}</b><small>${esc(TEXTOS.otra.texto)}</small><span>${esc(TEXTOS.otra.cta)} →</span></a>
    </div></div>
    <div class="mk-copy">© ${new Date().getFullYear()} ${esc(TEXTOS.marca)} · Malambo, Atlántico</div>`;
}

/* ---------- ficha de producto ---------- */
function recomendados(p){
  const cp = catLabel(p.categoria);
  const sem = [...String(p.id)].reduce((s, c) => (s * 31 + c.charCodeAt(0)) >>> 0, 7);
  return PRODS.filter(x => x.id !== p.id && x.thumb && stock(x) > 0)
    .map(x => ({ x, s: (TID === 'regia' ? (catLabel(x.categoria) !== cp ? 2 : 0) : (catLabel(x.categoria) === cp ? 1 : 0)) + ((sem ^ [...String(x.id)].reduce((s, c) => (s * 33 + c.charCodeAt(0)) >>> 0, 5)) % 1000) / 1000 }))
    .sort((a, b) => b.s - a.s).slice(0, 8).map(o => o.x);
}
function enProducto(p, sh, sel){
  if (!p || !sh) return;
  const info = sh.querySelector('.info'); if (!info) return;
  sel = sel || {};
  // título con nombre ordenado
  const h = info.querySelector('h2'); if (h) h.textContent = nombre(p.nombre);
  const gi = sh.querySelector('.gal-main img'); if (gi) gi.alt = nombre(p.nombre);
  // guía de tallas junto a "Talla"
  if (TEXTOS.guiaTallas){
    info.querySelectorAll('.opt-t').forEach(o => { if (/^Talla/.test(o.textContent) && !o.querySelector('.mk-guia')) o.insertAdjacentHTML('beforeend', `<button type="button" class="mk-guia">${ico('regla')}Guía de tallas</button>`); });
  }
  // preguntar por WhatsApp
  const share = info.querySelector('#btn-share');
  const detalle = [sel.color && sel.color !== 'Único' ? sel.color : '', sel.talla && sel.talla !== 'Única' ? 'talla ' + sel.talla : ''].filter(Boolean).join(', ');
  const wa = waLink(`Hola, me interesa ${nombre(p.nombre)}${detalle ? ' (' + detalle + ')' : ''} de ${fmt(p.precio)}. ¿Me das más información?\n${location.origin + location.pathname}?p=${encodeURIComponent(p.id)}`);
  if (wa && share){
    share.insertAdjacentHTML('beforebegin', `<a class="btn ghost mk-ask" href="${esc(wa)}" target="_blank" rel="noopener" data-mk-ev="contacto">${WA_SVG}Preguntar por WhatsApp</a>`);
  }
  // bloque de confianza
  const li = [];
  if (!p.descripcion){
    li.push(TID === 'regia'
      ? ['chat', '<b>¿Dudas con la talla?</b> Escríbenos y te ayudamos a elegir la ideal para ti.']
      : ['chat', '<b>¿Quieres saber cómo huele?</b> Escríbenos y te contamos sus notas y su duración.']);
  }
  if (CFG.envioActivo) li.push(['envio', '<b>Envío a domicilio</b>' + (CFG.tiempoEnvio ? ' · ' + esc(CFG.tiempoEnvio) : '')]);
  if (CFG.retiroEnTienda) li.push(['tienda', '<b>Recoge en tienda</b> · ' + esc(CFG.direccionTienda || 'C.C. Plaza Malambo')]);
  const md = (CFG.medios || []).map(m => m.id);
  if (md.includes('addi') || md.includes('sistecredito')) li.push(['cuotas', '<b>Paga a cuotas</b> con ' + [md.includes('addi') ? 'Addi' : '', md.includes('sistecredito') ? 'Sistecrédito' : ''].filter(Boolean).join(' o ')]);
  if (M.politicaCambios && TID === 'regia') li.push(['cambio', '<b>Cambios:</b> ' + esc(M.politicaCambios)]);
  if (li.length) info.insertAdjacentHTML('beforeend', `<ul class="mk-info">${li.map(([i, t]) => `<li>${ico(i)}<span>${t}</span></li>`).join('')}</ul>`);
  // venta cruzada
  const rec = recomendados(p);
  if (rec.length >= 2){
    info.insertAdjacentHTML('beforeend', `<div class="mk-xs"><h3>${esc(TEXTOS.cruzado)}</h3><div class="mk-xs-row">${rec.map(x => `<button type="button" class="mk-xs-it" data-mk-open="${esc(x.id)}"><div class="im"><img src="${esc(x.thumb)}" alt="${esc(nombre(x.nombre))}" loading="lazy"></div><span>${esc(nombre(x.nombre))}</span><strong>${fmt(x.precio)}</strong></button>`).join('')}</div></div>`);
  }
}

/* ---------- bolsa ---------- */
function enBolsa(sh){
  const b = sh && sh.querySelector('.bag-b'); if (!b || !b.querySelector('.ln')) return;
  b.insertAdjacentHTML('beforeend', `<a class="mk-otra" href="${TEXTOS.otra.url}"><b>${esc(TEXTOS.otra.titulo)}</b><small>${esc(TEXTOS.otra.texto)} Tu bolsa de esta tienda queda guardada.</small><span>${esc(TEXTOS.otra.cta)} →</span></a>`);
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
  const m = $('mk-guia');
  if (m && m.classList.contains('on') && (e.target === m || e.target.closest('[data-mk-cerrar]'))){ m.classList.remove('on'); return; }
  if (e.target.closest('[data-mk-ev="contacto"]')) evento('contacto', {});
}, true);
document.addEventListener('keydown', e => { const m = $('mk-guia'); if (e.key === 'Escape' && m && m.classList.contains('on')){ m.classList.remove('on'); e.stopPropagation(); } }, true);

estilos();
cargarPixeles();
window.MK = { normalizar, colorCanon, titulo, nombre, catLabel, ordenCats, palabra, etiqueta, setProds, despuesRender, config, enProducto, enBolsa, evento };
})();
