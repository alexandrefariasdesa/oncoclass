(function () {
  var OC = window.OC, L = window.OCLead;

  document.querySelectorAll('[data-vagas]').forEach(function (e) { e.textContent = OC.vagas; });
  document.querySelectorAll('[data-contador]').forEach(function (e) { OCContador.montarContador(e, OC.aula); });

  document.documentElement.classList.add('js');
  // revelação ao rolar (uma vez), sem ouvir 'scroll'
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }); }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    document.querySelectorAll('[data-rv]').forEach(function (e) { io.observe(e); });
  } else document.querySelectorAll('[data-rv]').forEach(function (e) { e.classList.add('in'); });

  // botões das sessões levam ao formulário do topo
  document.querySelectorAll('[data-cta]').forEach(function (a) {
    a.addEventListener('click', function (ev) {
      ev.preventDefault();
      document.getElementById('topo').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion:reduce)').matches ? 'auto' : 'smooth' });
      setTimeout(function () { document.getElementById('nome').focus({ preventScroll: true }); }, 450);
    });
  });
  var pv = document.querySelector('[data-privacidade]');
  if (pv && OC.privacidade) { pv.href = OC.privacidade; pv.hidden = false; }

  // visita (uma por sessão) e reenvio do que ficou na fila
  L.autoReenviar();
  try {
    if (!sessionStorage.getItem('oc_view')) {
      sessionStorage.setItem('oc_view', '1');
      var vid = localStorage.getItem('oc_vid') || L.novoId(); localStorage.setItem('oc_vid', vid);
      L.enviar({ tipo: 'view', lead_id: vid });
    }
  } catch (e) {}

  var f = document.getElementById('f'), w = document.getElementById('whats');
  w.addEventListener('input', function () { w.value = L.mascaraWhats(w.value); });

  function marca(el, ok) {
    el.setAttribute('aria-invalid', ok ? 'false' : 'true');
    el.closest('.campo').classList.toggle('tem-erro', !ok);
  }

  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var dados = { nome: f.nome.value, whatsapp: f.whatsapp.value, email: f.email.value };
    var v = L.valida(dados);
    ['nome', 'whatsapp', 'email'].forEach(function (k) { marca(f[k], v.campos.indexOf(k) < 0); });
    if (!v.ok) { f.querySelector('[aria-invalid="true"]').focus(); return; }

    var btn = f.querySelector('button'); btn.disabled = true; btn.querySelector('.t').textContent = 'ENVIANDO...';
    var id = L.novoId();
    var corpo = Object.assign({
      tipo: 'lead', lead_id: id, nome: dados.nome.trim(), whatsapp: L.normalizaWhats(dados.whatsapp),
      email: dados.email.trim().toLowerCase(), pagina: location.href, user_agent: navigator.userAgent
    }, L.atribuicao());
    L.guardaLead(id);
    if (window.ocTrack) ocTrack('Lead', id, { nome: corpo.nome, whatsapp: corpo.whatsapp, email: corpo.email });

    L.enviar(corpo).then(function (r) {
      if (r && r.lead_id) L.guardaLead(r.lead_id);   // WhatsApp já cadastrado devolve o lead existente
      var q = new URLSearchParams(location.search); q.set('lid', (r && r.lead_id) || id);
      location.href = 'obrigado.html?' + q.toString();
    });
  });

  // voltar do obrigado restaura a página do cache com o botão travado em "ENVIANDO...": destrava
  window.addEventListener('pageshow', function (ev) {
    if (!ev.persisted) return;
    var b = f.querySelector('button'); b.disabled = false; b.querySelector('.t').textContent = 'QUERO ENTRAR NO GRUPO VIP';
  });
})();
