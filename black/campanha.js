// Config da Black Oncoclass 2.0 (Vitalícia) — captura + obrigado leem daqui.
window.OCB = {
  campanha: 'black-oncoclass-2-0',
  abertura: '2026-11-30T19:30:00-03:00',        // contagem do topo (abertura das vagas)
  dataTexto: '30/11 às 19h30',
  grupo: 'https://chat.whatsapp.com/KlG3CuNjFVPEnrS69Zedyw',  // grupo VIP da Black (19/11)
  pixel: '1606696444389111',
  url: 'https://dbususnqmikxfllvtitl.supabase.co/rest/v1/rpc/ob_registrar',
  key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRidXN1c25xbWlreGZsbHZ0aXRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExNDI2MzcsImV4cCI6MjEwNjcxODYzN30.0TjGZ5ao1dY3TJOfzNuS4vDzc55lAUFdzYntqDw79gU'
};
// Meta Pixel + helper com event_id (mesmo padrão da Black Vitalícia)
(function(){
  var C = window.OCB; if (!C.pixel) return;
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;
  s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', C.pixel); fbq('track', 'PageView');
  window.ocbTrack = function(ev, id){
    var padrao = {Lead:1, CompleteRegistration:1};
    try { fbq(padrao[ev] ? 'track' : 'trackCustom', ev, {content_name: C.campanha}, {eventID: id}); } catch(e){}
  };
})();
// envio ao banco (Supabase RPC); sem url = só segue o fluxo
window.ocbEnvia = function(corpo){
  var C = window.OCB; if (!C.url) return Promise.resolve();
  corpo.campanha = C.campanha;
  return fetch(C.url, {method:'POST', keepalive:true,
    headers:{'Content-Type':'application/json', apikey:C.key, Authorization:'Bearer ' + C.key},
    body: JSON.stringify({p: corpo})}).catch(function(){});
};
