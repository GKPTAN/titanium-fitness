function getCookie(name) {
    const cookies = document.cookie.split("; ");
    
    for (let i = 0; i < cookies.length; i++) {
    
        const cookie = cookies[i].split("=");
    
        if (cookie[0] === name) {
            return decodeURIComponent(cookie[1]);
        }
    }   
    return null;
} 

document.querySelector("form").addEventListener("submit", async function(event) {
    event.preventDefault();

    const userId = getCookie("user_id");
    const code = document.getElementById("codigo").value;

    const formData = {
        code: code,
        userId: userId,
    };

    try {
        
        const response = await fetch("https://titanium-fitness.vercel.app/api/verification", {
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