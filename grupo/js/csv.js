(function (root) {
  // Células de CSV seguras: prefixa com ' o que começaria uma fórmula (= + - @ tab CR) e protege separador, aspas e quebra de linha.
  // Separador ponto e vírgula, que é o que o Excel em português do Brasil espera.
  function celulaCsv(v) {
    v = v == null ? '' : String(v);
    if (/^[=+\-@\t\r]/.test(v)) v = "'" + v;
    return /[";\n\r,]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
  }
  function montaCsv(linhas, cols) {
    return [cols.join(';')].concat(linhas.map(function (l) { return cols.map(function (c) { return celulaCsv(l[c]); }).join(';'); })).join('\n');
  }
  var api = { celulaCsv: celulaCsv, montaCsv: montaCsv };
  if (typeof module !== 'undefined') module.exports = api; else root.OCCsv = api;
})(typeof window !== 'undefined' ? window : this);
