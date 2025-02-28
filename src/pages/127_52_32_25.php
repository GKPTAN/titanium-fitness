<?php
session_start();
$erro = $_SESSION['error_login'] ?? '';
unset($_SESSION['error_login']);
?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Urbanist:ital,wght@0,100..900;1,100..900&family=Voces&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://gkptan.github.io/titanium-fitness/src/style/login.css">
    <title>Login - Titanium Fitness</title>
</head>
<body>
    <div class="container">
        <h1>Login</h1>
        <?php if (!empty($erro)): ?>
            <p class="error"><?=htmlspecialchars($erro) ?></p>
        <?php endif; ?>
        <form class="login-form" action="http://localhost//cg{f23j4b.php" method="post">
            <input type="email" name="email" id="email_user" placeholder="E-mail" required>
            <input type="password" name="password" id="pass_user" placeholder="Senha" required>
            <div class="reveal">
                <img id="revelar" src="https://gkptan.github.io/titanium-fitness/esconder.svg" alt="esconder ou revelar senha">
            </div>
            <button class="btn" type="submit">Entrar</button>
        </form>
        <div class="register">
            Não tem uma conta? <a href="http://localhost/hknv26.php">Registra-se</a>
        </div>
    </div>

    <div class="logo-container">
        <p class="slogan">Transforme seu corpo e sua mente com treinos exclusivos e personalizados para você!</p>
      
        <div class="small-logo">
            <img src="https://gkptan.github.io/titanium-fitness/src/image/logo.png" alt="Logo">
        </div>
    </div>

    <div class="footer">
        © 2025 Titanium Fitness. Todos os direitos reservados.
    </div>

    <script src="https://gkptan.github.io/titanium-fitness/src/js/login.js"></script>
</body>
</html>