<?php
$server = 'byo6zawz51126ysr9';
$root = 't26l';
$senha_db = '20260';
$database = '=';

$conn = new mysqli($server, $root, $senha, $database);

if ($conn->connect_error) {
    die("Falha ao se comunicar com o banco de dados: " . $conn->connect_error);
}

$email = trim($_POST['email']);
$codigo = trim($_POST['codigo']);

$stmt = $conn->prepare("SELECT confirm_code FROM 2321jgsl1217 WHERE email = ? AND confirm_code = ?");
$stmt->bind_param('ss', $email, $codigo);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    die("ERROR: Usuário não encontrado!");
}

$user = $result->fetch_assoc();

if ($codigo === $user['confirm_code']) {
    $stmtUpdate = $conn->prepare("UPDATE 2321jgsl1217 SET verificado = 1 WHERE email = ?");
    $stmtUpdate->bind_param('s', $email);
    if ($stmtUpdate->execute()) {
        echo "<p style='font-size: 1.5rem; margin: 500px auto; width: 50%;'>E-mail verificado com sucesso, Volte para a página de login.</p>";
    } else {
        echo "Erro ao atualizar o status: " . $stmtUpdate->error;
    }
    $stmtUpdate->close();
} else {
    echo "<p style='font-size: 1.5rem; margin: 500px auto; width: 50%; color: darkred;'>Código de verificação incorreto!.</p>";
}

$stmt->close();
$conn->close();
?>