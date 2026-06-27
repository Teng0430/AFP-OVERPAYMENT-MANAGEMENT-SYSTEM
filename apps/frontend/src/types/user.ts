export interface User {
  id: number;
  name: string;
  email: string;
  profile_image_url?: string | null;
}

export interface AuthResponse {
  user: User;
  token: string;
}
