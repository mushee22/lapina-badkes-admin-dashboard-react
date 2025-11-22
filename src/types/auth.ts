export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginUser {
  id: number;
  name: string;
  email: string;
  roles: string[];
  permissions: string[];
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  message: string;
  user: LoginUser;
  roles: string[];
  permissions: string[];
  token: string;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  roles: string[];
  permissions: string[];
  phone?: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
}