const input = document.getElementById("inputText");
const button = document.getElementById("button");
const chatContainer = document.getElementById("chat-container");

function addMessage(text, sender) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  msg.textContent = text;
  chatContainer.appendChild(msg);
  chatContainer.scrollTop = chatContainer.scrollHeight; // sempre desce pro fim
}

button.addEventListener("click", async () => {
  const userInput = input.value.trim();
  if (!userInput) return;

  // Adiciona mensagem do usuário
  addMessage(userInput, "user");
  input.value = "";

  try {
    const res = await fetch("http://localhost:3001/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userInput }),
    });

    const data = await res.json();

    // Adiciona resposta da IA
    addMessage(data.reply, "ai");
  } catch (err) {
    addMessage("Erro ao conectar com a API.", "ai");
  }
});
