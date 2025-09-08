const form = document.getElementById("routineForm");
const chatContainer = document.getElementById("chat-container");

function addMessage(text, sender) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);

  msg.innerHTML = text.replace(/\n/g, "<br>");

  chatContainer.appendChild(msg);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}


form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = {
    age: document.getElementById("age").value,
    wakeTime: document.getElementById("wakeTime").value,
    sleepTime: document.getElementById("sleepTime").value,
    goals: document.getElementById("goals").value,
    fixedTasks: document.getElementById("fixedTasks").value,
  };

  // Criar prompt estruturado
  const prompt = `
Crie uma rotina diária para uma pessoa com autismo de ${formData.age} anos.
Ela prefere acordar às ${formData.wakeTime} e dormir às ${formData.sleepTime}.
Os compromissos fixos são: ${formData.fixedTasks || "nenhum"}.
Os objetivos principais do dia são: ${formData.goals || "não especificados"}.
Organize a rotina em formato de lista com horários aproximados, clara e objetiva.
  `;

  addMessage("Gerando rotina personalizada...", "user");

  try {
    const res = await fetch("http://localhost:3001/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: prompt }),
    });

    const data = await res.json();
    addMessage(data.reply, "ai");
  } catch (err) {
    addMessage("Erro ao conectar com a API.", "ai");
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const forms = document.getElementById("forms");
  const toggleBtn = document.getElementById("toggleForm");
  const routineForm = document.getElementById("routineForm");

  // Ao enviar o formulário -> recolhe parcialmente
  routineForm.addEventListener("submit", () => {
    setTimeout(() => {
      forms.classList.add("collapsed");
      toggleBtn.textContent = "▼ Mostrar formulário";
    }, 500);
  });

  // Botão alterna entre mostrar/recolher
  toggleBtn.addEventListener("click", () => {
    forms.classList.toggle("collapsed");
    if (forms.classList.contains("collapsed")) {
      toggleBtn.textContent = "▼ Mostrar formulário";
    } else {
      toggleBtn.textContent = "▲ Recolher formulário";
    }
  });
});
