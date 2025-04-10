const validarInput = (name, age, gender, email, senha, passwordConfirm) => {
  const validGenders = ["Masculino", "Feminino"];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  if (typeof name !== "string") {
    return "ERROR_STRING_VALUE: O valor do campo 'nome' tem que ser do tipo string";
  }

  if (!Number.isInteger(age)) {
    return "ERROR_VALIDATE_INT: O valor do campo 'idade' deve ser um número inteiro!";
  }

  if (!validGenders.includes(gender)) {
    return "ERROR_VALIDATE_GENDER: O gênero informado não é válido!";
  }

  if (!emailRegex.test(email)) {
    return "ERROR_EMAIL_FORMAT: Formato de e-mail inválido!";
  }

  if (!name || !age || !gender || !email || !senha || !passwordConfirm) {
    return "ERROR_EMPTY_INPUT: Nenhum campo pode estar vazio!";
  }

  if (name.length < 3) {
    return "ERROR_SIZE_REQUIRED: O campo 'nome' precisa ter no mínimo 3 caracteres!";
  }

  if (senha.length < 6 || passwordConfirm.length < 6) {
    return "ERROR_SIZE_REQUIRED: A senha precisa ter no mínimo 6 caracteres!";
  }

  if (senha.length > 15 || passwordConfirm.length > 15) {
    return "ERROR_SIZE_REQUIRED: A senha pode ter no máximo 15 caracteres!";
  }

  if (age < 12 || age > 100) {
    return "ERROR_INVALID_AGE: Idade inválida, não temos suporte para essa idade!";
  }

  if (name.length > 255 || email.length > 255) {
    return "ERROR_SIZE_REQUIRED: O campo 'nome' e 'email' podem ter no máximo 255 caracteres!";
  }

  if (name.trim() === "" || String(age).trim() === "") {
    return "ERROR_SPACE_ZERO: O campo não pode conter apenas espaços!";
  }

  if (senha.includes(" ") || passwordConfirm.includes(" ")) {
    return "ERROR_SPACE_ZERO: O campo 'senha' não pode conter espaços!";
  }

  if (/\s{3,}/.test(name)) {
    return "ERROR_SPACE_BETWEEN: O nome não pode conter mais de dois espaços seguidos!";
  }

  if (/^\d+$/.test(name)) {
    return "ERROR_TYPE_DIGIT: O campo 'nome' deve conter letras, não apenas números!";
  }

  if (senha !== passwordConfirm) {
    return "ERROR_PASSWORD_CONFIRM: As senhas não coincidem!";
  }

  return true;
};

export default validarInput;