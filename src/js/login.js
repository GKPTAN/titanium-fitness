const olho = document.getElementById('revelar');
olho.addEventListener('click', () => {
    const senha = document.getElementById('pass_user');
    olho.src = olho.src.includes("https://gkptan.github.io/titanium-fitness/esconder.svg") ? "https://gkptan.github.io/titanium-fitness/revelar.svg" : "https://gkptan.github.io/titanium-fitness/esconder.svg";
    if (senha.type === "password") {
        senha.type = "text";
    } else {
        senha.type = "password";
    };
});