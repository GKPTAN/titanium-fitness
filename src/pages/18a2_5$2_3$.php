<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Urbanist:ital,wght@0,100..900;1,100..900&family=Voces&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://gkptan.github.io/titanium-fitness/src/style/reset/reset.css">
    <link rel="stylesheet" href="https://gkptan.github.io/titanium-fitness/src/style/registro.css">
    <link rel="stylesheet" href="https://gkptan.github.io/titanium-fitness/src/style/responsive/registro_responsivo.css">
    <title>Document</title>
</head>
<body>
    <div class="sign_up">
        <h1>Registra-se</h1>
        <form action="http://localhost/i323dma(yt).php" method="post" onsubmit="return validarForm()">
            <div class="name">
                <label for="name">Nome: </label>
                <input type="text" name="names" id="name" placeholder="Digite o seu nome..." minlength="3" maxlength="255" autocomplete="name" required>
            </div>
            <div class="age">
                <label for="age">Idade: </label>
                <input type="number" name="ages" id="age" min="12" placeholder="Digite a sua idade..." required>
            </div>
            <div class="gender">
                <span>Sexo:</span>
                <label for="masc">Masculino</label>
                <input type="radio" name="genres" id="masc" value="Masculino" required>
                <label for="fem">Feminino</label>
                <input type="radio" name="genres" id="fem" value="Feminino" required>
            </div>
            <div class="email">
                <label for="email">E-mail: </label>
                <input type="email" name="emails" id="email" placeholder="Digite o seu e-mail..." maxlength="255" autocomplete="email" required>
            </div>
            <?php 
                session_start();
                if (isset($_SESSION['erro'])) {
                    echo "<div class='erro-msg' style='color:red'>" . $_SESSION['erro'] . "</div>";
                    unset($_SESSION['erro']);
                }
            ?>
            <div class="password">
                <label for="password">senha: </label>
                <input type="password" name="password_user" id="password" placeholder="Digite a sua senha..." minlength="6" maxlength="15" required>
                <div class="reveal" id="reveal-first">
                    <img class="olho" src="https://gkptan.github.io/titanium-fitness/esconder.svg" alt="revelar senha e esconder senha">
                </div>
                <label for="confirm_password">confirme sua senha: </label>
                <input type="password" name="password_conf" id="confirm_password" placeholder="Confirme a sua senha..." minlength="6" maxlength="15" required>
                <div class="reveal" id="reveal-second">
                    <img class="olho-2" src="https://gkptan.github.io/titanium-fitness/esconder.svg" alt="revelar senha e esconder senha">
                </div>
            </div>
            <input type="submit" value="Enviar">
        </form>
    </div>

    <script src="https://gkptan.github.io/titanium-fitness/src/js/cadastro.js"></script>
</body>
</html>