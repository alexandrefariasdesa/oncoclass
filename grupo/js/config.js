// Config pública. A chave anon só consegue chamar oc_registrar e oc_painel (RLS fechada nas tabelas).
window.OC = {
  vagas: 17,
  grupo: "https://chat.whatsapp.com/L56ZxlonI47KlZZ9WC7lxH",
  aula: { diaSemana: 3, hora: "19:30", duracaoMin: 90 },   // quarta, 19h30 de Brasília
  pixel: "1606696444389111",
  privacidade: "",                                          // URL da política; vazio = link não aparece
  url: "https://dbususnqmikxfllvtitl.supabase.co/rest/v1/rpc/oc_registrar",
  painelUrl: "https://dbususnqmikxfllvtitl.supabase.co/rest/v1/rpc/oc_painel",
  key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRidXN1c25xbWlreGZsbHZ0aXRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExNDI2MzcsImV4cCI6MjEwNjcxODYzN30.0TjGZ5ao1dY3TJOfzNuS4vDzc55lAUFdzYntqDw79gU"
};
