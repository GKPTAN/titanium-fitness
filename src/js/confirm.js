async function getUserId() {
    try {
        const response = await fetch("https://localhost:3000/api/user-id", {
            method: "GET",
            credentials: "include"
        });

        if (!response.ok) {
            throw new Error("Erro ao buscar o ID do usuário");
        };

        const data = await response.json();
        return data.userId;
    } catch (error) {
        console.error("Erro ao buscar o ID do usuário:", error);
        return null;
    };
};

document.querySelector("form").addEventListener("submit", async function(event) {
    event.preventDefault();

    const userId = await getUserId();
    console.log("user_id: ", userId);
    const code = document.getElementById("codigo").value;

    const formData = {
        code: code,
        userId: userId,
    };

    try {
        
        const response = await fetch("https://localhost:3000/api/verification", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message);

            if (result.redirectUrl) {
                window.location.href = result.redirectUrl;
            };
        } else {
            console.error("Erro na validação:", result.error);
            alert(result.message || "Erro ao verificar. insira o código correto e tente novamente.");
        };
    } catch (error) {
        console.error("Erro ao enviar os dados:", error);
        alert("Erro de verificação. Tente novamente ou contate o suporte.");
    };
});