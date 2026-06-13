export interface Room {
  id: string;
  name: string;
  adminUid: string;
  adminUsername: string;
  membersCount: number;
  active: boolean;
  createdAt: string;
}