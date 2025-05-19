export interface LoginRequest {
  gmail: string;
  contrasena: string;
}

export interface LoginResponse {
  mensaje: string;
  token: string;
}

