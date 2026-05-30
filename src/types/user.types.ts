export interface UserProfile {
  uid: string;
  firstName: string;
  lastName: string;
  username: string;
  usernameLower: string;
  email: string;
  avatarUrl: string | null;
  authProvider: string;
  profileComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserMeResponse {
  profileComplete: boolean;
  user?: UserProfile;
}
