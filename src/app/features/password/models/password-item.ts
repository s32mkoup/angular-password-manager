export interface PasswordItem {
    id?: number;
    category: string;
    app: string;
    userName: string;
    encryptedPassword: string;
    createdAt?: Date;
    updatedAt?: Date;
  }