
export interface DriveMaterial {
  id: string;
  name: string;
  webViewLink: string;
  webContentLink?: string;
  size?: number;
  mimeType?: string;
}

export interface Tutor {
  id: number;
  name: string;
  subjects: string[];
  classLevel: string;
  location: string;
  experience: number;
  bio: string;
  imageUrl: string;
  rating: number;
  contact?: string;
  isAvailable?: boolean;
  driveMaterials?: DriveMaterial[];
}

export enum UserType {
  STUDENT = 'ছাত্র-ছাত্রী',
  TUTOR = 'শিক্ষক',
}
