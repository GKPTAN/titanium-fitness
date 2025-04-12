const aviso = document.querySelector("div.aviso span");

function hideLoading(loading, span) {
  loading.style.display = "none";
  span.style.display = 'block';
};

function showAndHideSpan(aviso) {
  if (aviso.classList.contains("sucess")) {
    aviso.classList.remove("sucess");
  } else {
    aviso.classList.remove("error");
  };
  aviso.classList.add("error");
  aviso.style.opacity = "1";
  setTimeout(() => {
      aviso.style.opacity = "0";
      aviso.innerHTML = "";
  }, 6000);
};

async function getUserId() {
  try {
    const response = await fetch("https://titanium-fitness.vercel.app/api/auth/user_id", {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Erro ao buscar o ID do usuário");
    }

    const data = await response.json();
    return data.userId;
  } catch (error) {
    console.error("Erro ao buscar o ID do usuário:", error);
    return null;
  };
};

document.querySelector("form").addEventListener("submit", async function (event) {
    event.preventDefault();

    const loading = document.querySelector(".sk-chase");
    const span = document.querySelector("button span");
    loading.style.display = "block";
    span.style.display = 'none';

    const userId = await getUserId();
    console.log("user_id: ", userId);
    const code = document.getElementById("codigo").value;

    const formData = {
      code: code,
      userId: userId,
    };

    try {
      const response = await fetch("https://titanium-fitness.vercel.app/api/auth/verification", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();

      if (response.ok) {
        aviso.innerHTML = result.message;

        if (aviso.classList.contains("error")) {
          aviso.classList.remove("error");
        };

        aviso.classList.add("sucess");
        aviso.style.opacity = "1";

        if (result.redirectUrl) {
          window.location.href = result.redirectUrl;
        }
      } else {
        console.error("Erro na validação:", result.error);
        aviso.innerHTML = result.message || "Erro ao verificar. insira o código correto e tente novamente.";
        showAndHideSpan(aviso);
        hideLoading(loading, span);
      };
    } catch (error) {
      console.error("Erro ao enviar os dados:", error);
      aviso.innerHTML = "Erro de verificação. Tente novamente ou contate o suporte.";
      showAndHideSpan(aviso);
      hideLoading(loading, span);
    };
  });