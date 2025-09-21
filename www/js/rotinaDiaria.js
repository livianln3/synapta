document.addEventListener('DOMContentLoaded', function () {
  console.log('rotinaDiaria.js carregado');

  // Global error catcher
  window.addEventListener('error', function (e) {
    console.error('Erro global:', e.message, 'file:', e.filename, 'line:', e.lineno);
  });

  const tarefasContainer = document.getElementById('tarefas');
  if (!tarefasContainer) {
    console.error('#tarefas não encontrado no DOM');
    return;
  }

  let rotinaTexto = localStorage.getItem('ultimaRotinaIA');
  console.log('Rotina carregada do localStorage:', rotinaTexto);

  if (!rotinaTexto) {
    tarefasContainer.innerHTML = "<p>Nenhuma rotina encontrada. Gere no index primeiro.</p>";
    return;
  }

  // Normaliza texto
  rotinaTexto = rotinaTexto.replace(/<br\s*\/?>/gi, '\n')
                           .replace(/<\/?[^>]+(>|$)/g, '')
                           .replace(/\u00A0/g, ' ');

  const lines = rotinaTexto.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  const diaRegex = /(segunda|terça|quarta|quinta|sexta|sábado|domingo)/i;
  const timeRegex = /(\d{1,2}:\d{2})\s*[-–—:.]\s*(.+)/;

  let diaAtual = '';

  for (const line of lines) {
  const diaMatch = line.match(diaRegex);
  if (diaMatch) {
    diaAtual = diaMatch[1].toLowerCase();
    continue;
  }

  const m = line.match(timeRegex);
  const card = document.createElement('div');
  card.className = 'tarefa-card';
  card.dataset.dia = diaAtual || 'segunda';

  // Placeholder verde horizontal
  const imgPlaceholder = document.createElement('div');
  imgPlaceholder.className = 'img-placeholder';
  card.appendChild(imgPlaceholder);

  // Conteúdo do card
  const conteudo = document.createElement('div');
  conteudo.className = 'conteudo-tarefa';

  const tituloEl = document.createElement('h3');
  const horarioEl = document.createElement('p');

  if (m) {
    horarioEl.textContent = m[1];
    tituloEl.textContent = m[2].replace(/^\*+|\*+$/g, '').trim();
  } else {
    horarioEl.textContent = '';
    tituloEl.textContent = line;
  }

  conteudo.appendChild(tituloEl);
  conteudo.appendChild(horarioEl);
  card.appendChild(conteudo);

  // Botões na parte inferior
  const btnContainer = document.createElement('div');
  btnContainer.className = 'card-buttons';

  const checkBtn = document.createElement('button');
  checkBtn.className = 'check-btn';
  checkBtn.textContent = '✔️';

  const notifBtn = document.createElement('button');
  notifBtn.className = 'notif-btn';
  notifBtn.textContent = '🔔';

  btnContainer.appendChild(checkBtn);
  btnContainer.appendChild(notifBtn);
  card.appendChild(btnContainer);

  tarefasContainer.appendChild(card);
}

  // Configura navegação por dias
  const botoes = document.querySelectorAll('#dias-nav button');
  if (botoes.length > 0) {
    botoes.forEach(btn => {
      btn.addEventListener('click', () => {
        botoes.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const diaSelecionado = btn.dataset.dia;

        document.querySelectorAll('.tarefa-card').forEach(card => {
          card.style.display = card.dataset.dia === diaSelecionado ? 'block' : 'none';
        });
      });
    });

    // Inicializa mostrando o primeiro dia
    botoes[0].classList.add('active');
    const diaInicial = botoes[0].dataset.dia;
    document.querySelectorAll('.tarefa-card').forEach(card => {
      card.style.display = card.dataset.dia === diaInicial ? 'block' : 'none';
    });
  }
});
