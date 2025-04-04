const olho = document.getElementById('revelar');
olho.addEventListener('click', () => {
    const senha = document.getElementById('pass_user');
    olho.src = olho.src.includes("/image/esconder.svg") ? "/image/revelar.svg" : "/image/esconder.svg";
    if (senha.type === "password") {
        senha.type = "text";
    } else {
        senha.type = "password";
    };
});

document.querySelector("form").addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = {
        email_user: document.getElementById("email_user").value,
        password_user: document.getElementById("pass_user").value
    };

    try {
        const response = await fetch("https://titanium-fitness.vercel.app/api/login", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: "include",
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok) {
            if (result.redirectUrl) {
                window.location.href = result.redirectUrl;
            };
        } else {
            console.error("e-mail ou senha errados!");
            alert(result.message || "e-mail ou senha errados! Verifique os dados e tente novamente");
        }
    } catch (error) {
        console.error("Erro ao enviar dados!", error);
        alert("Erro ao fazer login, tente novamente mais tarde ou contate o suporte.");
    };
});