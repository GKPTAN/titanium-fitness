const olho = document.getElementById('revelar');
olho.addEventListener('click', () => {
    const senha = document.getElementById('pass_user');
    olho.src = olho.src.includes("src/image/esconder.svg") ? "../image/revelar.svg" : "../image/esconder.svg";
    if (senha.type === "password") {
        senha.type = "text";
    } else {
        senha.type = "password";
    };
});

function hideLoading(loading, span) {
    loading.style.display = "none";
    span.style.display = 'block';
};

function showAndHideSpan(aviso) {
    aviso.style.opacity = "1";
    setTimeout(() => {
        aviso.style.opacity = "0";
        aviso.innerHTML = "";
    }, 6000);
};

document.querySelector("form").addEventListener("submit", async function (event) {
    event.preventDefault();

    const loading = document.querySelector(".sk-chase");
    const span = document.querySelector("button span");
    const spanErrors = document.querySelectorAll(".error-span");
    const avisoError = document.querySelector(".error");
    loading.style.display = "block";
    span.style.display = 'none';

    const formData = {
        email_user: document.getElementById("email_user").value,
        password_user: document.getElementById("pass_user").value
    };

    try {
        const response = await fetch("https://titanium-fitness.vercel.app/api/auth/login", {
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
            if (result.message === "E-mail ou senha incorretos.") {
                spanErrors.forEach((spanError) => {
                    spanError.style.opacity = "1";
                });
                hideLoading(loading, span);
                return;
            };
            avisoError.innerHTML = result.message || "e-mail ou senha errados! Verifique os dados e tente novamente";
            showAndHideSpan(avisoError);
            hideLoading(loading, span);
        };
    } catch (error) {
        console.error("Erro ao enviar dados!", error);
        avisoError.innerHTML = "Erro ao fazer login, tente novamente mais tarde ou contate o suporte.";
        showAndHideSpan(avisoError);
        hideLoading(loading, span);
    };
});