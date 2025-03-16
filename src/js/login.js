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