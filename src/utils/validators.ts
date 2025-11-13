export const validators = {
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidPassword: (password: string): boolean => {
    return password.length >= 6;
  },

  isValidName: (name: string): boolean => {
    return name.trim().length > 0;
  },

  isValidRating: (rating: number): boolean => {
    return rating >= 0 && rating <= 10;
  },
};

export const errorMessages = {
  EMAIL_INVALID: 'Por favor, insira um email válido',
  EMAIL_REQUIRED: 'Email é obrigatório',
  PASSWORD_INVALID: 'A senha deve ter no mínimo 6 caracteres',
  PASSWORD_REQUIRED: 'Senha é obrigatória',
  NAME_REQUIRED: 'Nome é obrigatório',
  USER_NOT_FOUND: 'Usuário não encontrado',
  WRONG_PASSWORD: 'Senha incorreta',
  EMAIL_ALREADY_EXISTS: 'Este email já está cadastrado',
  GENERIC_ERROR: 'Ocorreu um erro. Tente novamente.',
};