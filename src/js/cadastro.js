const olho1 = document.getElementsByClassName("olho")[0];

olho1.addEventListener("click", () => {
    olho1.src = olho1.src.includes("https://gkptan.github.io/titanium-fitness/esconder.svg") ? "https://gkptan.github.io/titanium-fitness/revelar.svg" : "https://gkptan.github.io/titanium-fitness/esconder.svg";
    console.log("chegou");
    const password1 = document.getElementById("password");

    if (password1.type === "password") {
        password1.type = "text";
    } else {
        password1.type = "password";
    };
});

const olho2 = document.getElementsByClassName("olho-2")[0];

olho2.addEventListener("click", () => {
    olho2.src = olho2.src.includes("https://gkptan.github.io/titanium-fitness/esconder.svg") ? "https://gkptan.github.io/titanium-fitness/revelar.svg" : "https://gkptan.github.io/titanium-fitness/esconder.svg";
    const password2 = document.getElementById("confirm_password");

    if (password2.type === "password") {
        password2.type = "text";
    } else {
        password2.type = "password";
    };
});

function validarForm() {
    const ageInput = document.getElementById('age');
    const age = ageInput.value;
    const emailInput = document.getElementById("email");
    const email = emailInput.value;
    const nameInput = document.getElementById("name");
    const name = nameInput.value;
    const senhaInput = document.getElementById("password");
    const senha = senhaInput.value;
    const passwordConfirm = document.getElementById("confirm_password");
    let valido = true;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const regexSpace = /\s{2,}/g;
    const regexName = /[a-zA-Z]/;

    if (name.trim().length === 0) {
        nameInput.setCustomValidity("o seu nome não pode conter apenas espaços!");
        nameInput.reportValidity();
        valido = false;
    };

    if (name.trim().length < 3 || name.trim().length > 255) {
        nameInput.setCustomValidity("o seu nome tem que ter no minimo 3 caracteres e no máximo 255 caracteres!");
        nameInput.reportValidity();
        valido = false;
    }

    if (regexSpace.test(name)){
        nameInput.setCustomValidity("O seu nome não pode conter mais de dois espaços seguidos!");
        nameInput.reportValidity();
        valido = false;
    };

    if (!regexName.test(name)) {
        nameInput.setCustomValidity("O seu nome não pode conter somente números, precisa ter letras!");
        nameInput.reportValidity();
        valido = false;
    }

    if (isNaN(age)) {
        ageInput.setCustomValidity("idade inválida!");
        ageInput.reportValidity();
        valido = false;
    }

    if (age < 12 || age > 100) {
        ageInput.setCustomValidity("não temos suporte para essa idade!");
        ageInput.reportValidity();
        valido = false;
    }

    if (!regex.test(email)) {
        emailInput.setCustomValidity("Formato de e-mail inválido!");
        emailInput.reportValidity();
        valido = false;
    };

    if (senha.trim().length === 0) {
        senhaInput.setCustomValidity("sua senha não pode conter espaços!");
        senhaInput.reportValidity();
        valido = false;
    };

    if (senha !== passwordConfirm.value) {
        passwordConfirm.setCustomValidity("Senhas não coincidem, por favor, confirme sua senha!");
        passwordConfirm.reportValidity();
        valido = false;
    }

    if (senha.length < 6 || senha.length > 15) {
        senhaInput.setCustomValidity("sua senha precisa ter no mínimo 6 caracteres e no máximo 15 caracteres!");
        senhaInput.reportValidity();
        valido = false;
    }

    document.getElementById("confirm_password").addEventListener("input", function () {
        this.setCustomValidity("");
    });
    document.getElementById("name").addEventListener("input", function () {
        this.setCustomValidity("");
    });
    document.getElementById("email").addEventListener("input", function () {
        this.setCustomValidity("");
    });
    document.getElementById("password").addEventListener("input", function () {
        this.setCustomValidity("");
    });
    document.getElementById('age').addEventListener("input", function () {
        this.setCustomValidity("");
    });

    return valido;
};