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

    // Elementos para os avatares no cabeçalho
    const avatarHeaderMontainha = document.querySelector(".avatar-header-montainha");
    const avatarHeaderOtavianinho = document.querySelector(".avatar-header-otavianinho");

    let currentTheme = "montainha";
    let historico = [];
    let firstResponseReceived = false;

    // Mensagens de apresentação de cada avatar
    const montainhaWelcomeMessage = "Olá! Eu sou Montainha, seu assistente virtual em Direito do Consumidor. Minha função é fornecer **orientações claras e abrangentes**, buscando informações em uma **vasta base de conhecimento externa**. Estou à disposição para suas perguntas gerais sobre o tema.";
    const otavianinhoWelcomeMessage = "Prezado(a) usuário(a), sou Otavianinho, o especialista em Direito do Consumidor. Minha expertise reside em fornecer **informações pontuais e fundamentadas**, consultando nossa **base de dados interna**, que inclui a legislação brasileira, súmulas e normativas de bancos locais. Para dúvidas que exigem precisão legal e detalhes específicos, pode contar comigo.";

    setActiveTheme(); // Chama para definir o tema inicial e avatares

    // Funções executadas na inicialização para definir a mensagem de boas-vindas inicial
    if (currentTheme === "montainha") {
        addMessage("bot", montainhaWelcomeMessage);
    } else { // Se o tema inicial for Otavianinho (caso você mude o padrão no futuro)
        addMessage("bot", otavianinhoWelcomeMessage);
    }

    // Listeners para os avatares grandes (para telas maiores)
    avatarMontainha.addEventListener("click", () => {
        if (currentTheme !== "montainha") {
            currentTheme = "montainha";
            themeLink.href = "css/styles-montainha.css";
            BACKEND_URL = "https://chatbot-consumidor-api.azurewebsites.net/perguntar-openai";
            historico = []; // Limpa o histórico ao trocar de modo
            chatHistory.innerHTML = ''; // Limpa as mensagens anteriores
            addMessage("bot", montainhaWelcomeMessage); // Adiciona a mensagem do Montainha
            setActiveTheme();
        }
    });

    avatarOtavianinho.addEventListener("click", () => {
        if (currentTheme !== "otavianinho") {
            currentTheme = "otavianinho";
            themeLink.href = "css/styles-otavianinho.css";
            BACKEND_URL = "https://chatbot-consumidor-api.azurewebsites.net/perguntar-pdf";
            historico = []; // Limpa o histórico ao trocar de modo
            chatHistory.innerHTML = ''; // Limpa as mensagens anteriores
            addMessage("bot", otavianinhoWelcomeMessage); // Adiciona a mensagem do Otavianinho
            setActiveTheme();
        }
    });

    // Listeners para os avatares no cabeçalho (para telas menores)
    avatarHeaderMontainha.addEventListener("click", () => {
        if (currentTheme !== "montainha") {
            currentTheme = "montainha";
            themeLink.href = "css/styles-montainha.css";
            BACKEND_URL = "https://chatbot-consumidor-api.azurewebsites.net/perguntar-openai";
            historico = []; // Limpa o histórico ao trocar de modo
            chatHistory.innerHTML = ''; // Limpa as mensagens anteriores
            addMessage("bot", montainhaWelcomeMessage); // Adiciona a mensagem do Montainha
            setActiveTheme();
        }
    });

    avatarHeaderOtavianinho.addEventListener("click", () => {
        if (currentTheme !== "otavianinho") {
            currentTheme = "otavianinho";
            themeLink.href = "css/styles-otavianinho.css";
            BACKEND_URL = "https://chatbot-consumidor-api.azurewebsites.net/perguntar-pdf";
            historico = []; // Limpa o histórico ao trocar de modo
            chatHistory.innerHTML = ''; // Limpa as mensagens anteriores
            addMessage("bot", otavianinhoWelcomeMessage); // Adiciona a mensagem do Otavianinho
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

    // Função que adiciona as mensagens ao chat
    // Esta função agora prepara o contêiner da mensagem para o streaming
    function addMessage(role, text, source = null, isStreaming = false) {
        const messageWrapper = document.createElement("div");
        messageWrapper.classList.add(role);

        if (role === "bot" && source) {
            const iconSpan = document.createElement("span");
            iconSpan.classList.add("source-icon");
            iconSpan.title = source === "pdf" ? "Fonte: PDF" : "Fonte: IA Geral";
            iconSpan.textContent = source === "pdf" ? "📄" : "🤖";
            messageWrapper.appendChild(iconSpan);
        }

        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message");
        // Se não for streaming, renderiza o texto completo de uma vez, com negrito.
        // Se for streaming, o texto será adicionado incrementalmente.
        if (!isStreaming) {
            messageDiv.innerHTML = text.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
        }
        
        messageWrapper.appendChild(messageDiv);
        chatHistory.appendChild(messageWrapper);

        chatHistory.scroll({
            top: chatHistory.scrollHeight,
            behavior: "smooth",
        });

        // Para mensagens não-streaming (como as de boas-vindas), adicionar ao histórico completo
        if (!isStreaming) {
            historico.push({ autor: role === "user" ? "user" : "bot", mensagem: text });
        }
        
        return messageDiv; // Retorna o elemento para que o streaming possa atualizá-lo
    }

    function renderSuggestions(sugestoes) {
        // Agora as sugestões serão sempre renderizadas quando o evento 'end' chegar
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
        firstResponseReceived = true; // Garante que sugestões apareçam após a primeira resposta
    }

    // sendQuestionToBackend AGORA LÊ O STREAM
    async function sendQuestionToBackend(question) {
        typingIndicator.style.display = "block"; // Sempre mostra digitando no início

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

            // Inicia a criação da mensagem do bot na tela para receber o stream
            const fonte = BACKEND_URL.includes("pdf") ? "pdf" : "openai";
            const botMessageDiv = addMessage("bot", "", fonte, true); // O 'true' indica que é uma mensagem streaming

            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let buffer = "";
            let fullBotResponse = ""; // Para armazenar a resposta completa para o histórico

            while (true) {
                const { value, done } = await reader.read();
                if (done) {
                    break;
                }
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop(); // Guarda a última linha incompleta no buffer

                for (const line of lines) {
                    if (line.trim() === "") continue; // Ignora linhas vazias
                    try {
                        const data = JSON.parse(line);
                        if (data.type === "text") {
                            botMessageDiv.innerHTML += data.content.replace(/\*(.*?)\*/g, '<strong>$1</strong>'); // Adiciona e interpreta negrito
                            fullBotResponse += data.content;
                            chatHistory.scroll({ top: chatHistory.scrollHeight, behavior: "smooth" });
                        } else if (data.type === "end") {
                            // Fim do stream, processa as sugestões
                            renderSuggestions(data.sugestoes);
                            typingIndicator.style.display = "none"; // Esconde o digitando
                            // Adiciona a resposta completa ao histórico após o fim do stream
                            historico.push({ autor: "bot", mensagem: fullBotResponse });
                            break; // Sai do loop after processing end
                        } else if (data.type === "error") {
                            botMessageDiv.innerHTML += `Erro: ${data.message}`;
                            typingIndicator.style.display = "none";
                            historico.push({ autor: "bot", mensagem: `Erro: ${data.message}` });
                            console.error("Erro do backend via stream:", data.message);
                            break; // Sai do loop
                        }
                    } catch (e) {
                        console.error("Erro ao fazer parse do JSONL:", e, "Linha:", line);
                    }
                }
            }
        } catch (error) {
            typingIndicator.style.display = "none";
            const errorMessage = error.message || "Erro desconhecido.";
            addMessage("bot", `Erro: ${errorMessage}`);
            console.error("Erro ao enviar pergunta (fetch ou stream inicial):", error);
            // Certifica-se de que a mensagem de erro está no histórico se a requisição falhou antes de iniciar o stream
            historico.push({ autor: "bot", mensagem: `Erro: ${errorMessage}` });
        }
    }

    sendBtn.addEventListener("click", () => {
        const question = userInput.value.trim();
        if (!question) return;

        addMessage("user", question);
        userInput.value = "";
        sendQuestionToBackend(question); // A função já cuida do 'digitando...'
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