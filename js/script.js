document.addEventListener("DOMContentLoaded", () => {
    let BACKEND_URL = "https://chatbot-consumidor-api.azurewebsites.net/perguntar-openai";

    const chatHistory = document.getElementById("chat-history");
    const userInput = document.getElementById("user-input");
    const sendBtn = document.getElementById("send-btn");
    const typingIndicator = document.getElementById("typing");
    const suggestionsContainer = document.querySelector(".suggestions");
    const avatarMontainha = document.querySelector(".avatar-container"); // Avatar grande
    const avatarOtavianinho = document.querySelector(".avatar-container-left"); // Avatar grande
    const themeLink = document.getElementById("theme-css");

    // Novos elementos para os avatares no cabeçalho
    const avatarHeaderMontainha = document.querySelector(".avatar-header-montainha");
    const avatarHeaderOtavianinho = document.querySelector(".avatar-header-otavianinho");

    let currentTheme = "montainha";
    let historico = [];
    let firstResponseReceived = false;

    setActiveTheme(); // Chama para definir o tema inicial e avatares

    // Mensagem fixa de boas-vindas
    const textoBoasVindas =
        "Olá! Sou seu assistente especializado em Direito do Consumidor. Fui criado para tirar suas dúvidas *apenas* sobre este tema, com base na legislação brasileira.\n\n" +
        "Você pode interagir comigo de duas formas:\n\n" +
        "* **Modo Montainha (IA Geral):** Pergunte o que quiser sobre Direito do Consumidor, e usarei a inteligência da OpenAI para te ajudar.\n" +
        "* **Modo Otavianinho (Informações Locais):** Faça perguntas específicas, e buscarei as respostas em nossos documentos e materiais locais, como leis e súmulas.";
    addMessage("bot", textoBoasVindas);

    // Listeners para os avatares grandes (para telas maiores)
    avatarMontainha.addEventListener("click", () => {
        if (currentTheme !== "montainha") {
            currentTheme = "montainha";
            themeLink.href = "css/styles-montainha.css";
            BACKEND_URL = "https://chatbot-consumidor-api.azurewebsites.net/perguntar-openai";
            setActiveTheme();
        }
    });

    avatarOtavianinho.addEventListener("click", () => {
        if (currentTheme !== "otavianinho") {
            currentTheme = "otavianinho";
            themeLink.href = "css/styles-otavianinho.css";
            BACKEND_URL = "https://chatbot-consumidor-api.azurewebsites.net/perguntar-pdf";
            setActiveTheme();
        }
    });

    // Listeners para os avatares no cabeçalho (para telas menores)
    avatarHeaderMontainha.addEventListener("click", () => {
        if (currentTheme !== "montainha") {
            currentTheme = "montainha";
            themeLink.href = "css/styles-montainha.css";
            BACKEND_URL = "https://chatbot-consumidor-api.azurewebsites.net/perguntar-openai";
            setActiveTheme();
        }
    });

    avatarHeaderOtavianinho.addEventListener("click", () => {
        if (currentTheme !== "otavianinho") {
            currentTheme = "otavianinho";
            themeLink.href = "css/styles-otavianinho.css";
            BACKEND_URL = "https://chatbot-consumidor-api.azurewebsites.net/perguntar-pdf";
            setActiveTheme();
        }
    });

    function setActiveTheme() {
        // Lógica para avatares grandes
        if (currentTheme === "montainha") {
            avatarMontainha.classList.add("active");
            avatarOtavianinho.classList.remove("active");
        } else {
            avatarOtavianinho.classList.add("active");
            avatarMontainha.classList.remove("active");
        }

        // Lógica para avatares do cabeçalho
        if (currentTheme === "montainha") {
            avatarHeaderMontainha.classList.add("active");
            avatarHeaderOtavianinho.classList.remove("active");
        } else {
            avatarHeaderOtavianinho.classList.add("active");
            avatarHeaderMontainha.classList.remove("active");
        }
    }

    function addMessage(role, text, source = null) {
        const messageWrapper = document.createElement("div");
        messageWrapper.classList.add(role);

        if (role === "bot" && source) {
            const iconSpan = document.createElement("span");
            iconSpan.classList.add("source-icon");
            iconSpan.title = source === "pdf" ? "Fonte: PDF" : "Fonte: OpenAI";
            iconSpan.textContent = source === "pdf" ? "📄" : "🤖";
            messageWrapper.appendChild(iconSpan);
        }

        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message");
        messageDiv.textContent = text;

        messageWrapper.appendChild(messageDiv);
        chatHistory.appendChild(messageWrapper);

        chatHistory.scroll({
            top: chatHistory.scrollHeight,
            behavior: "smooth",
        });

        historico.push({ autor: role === "user" ? "user" : "bot", mensagem: text });
    }

    function renderSuggestions(sugestoes) {
        if (!firstResponseReceived) {
            suggestionsContainer.innerHTML = "";
            return;
        }

        suggestionsContainer.innerHTML = "";
        sugestoes.forEach((sugestao) => {
            const btn = document.createElement("button");
            btn.className = "suggestion-btn";
            btn.textContent = sugestao;
            btn.addEventListener("click", () => {
                addMessage("user", sugestao);
                typingIndicator.style.display = "block";
                sendQuestionToBackend(sugestao);
            });
            suggestionsContainer.appendChild(btn);
        });
    }

    async function sendQuestionToBackend(question) {
        try {
            const response = await fetch(BACKEND_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ pergunta: question, historico }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `Erro HTTP: ${response.status}`);
            }

            const data = await response.json();
            typingIndicator.style.display = "none";

            const fonte = BACKEND_URL.includes("pdf") ? "pdf" : "openai";
            addMessage("bot", data.resposta || "Desculpe, não consegui entender.", fonte);
            firstResponseReceived = true;

            if (data.sugestoes && Array.isArray(data.sugestoes)) {
                renderSuggestions(data.sugestoes);
            }
        } catch (error) {
            typingIndicator.style.display = "none";
            const errorMessage = error.message || "Erro desconhecido.";
            addMessage("bot", `Erro: ${errorMessage}`);
            console.error("Erro ao enviar pergunta:", error);
        }
    }

    sendBtn.addEventListener("click", () => {
        const question = userInput.value.trim();
        if (!question) return;

        addMessage("user", question);
        userInput.value = "";
        typingIndicator.style.display = "block";
        sendQuestionToBackend(question);
    });

    userInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            sendBtn.click();
        }
    });

    /*
    // Código de verificação de conexão (descomente se quiser usar)
    const checkConnectionBtn = document.getElementById("check-connection-btn");
    const statusMessage = document.getElementById("status-message");

    checkConnectionBtn.addEventListener("click", async () => {
      statusMessage.textContent = "Verificando...";
      try {
        const response = await fetch(BACKEND_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ pergunta: "teste de conexão" }),
        });

        if (response.ok) {
          statusMessage.textContent = "✅ Conexão com o servidor estabelecida.";
          statusMessage.style.color = "green";
        } else {
          statusMessage.textContent = "❌ Erro na resposta do servidor.";
          statusMessage.style.color = "red";
        }
      } catch (error) {
        statusMessage.textContent = "❌ Erro ao conectar com o servidor.";
        statusMessage.style.color = "red";
        console.error("Erro de conexão:", error);
      }
    });
    */
});