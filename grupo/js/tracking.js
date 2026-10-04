/* Pixel da Meta da Oncoclass. Só carrega se OC.pixel estiver preenchido e a pessoa não tiver recusado cookies.
   Eventos: PageView, Lead, PesquisaCompleta, LeadQuente, ClicouGrupo (todos com eventID para deduplicar com a CAPI). */
(function () {
  var C = window.OC || {};
  var PIXEL = C.pixel || '';
  var CUSTOM = { PesquisaCompleta: 1, LeadQuente: 1, ClicouGrupo: 1 };
  var recusou = /(?:^|;\s*)(?:oncoclass|bivak|manu)_consent=recusado/.test(document.cookie);

  if (PIXEL && !recusou) {
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', PIXEL);
    fbq('track', 'PageView');
  }

  /* pessoa: {nome, whatsapp, email}. Opcional; melhora a correspondência com o anúncio. */
  window.ocTrack = function (nome, id, pessoa) {
    if (!PIXEL || recusou) return;
    pessoa = pessoa || {};
    try {
      if (window.fbq) {
        if (pessoa.email || pessoa.whatsapp) {
          var ph = String(pessoa.whatsapp || '').replace(/\D/g, '');
          fbq('init', PIXEL, {
            em: pessoa.email || undefined,
            ph: ph ? (ph.length <= 11 ? '55' + ph : ph) : undefined,
            fn: pessoa.nome ? String(pessoa.nome).trim().split(/\s+/)[0].toLowerCase() : undefined,
            country: 'br'
          });
        }
        fbq(CUSTOM[nome] ? 'trackCustom' : 'track', nome,
          { content_name: 'Oncoclass Grupo 2026', content_category: 'grupo-vip' }, { eventID: id });
      }
    } catch (e) {}
  };
})();
