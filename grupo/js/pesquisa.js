(function (root) {
  // Perguntas e opções literais de docs/copy/obrigado.txt. As chaves e as letras são as mesmas da função SQL oc_registrar.
  var PERGUNTAS = [
    { k: 'conhecia_ellen', t: function () { return 'Você já conhecia a Ellen?'; }, o: [
      ['a', 'Sim, já fui aluna ou mentorada dela'], ['b', 'Sim, já acompanho nas redes'], ['c', 'Não, conheci agora']] },
    { k: 'atuacao', t: function () { return 'Onde você atua hoje?'; }, o: [
      ['a', 'Farmácia oncológica hospitalar ou clínica de Oncologia'], ['b', 'Farmácia hospitalar em outra área'],
      ['c', 'Drogaria ou farmácia de manipulação'], ['d', 'Pesquisa clínica'], ['e', 'Indústria farmacêutica'],
      ['f', 'Sou estudante de Farmácia'], ['g', 'Outra profissão da saúde'], ['h', 'Não atuo na área da saúde']] },
    { k: 'momento', t: function () { return 'Em que momento você está na Oncologia?'; }, o: [
      ['a', 'Ainda não atuo, mas quero entrar na área'], ['b', 'Estou começando agora na Oncologia'],
      ['c', 'Já atuo há algum tempo, mas sinto que confiro mais do que decido'],
      ['d', 'Já tenho pós ou experiência e quero me atualizar e ser referência']] },
    { k: 'renda', t: function () { return 'Qual é a sua renda mensal hoje?'; }, o: [
      ['a', 'Sem renda no momento'], ['b', 'Até R$ 3.000'], ['c', 'De R$ 3.001 a R$ 5.000'],
      ['d', 'De R$ 5.001 a R$ 7.000'], ['e', 'De R$ 7.001 a R$ 10.000'], ['f', 'Acima de R$ 10.000']] },
    { k: 'cartao', t: function () { return 'Você tem acesso a cartão de crédito para compras online?'; }, o: [
      ['a', 'Sim, tenho cartão próprio'], ['b', 'Sim, posso usar o de um familiar'], ['c', 'Não tenho acesso a cartão']] },
    { k: 'interesse', t: function (vagas) { return 'Você tem interesse em garantir uma das ' + vagas + ' vagas na condição especial da Oncoclass quando ela for liberada no grupo?'; }, o: [
      ['a', 'Sim, quero garantir minha vaga assim que abrir'], ['b', 'Talvez, quero ver a condição antes'],
      ['c', 'Não, por enquanto só quero acompanhar']] }
  ];

  // índice da primeira pergunta sem resposta; -1 quando todas foram respondidas
  function proxima(r) {
    for (var i = 0; i < PERGUNTAS.length; i++) if (!r[PERGUNTAS[i].k]) return i;
    return -1;
  }

  // mesma regra da função SQL: quente = interesse "sim" + renda acima de 3 mil + cartão (próprio ou de familiar)
  function qualifica(r) {
    if (r.interesse === 'a' && 'cdef'.indexOf(r.renda) >= 0 && r.renda && 'ab'.indexOf(r.cartao) >= 0 && r.cartao) return 'quente';
    if (r.interesse === 'a' || r.interesse === 'b') return 'morno';
    return 'frio';
  }

  var api = { PERGUNTAS: PERGUNTAS, proxima: proxima, qualifica: qualifica };
  if (typeof module !== 'undefined') { module.exports = api; return; }
  root.OCPesquisa = api;
})(typeof window !== 'undefined' ? window : this);
