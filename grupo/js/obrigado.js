(function () {
  var OC = window.OC, L = window.OCLead, P = window.OCPesquisa;
  var q = new URLSearchParams(location.search);
  var local = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);

  // sem lead conhecido: volta para a captura
  var lid = L.resolve(q.get('lid') || '') || L.leadAtual();
  if (!lid) { location.replace('index.html' + location.search); return; }
  L.guardaLead(lid);

  document.querySelectorAll('[data-vagas]').forEach(function (e) { e.textContent = OC.vagas; });
  document.querySelectorAll('[data-contador]').forEach(function (e) { OCContador.montarContador(e, OC.aula); });

  // reenvia o que ficou na fila; só depois disso enviamos eventos novos (o lead precisa existir no banco)
  L.autoReenviar();
  var pronta = L.reenviarFila().then(function () { lid = L.resolve(lid); }, function () {});
  function enviar(corpo) { return pronta.then(function () { corpo.lead_id = lid; return L.enviar(corpo); }); }

  // estado salvo da pesquisa (por lead)
  var chave = 'oc_pesq';
  function carrega() {
    try { var s = JSON.parse(localStorage.getItem(chave) || 'null'); if (s && L.resolve(s.lid) === lid) return s; } catch (e) {}
    return { lid: lid, r: {}, ok: false };
  }
  function salva() { try { localStorage.setItem(chave, JSON.stringify(estado)); } catch (e) {} }
  var estado = carrega();

  var el = { p1: document.getElementById('passo1'), p2: document.getElementById('passo2'), qn: document.getElementById('qn'),
    q: document.getElementById('q'), qt: document.getElementById('qt'), ops: document.getElementById('ops'),
    enviar: document.getElementById('enviar'), proxima: document.getElementById('proxima'), voltar: document.getElementById('voltar'), grupo: document.getElementById('grupo'), pos: document.getElementById('pos') };
  var idx = 0;

  function mostra(i, foco) {
    idx = i; var p = P.PERGUNTAS[i], marcada = estado.r[p.k];
    el.qn.textContent = 'Pergunta ' + (i + 1) + ' de ' + P.PERGUNTAS.length;
    el.qt.textContent = p.t(OC.vagas);
    el.ops.innerHTML = '';
    p.o.forEach(function (o) {
      var lb = document.createElement('label'); lb.className = 'op';
      var inp = document.createElement('input'); inp.type = 'radio'; inp.name = 'resp'; inp.value = o[0]; inp.checked = marcada === o[0];
      // clique ou toque avança sozinho; seta/espaço no teclado só marca (detail 0) e libera o botão Continuar
      inp.addEventListener('click', function (ev) { responde(p, o[0], ev.detail === 0); });
      var sp = document.createElement('span'); sp.textContent = o[1];
      lb.appendChild(inp); lb.appendChild(sp); el.ops.appendChild(lb);
    });
    var ultima = i === P.PERGUNTAS.length - 1;
    el.enviar.hidden = !ultima; el.enviar.disabled = !marcada;
    el.voltar.hidden = i === 0;
    el.proxima.hidden = !(marcada && !ultima);
    if (foco) el.q.focus({ preventScroll: true });
  }

  function responde(p, v, teclado) {
    var mudou = estado.r[p.k] !== v;
    estado.r[p.k] = v; salva();
    if (mudou) enviar({ tipo: 'pesquisa', pergunta: p.k, resposta: v });
    var ultima = idx === P.PERGUNTAS.length - 1;
    if (ultima) el.enviar.disabled = false;
    else if (teclado) el.proxima.hidden = false;
    else setTimeout(function () { mostra(idx + 1, true); }, 250);
  }
  el.proxima.addEventListener('click', function () { if (idx < P.PERGUNTAS.length - 1) mostra(idx + 1, true); });

  el.voltar.addEventListener('click', function () { if (idx > 0) mostra(idx - 1, true); });

  el.enviar.addEventListener('click', function () {
    if (P.proxima(estado.r) !== -1) { mostra(P.proxima(estado.r), true); return; }
    estado.ok = true; salva();
    if (window.ocTrack) {
      ocTrack('PesquisaCompleta', lid + '-pc');
      if (P.qualifica(estado.r) === 'quente') ocTrack('LeadQuente', lid + '-lq');
    }
    passo2();
  });

  function passo2() {
    el.p1.hidden = true; el.p2.hidden = false;
    var g = OC.grupo;
    if (g) el.grupo.href = g; else { el.grupo.setAttribute('aria-disabled', 'true'); el.grupo.removeAttribute('href'); el.grupo.style.opacity = '.55'; }
    window.scrollTo(0, 0);
    document.getElementById('t2').focus({ preventScroll: true });
  }

  el.grupo.addEventListener('click', function (ev) {
    if (!OC.grupo) { ev.preventDefault(); return; }
    enviar({ tipo: 'clicou_grupo' });
    L.reenviarFila();   // a pessoa vai sair para o WhatsApp: tenta esvaziar a fila agora
    if (window.ocTrack) ocTrack('ClicouGrupo', lid + '-cg');
    el.pos.hidden = false;
  });

  // abertura: registra a visita ao obrigado e decide a tela
  enviar({ tipo: 'viu_obrigado' });
  if (estado.ok && P.proxima(estado.r) === -1) passo2();
  else if (local && q.get('passo') === '2') passo2();
  else { var i = P.proxima(estado.r); mostra(i === -1 ? P.PERGUNTAS.length - 1 : i, false); }
})();
