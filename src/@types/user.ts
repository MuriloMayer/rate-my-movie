export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  profileImage?: string;
  createdAt: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface UserRegister {
  name: string;
  email: string;
  password: string;
  profileImage?: string;
}