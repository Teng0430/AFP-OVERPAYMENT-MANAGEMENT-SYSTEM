export interface Role {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  profile_image_url?: string | null;
  role_id: number | null;
  role?: Role | null;
  department: string | null;
  is_active: boolean;
  two_factor_enabled: boolean;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
