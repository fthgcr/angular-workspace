export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  user: User;
}

export interface RegistrationRequest {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface RegistrationResponse {
  success: boolean;
  message: string;
  user: User;
}

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
}
