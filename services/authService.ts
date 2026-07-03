import { UserType, Tutor } from '../types';
import { getTutors, addTutor } from './tutorService';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string; // Stored for simple auth
  userType: UserType;
  // Student-specific fields
  location: string;
  classLevel: string;
  subjects: string[];
  // Tutor profile reference if applicable
  tutorProfileId?: number;
}

const USERS_KEY = 'tutor_khuji_users_v1';
const SESSION_KEY = 'tutor_khuji_active_session_v1';

// Seed some initial users matching default tutors for easy login demo
const seedDefaultUsers = (): User[] => {
  const tutors = getTutors();
  const seeded: User[] = [];
  
  // Create default student for demo
  seeded.push({
    id: 'student-demo',
    name: 'তানভীর আহমেদ',
    email: 'student@gmail.com',
    phone: '01711223344',
    password: 'password123',
    userType: UserType.STUDENT,
    location: 'মিরপুর, ঢাকা',
    classLevel: 'দশম শ্রেণী',
    subjects: ['গণিত', 'ইংরেজি'],
  });

  // Create accounts for existing mock tutors so they can be logged into as well
  tutors.forEach(t => {
    seeded.push({
      id: `tutor-${t.id}`,
      name: t.name,
      email: `${t.contact || `tutor${t.id}@gmail.com`}`.toLowerCase(),
      phone: `0170000000${t.id}`,
      password: 'password123',
      userType: UserType.TUTOR,
      location: t.location,
      classLevel: t.classLevel,
      subjects: t.subjects,
      tutorProfileId: t.id
    });
  });

  localStorage.setItem(USERS_KEY, JSON.stringify(seeded));
  return seeded;
};

export const getUsers = (): User[] => {
  const stored = localStorage.getItem(USERS_KEY);
  if (!stored) {
    return seedDefaultUsers();
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error("Error reading users list", e);
    return [];
  }
};

export const registerUser = (userData: Omit<User, 'id'>): User => {
  const users = getUsers();
  const nextId = `${userData.userType === UserType.TUTOR ? 'tutor' : 'student'}-${Date.now()}`;
  
  const newUser: User = {
    ...userData,
    id: nextId
  };

  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return newUser;
};

export const loginUser = (emailOrPhone: string, passwordString: string): User | null => {
  const users = getUsers();
  const cleanCredential = emailOrPhone.trim().toLowerCase();
  
  const foundUser = users.find(u => 
    (u.email.toLowerCase() === cleanCredential || u.phone === cleanCredential) && 
    u.password === passwordString
  );

  if (foundUser) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(foundUser));
    return foundUser;
  }
  return null;
};

export const getCurrentUser = (): User | null => {
  const session = localStorage.getItem(SESSION_KEY);
  if (!session) return null;
  try {
    return JSON.parse(session);
  } catch (e) {
    return null;
  }
};

export const logoutUser = (): void => {
  localStorage.removeItem(SESSION_KEY);
};

export const updateCurrentUserProfile = (updatedFields: Partial<User>): User | null => {
  const currentUser = getCurrentUser();
  if (!currentUser) return null;

  const updatedUser = {
    ...currentUser,
    ...updatedFields
  };

  // Update in users storage
  const users = getUsers();
  const index = users.findIndex(u => u.id === currentUser.id);
  if (index !== -1) {
    users[index] = updatedUser;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  // Update session
  localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
  return updatedUser;
};
