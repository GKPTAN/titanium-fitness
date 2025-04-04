window.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const city = params.get("city") || "cidade desconhecida";
    const region = params.get("region") || "região desconhecida";

    const paragraph = document.querySelector(".verify-acess p");
    paragraph.innerHTML = `A sua conta foi acessada em <strong>${city}</strong>, <strong>${region}</strong>.`;

    document.querySelector("#confirmed").addEventListener("click", () => {
        const thanks = document.querySelector(".confirmado");
        const verify = document.querySelector(".verify-acess");
        verify.style.left = "-50%"
        thanks.style.left = "50%" 
    });

    document.querySelector("#not_confirmed").addEventListener("click", () => {
     // lógica de recuperação de conta aqui
    });
});