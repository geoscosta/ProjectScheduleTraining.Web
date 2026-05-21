export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterUserRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  studentId?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: UserAuthResponse;
}

export interface UserAuthResponse {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export enum UserRole {
  Admin = 1,
  Trainer = 2,
  Receptionist = 3,
  Student = 4
}
