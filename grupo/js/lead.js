(function (root) {
  var UTM = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'src'];

  // devolve só dígitos com DDI 55; vazio se não parecer um telefone brasileiro
  function normalizaWhats(s) {
    var d = String(s || '').replace(/\D/g, '');
    if (d.length === 10 || d.length === 11) d = '55' + d;
    return (d.length === 12 || d.length === 13) && d.slice(0, 2) === '55' ? d : '';
  }

  // formata enquanto digita; aceita número colado com +55 ou 0 na frente sem cortar dígitos
  function mascaraWhats(s) {
    var d = String(s || '').replace(/\D/g, '');
    if (d.length > 11 && d.slice(0, 2) === '55') d = d.slice(2);
    if (d.length > 11 && d.charAt(0) === '0') d = d.slice(1);
    d = d.slice(0, 11);
    if (d.length > 6) return '(' + d.slice(0, 2) + ') ' + d.slice(2, d.length > 10 ? 7 : 6) + '-' + d.slice(d.length > 10 ? 7 : 6);
    if (d.length > 2) return '(' + d.slice(0, 2) + ') ' + d.slice(2);
    return d;
  }

  function valida(d) {
    var campos = [];
    if (String(d.nome || '').trim().length < 2) campos.push('nome');
    if (!normalizaWhats(d.whatsapp)) campos.push('whatsapp');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(d.email || '').trim())) campos.push('email');
    return { ok: campos.length === 0, campos: campos };
  }

  // Fila de envio. Cada evento é gravado no armazenamento ANTES do POST e só sai dele depois do sucesso (ou de um 4xx,
  // que é definitivo). Falha de rede interrompe o reenvio e preserva a ordem. d = dependências (testáveis com fakes).
  function criar(d) {
    var OC = d.OC || {}, emVoo = {}, rodando = null, seq = 0;
    function lj(k, def) { try { var v = JSON.parse(d.store.get(k) || 'null'); return v == null ? def : v; } catch (e) { return def; } }
    function sj(k, v) { try { d.store.set(k, JSON.stringify(v)); } catch (e) {} }

    // WhatsApp já cadastrado: o servidor devolve o lead existente; o id local vira apelido do id do servidor
    function resolve(id) { var a = lj('oc_alias', {}), n = 0; while (id && a[id] && n++ < 5) id = a[id]; return id; }
    function leadAtual() { return resolve(d.sess.get('oc_lead') || d.store.get('oc_lead') || ''); }
    function guardaLead(id) { try { d.sess.set('oc_lead', id); d.store.set('oc_lead', id); } catch (e) {} }

    function fila() { return lj('oc_fila', []); }
    function salvaFila(f) { sj('oc_fila', f.slice(-80)); }
    function tira(k) { salvaFila(fila().filter(function (i) { return i.k !== k; })); }
    function aplica(c, r) {
      if (c.tipo === 'lead' && r && r.lead_id && r.lead_id !== c.lead_id) { var a = lj('oc_alias', {}); a[c.lead_id] = r.lead_id; sj('oc_alias', a); }
    }

    function post(corpo, ms) {
      var ctl = d.AbortController ? new d.AbortController() : null, t;
      if (!OC.url) return Promise.reject(new Error('sem endpoint'));
      if (ctl) t = setTimeout(function () { ctl.abort(); }, ms || 2500);
      return d.fetch(OC.url, {
        method: 'POST', keepalive: true, signal: ctl ? ctl.signal : undefined,
        headers: { 'Content-Type': 'application/json', apikey: OC.key, Authorization: 'Bearer ' + OC.key },
        body: JSON.stringify({ p: corpo })
      }).then(function (r) { if (!r.ok) { var e = new Error('http ' + r.status); e.status = r.status; throw e; } return r.json(); })
        .then(function (j) { clearTimeout(t); return j; }, function (e) { clearTimeout(t); throw e; });
    }
    function definitivo(e) { return e && e.status >= 400 && e.status < 500; }

    // envia; falhando por rede o item continua na fila para reenviar depois. Nunca rejeita (devolve null).
    function enviar(corpo, ms) {
      if (corpo.lead_id) corpo.lead_id = resolve(corpo.lead_id);
      var item = { k: Date.now() + '.' + (++seq) + Math.random().toString(36).slice(2, 6), c: corpo };
      var f = fila(); f.push(item); salvaFila(f); emVoo[item.k] = 1;
      return post(item.c, ms).then(function (r) { tira(item.k); aplica(item.c, r); return r; },
        function (e) { if (definitivo(e)) tira(item.k); return null; })
        .then(function (r) { delete emVoo[item.k]; return r; });
    }

    function reenviarFila() {
      if (rodando) return rodando;
      var pend = fila().filter(function (i) { return !emVoo[i.k]; });
      if (!pend.length) return Promise.resolve();
      rodando = pend.reduce(function (p, item) {
        return p.then(function (parar) {
          if (parar) return true;
          item.c.lead_id = resolve(item.c.lead_id); emVoo[item.k] = 1;
          return post(item.c, 4000).then(function (r) { tira(item.k); aplica(item.c, r); return false; },
            function (e) { if (definitivo(e)) { tira(item.k); return false; } return true; })
            .then(function (par) { delete emVoo[item.k]; return par; });
        });
      }, Promise.resolve(false)).then(function () { rodando = null; }, function () { rodando = null; });
      return rodando;
    }

    return { enviar: enviar, reenviarFila: reenviarFila, resolve: resolve, leadAtual: leadAtual, guardaLead: guardaLead, pendentes: function () { return fila().length; } };
  }

  var api = { normalizaWhats: normalizaWhats, mascaraWhats: mascaraWhats, valida: valida, criar: criar };
  if (typeof module !== 'undefined') { module.exports = api; return; }

  // ---- navegador ----
  function arm(s) { return { get: function (k) { try { return s.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { s.setItem(k, v); } catch (e) {} } }; }
  var store = arm(root.localStorage), sess = arm(root.sessionStorage);
  var fila = criar({ OC: root.OC, store: store, sess: sess, AbortController: root.AbortController, fetch: function (u, o) { return root.fetch(u, o); } });

  function cookie(n) { var m = document.cookie.match(new RegExp('(?:^|;\\s*)' + n + '=([^;]*)')); return m ? decodeURIComponent(m[1]) : ''; }
  function atribuicao() {
    var q = new URLSearchParams(location.search), a = {};
    UTM.forEach(function (k) { if (q.get(k)) a[k] = q.get(k); });
    var salvo = {}; try { salvo = JSON.parse(store.get('oc_atrib') || '{}'); } catch (e) {}
    a = Object.assign({}, salvo, a);
    if (Object.keys(a).length) store.set('oc_atrib', JSON.stringify(a));
    var fbp = cookie('_fbp'), fbc = cookie('_fbc');
    if (!fbc && q.get('fbclid')) fbc = 'fb.1.' + Date.now() + '.' + q.get('fbclid');
    if (fbp) a.fbp = fbp; if (fbc) a.fbc = fbc;
    return a;
  }
  function novoId() {
    return (root.crypto && crypto.randomUUID) ? crypto.randomUUID()
      : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) { var r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16); });
  }

  // reenvia sozinho: ao voltar a rede, ao esconder a aba (a pessoa foi para o WhatsApp) e a cada 15 s enquanto houver fila
  function autoReenviar() {
    root.addEventListener('online', function () { fila.reenviarFila(); });
    document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') fila.reenviarFila(); });
    setInterval(function () { if (fila.pendentes()) fila.reenviarFila(); }, 15000);
    fila.reenviarFila();
  }

  root.OCLead = { normalizaWhats: normalizaWhats, mascaraWhats: mascaraWhats, valida: valida, atribuicao: atribuicao, novoId: novoId,
    leadAtual: fila.leadAtual, guardaLead: fila.guardaLead, resolve: fila.resolve, enviar: fila.enviar, reenviarFila: fila.reenviarFila, autoReenviar: autoReenviar };
})(typeof window !== 'undefined' ? window : this);
