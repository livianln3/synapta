const form = document.getElementById("routineForm");
const chatContainer = document.getElementById("chat-container");

function addMessage(text, sender) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);

  msg.innerHTML = text.replace(/\n/g, "<br>");

  chatContainer.appendChild(msg);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  if (sender === "ai") {
    localStorage.setItem("ultimaRotinaIA", text);
    console.log("Rotina da IA salva no localStorage:", text);
  }
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
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: prompt }),
  });

  // pega o texto cru e o content-type
  const rawText = await res.text();
  const contentType = res.headers.get("content-type") || "";

  console.log("Resposta bruta do /api/chat:", rawText);
  console.log("Content-Type:", contentType, "Status:", res.status);

  if (!res.ok) {
    // servidor respondeu com erro HTTP (404/500 etc)
    console.error("API retornou status:", res.status);
    addMessage("Erro: a API retornou status " + res.status, "ai");
  } else if (contentType.includes("application/json")) {
    // resposta JSON normal
    try {
      const data = JSON.parse(rawText);
      addMessage(data.reply, "ai");
    } catch (err) {
      console.error("Erro ao fazer parse do JSON:", err);
      addMessage("Erro ao processar resposta JSON.", "ai");
    }
  } else {
    // recebeu HTML/Texto — evita crash ao tentar parsear JSON
    try {
      // às vezes o servidor envia JSON mas com content-type errado
      const maybeJson = JSON.parse(rawText);
      addMessage(maybeJson.reply || rawText, "ai");
    } catch (e) {
      console.error("Resposta inesperada (não JSON).", e);
      addMessage("Erro: resposta da API não é JSON. Veja console para detalhes.", "ai");
    }
  }
} catch (err) {
  console.error("Erro no fetch:", err);
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
