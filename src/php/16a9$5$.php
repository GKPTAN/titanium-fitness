<?php
session_start();

date_default_timezone_set('America/Sao_Paulo');

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php';

error_reporting(E_ALL);
ini_set('display_errors', 1);

function validarInput($name, $age, $gender, $email, $senha, $passwordConfirm) {

    $validGenders = ["Masculino", "Feminino"];
    $regex = '/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/';

    if (!is_string($name)) {
        return "ERROR_STRING_VALUE: O valor do campo 'nome' tem que ser do tipo string";
    }

    if (!filter_var($age, FILTER_VALIDATE_INT)) {
        die("ERROR_VALIDATE_INT: o valor do campo deve ser um número inteiro!");
    }

    if (!is_string($gender) || !in_array($gender, $validGenders, true)) {
        return "ERROR_VALIDATE_GENDER";
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || !preg_match($regex, $email)) {
        return "ERROR_EMAIL_FORMAT: formato de e-mail inválido!";
    }

    if (empty($name) || empty($age) || empty($gender) || empty($email) || empty($senha) || empty($passwordConfirm) ) {
        return "ERROR_EMPTY_INPUT: o campo não pode estar vazio!";
    }

    if (strlen($name) < 3) {
        return "ERROR_SIZE_REQUIRED: O campo 'nome' tem que ter no mínimo 3 caracteres!";
    }

    if (strlen($senha) < 6 || strlen($passwordConfirm) < 6) {
        return "ERROR_SIZE_REQUIRED: O campo 'senha' precisa ter no mínimo 6 caracteres!";
    }

    if (strlen($senha) > 15 || strlen($passwordConfirm) > 15) {
        return "ERROR_SIZE_REQUIRED: O campo 'senha' precisa ter no máximo 15 caracteres!";
    }

    if ($age < 12 || $age > 100) {
        return "ERROR_INVALID_AGE: idade inválida, não temos suporte para essa idade!";
    }

    if (strlen($name) > 255 || strlen($email) > 255) {
        return "ERROR_SIZE_REQUIRED: O campo tem que ter no máximo 255 caracteres!";
    }

    if (trim($name) === '' || trim($age) === '') {
        return "ERROR_SPACE_ZERO: O campo não pode conter apenas espaços!";
    }

    if (strpos($senha, ' ') !== false || strpos($passwordConfirm, ' ') !== false) {
        return "ERROR_SPACE_ZERO: O campo 'senha' não pode conter espaços!";
    }

    if (preg_match('/\s{3,}/', $name)) {
        return "ERROR_SPACE_BETWEEN: O campo não pode conter mais de dois espaços seguidos entre os caracteres!";
    }

    if (ctype_digit($name)) {
        return "ERROR_TYPE_DIGIT: O campo 'nome' deve conter texto (letras, simbolos ou acentos), não só números!";
    }

    if ($senha !== $passwordConfirm) {
        return "ERROR_PASSWORD_CONFIRM: você precisa confirmar a sua senha, as duas senhas não coincidem!";
    }

    return true;
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $name = trim($_POST['names']);
    $age = $_POST['ages'];
    $gender = $_POST['genres'] ?? '';
    $email = trim($_POST['emails']);
    $senha = $_POST['password_user'] ?? '';
    $passwordConfirm = $_POST['password_conf'] ?? '';
    $data_atual = date('d/m/Y');
    $hora_atual = date('H:i:s');

    $validação = validarInput($name, $age, $gender, $email, $senha, $passwordConfirm);
    if ($validação === true) {
        echo "Input válido";
    } else {
        echo "Erro: " . $validação;
    }

    $server = 'byo6zawz51126ysr9';
    $root = 't26l';
    $senha_db = '20260';
    $database = '=';

    $conn = new mysqli($server, $root, $senha_db, $database);

    if ($conn->connect_error) {
        $_SESSION['erro'] = "Erro ao conectar ao banco de dados!";
        header("Location: registro.php");
        exit;
    }

    $stmt = $conn->prepare("SELECT id FROM 2321jgsl1217 WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $_SESSION['erro'] = "E-mail já cadastrado!";
        header("Location: registro.php");
        exit();
    }

    $codigo = rand(100000, 999999);
    $senhaHash = password_hash($senha, PASSWORD_BCRYPT);

    $stmt = $conn->prepare("INSERT INTO users (name, age, gender, email, password, confirm_code, date, hours) VALUES (?,?,?,?,?,?,?,?)");
    $stmt->bind_param("sissssss", $name, $age, $gender, $email, $senhaHash, $codigo, $data_atual, $hora_atual);
    if ($stmt->execute()) {
        $mail = new PHPMailer(true);
        try {
            $mail->isSMTP();
            $mail->Host = 'smtp.gmail.com';
            $mail->SMTPAuth = true;
            $mail->Username = '12127rxzbokzr26/v24u@gmail.com';
            $mail->Password = 'l2216v173hu2z19w114q0e';
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = 587;

            $mail->setFrom('12127rxzbokzr26/v24u@gmail.com', 'Nome da Empresa');
            $mail->addAddress($email, $name);
            $mail->isHTML(true);
            $mail->Subject = 'Código de Confirmação';
            $mail->Body = "Olá <b>$name</b>,<br><br>Seu código de confirmação é: <b>$codigo</b><br>Digite esse código na página de verificação.";

            if($mail->send()) {
                header("Location: l11ez119nt.php?email=" . urlencode($email));
                exit;
            } else {
                echo "Erro ao enviar e-mail!";
            }
        } catch (Exception $e) {
            echo "Erro ao enviar e-mail: {$mail->ErrorInfo}";
        }
    } else {
        echo "Erro no cadastro: " . $stmt->error;
    }
    $stmt->close();
    $conn->close();
}
?>