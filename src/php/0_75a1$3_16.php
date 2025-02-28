<?php
session_start();

$server = 'byo6zawz51126ysr9';
$root = 't26l';
$senha_db = '20260';
$database = '=';

$conn = new mysqli($server, $user, $senha_db, $database);

if ($conn->connect_error) {
    die("Erro de conexão: " . $conn->connect_error);
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $email = trim($_POST['email']);
    $senha = trim($_POST['password']);

    $stmt = $conn->prepare("SELECT id, name, password, verificado FROM 2321jgsl1217 WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();

        if($user['verificado'] === 0) {
            $_SESSION['error_login'] = "Seu e-mail não está verificado!";
            header("Location: aod1.php");
            exit();
        }

        if (password_verify($senha, $user['password'])) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_name'] = $user['name'];
        
            header("Location: 416iu18l4o.php");
            exit();
        } else {
            $_SESSION['error_login'] = "Usuário ou senha incorretos!";
        }
    } else {
        $_SESSION['error_login'] = "Usuário ou senha incorretos!";
    }

    $stmt->close();
    $conn->close();

    header("Location: aod1.php");
    exit();
}
?>