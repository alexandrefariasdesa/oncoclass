(function (root) {
  var OFF = 3 * 3600e3, DIA = 864e5; // Brasília = UTC−3, sem horário de verão
  function proximaAula(agoraMs, cfg) {
    var hm = cfg.hora.split(':'), h = +hm[0], m = +hm[1];
    var loc = new Date(agoraMs - OFF); // getters UTC = relógio de Brasília
    var inicio = Date.UTC(loc.getUTCFullYear(), loc.getUTCMonth(), loc.getUTCDate(), h, m) + OFF;
    inicio += ((cfg.diaSemana - loc.getUTCDay() + 7) % 7) * DIA;
    var fim = inicio + cfg.duracaoMin * 60e3;
    if (agoraMs >= fim) { inicio += 7 * DIA; fim = inicio + cfg.duracaoMin * 60e3; }
    var aoVivo = agoraMs >= inicio && agoraMs < fim;
    return { estado: aoVivo ? 'ao_vivo' : 'contagem', alvoMs: inicio, restanteMs: aoVivo ? 0 : inicio - agoraMs };
  }
  function montarContador(el, cfg, agoraFn) {
    var agora = agoraFn || Date.now, skew = 0;
    function pad(n) { return String(n).padStart(2, '0'); }
    function pinta() {
      var r = proximaAula(agora() + skew, cfg);
      if (r.estado === 'ao_vivo') { el.textContent = 'Aula ao vivo agora'; return; }
      var s = Math.floor(r.restanteMs / 1000);
      el.textContent = Math.floor(s / 86400) + 'd ' + pad(Math.floor(s % 86400 / 3600)) + 'h ' + pad(Math.floor(s % 3600 / 60)) + 'min ' + pad(s % 60) + 's';
    }
    pinta(); var t = setInterval(pinta, 1000);
    // corrige relógio errado do aparelho com a data do servidor
    try { fetch(location.href, { method: 'HEAD', cache: 'no-store' }).then(function (x) {
      var d = Date.parse(x.headers.get('Date')); if (d) { skew = d - Date.now(); pinta(); } }).catch(function () {}); } catch (e) {}
    return function () { clearInterval(t); };
  }
  var api = { proximaAula: proximaAula, montarContador: montarContador };
  if (typeof module !== 'undefined') module.exports = api; else root.OCContador = api;
})(typeof window !== 'undefined' ? window : this);
