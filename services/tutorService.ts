import { Tutor } from '../types';
import { TUTOR_DATA } from '../constants';

const TUTORS_KEY = 'tutor_khuji_tutors';
const CURRENT_TUTOR_KEY = 'tutor_khuji_current_id';

// Stats generator helper to keep consistent stats for demo
interface TutorStats {
  profileViews: number;
  contactRequests: number;
  activeStudents: number;
  responseRate: number;
}

export const getTutors = (): Tutor[] => {
  const stored = localStorage.getItem(TUTORS_KEY);
  if (!stored) {
    // Pre-populate with default tutors and set isAvailable to true for them initially
    const initialTutors = TUTOR_DATA.map(tutor => ({
      ...tutor,
      isAvailable: tutor.isAvailable !== undefined ? tutor.isAvailable : true
    }));
    localStorage.setItem(TUTORS_KEY, JSON.stringify(initialTutors));
    return initialTutors;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error("Error parsing stored tutors", e);
    return TUTOR_DATA;
  }
};

export const getTutorById = (id: number): Tutor | undefined => {
  const tutors = getTutors();
  return tutors.find(t => t.id === id);
};

export const saveTutor = (updatedTutor: Tutor): void => {
  const tutors = getTutors();
  const index = tutors.findIndex(t => t.id === updatedTutor.id);
  if (index !== -1) {
    tutors[index] = updatedTutor;
    localStorage.setItem(TUTORS_KEY, JSON.stringify(tutors));
  }
};

export const addTutor = (newTutor: Omit<Tutor, 'id' | 'imageUrl' | 'rating'> & { id?: number }): Tutor => {
  const tutors = getTutors();
  const nextId = newTutor.id || (tutors.length > 0 ? Math.max(...tutors.map(t => t.id)) + 1 : 1);
  
  const completedTutor: Tutor = {
    ...newTutor,
    id: nextId,
    imageUrl: `https://picsum.photos/seed/tutor-${nextId}/400/400`,
    rating: 5.0,
    isAvailable: true
  };
  
  tutors.push(completedTutor);
  localStorage.setItem(TUTORS_KEY, JSON.stringify(tutors));
  return completedTutor;
};

export const getCurrentTutorId = (): number | null => {
  const id = localStorage.getItem(CURRENT_TUTOR_KEY);
  return id ? Number(id) : null;
};

export const setCurrentTutorId = (id: number | null): void => {
  if (id === null) {
    localStorage.removeItem(CURRENT_TUTOR_KEY);
  } else {
    localStorage.setItem(CURRENT_TUTOR_KEY, String(id));
  }
};

// Generate deterministic stats based on tutor ID so they persist/feel real
export const getTutorStats = (tutorId: number): TutorStats => {
  // Let's create reproducible stats using tutorId
  const seed = tutorId * 17;
  const profileViews = 120 + (seed % 150);
  
  // Factor in user-sent contact requests dynamically
  const statsOverrideKey = `tutor_khuji_stats_override_${tutorId}`;
  const overrideCount = Number(localStorage.getItem(statsOverrideKey)) || 0;
  const contactRequests = 8 + (seed % 25) + overrideCount;
  
  const activeStudents = 1 + (seed % 4);
  const responseRate = 92 + (seed % 8); // nice high-quality default
  
  return {
    profileViews,
    contactRequests,
    activeStudents,
    responseRate
  };
};

export const getMockMessages = (tutorId: number) => {
  const customStored = localStorage.getItem('tutor_khuji_custom_messages');
  let customMsgs: any[] = [];
  if (customStored) {
    try {
      customMsgs = JSON.parse(customStored).filter((m: any) => m.tutorId === tutorId);
    } catch (e) {
      console.error(e);
    }
  }

  const baseMock = [
    {
      id: 1001,
      sender: "সাব্বির রহমান",
      class: "দশম শ্রেণী",
      subject: "গণিত",
      message: "আসসালামু আলাইকুম স্যার, আমি আপনার কাছে গণিত পড়তে আগ্রহী। সপ্তাহে ৩ দিন পড়াতে পারবেন কি?",
      date: "আজ, দুপুর ১২:৩০",
      phone: "01712345678"
    },
    {
      id: 1002,
      sender: "মাহিন হাসান (অভিভাবক)",
      class: "অষ্টম শ্রেণী",
      subject: "ইংরেজি",
      message: "আমার ছেলের জন্য একজন অভিজ্ঞ ইংরেজি টিউটর খুঁজছি। আপনার ফ্রি সময় কখন হবে জানাবেন প্লিজ।",
      date: "গতকাল, বিকাল ৪:১৫",
      phone: "01911223344"
    },
    {
      id: 1003,
      sender: "নুসরাত জাহান",
      class: "দ্বাদশ শ্রেণী",
      subject: "রসায়ন",
      message: "আপু, রসায়ন দ্বিতীয় পত্রের অধ্যায়গুলো কি দ্রুত শেষ করিয়ে দিতে পারবেন? সামনেই টেস্ট পরীক্ষা।",
      date: "২ দিন আগে",
      phone: "01555667788"
    }
  ].slice(0, 1 + (tutorId % 3)); // Return 1 to 3 messages depending on tutor id

  return [...customMsgs, ...baseMock];
};

export const addTutorMessage = (
  tutorId: number, 
  message: { sender: string; class: string; subject: string; message: string; phone: string }
): void => {
  const customStored = localStorage.getItem('tutor_khuji_custom_messages');
  let customMsgs: any[] = [];
  if (customStored) {
    try {
      customMsgs = JSON.parse(customStored);
    } catch (e) {
      console.error(e);
    }
  }
  
  const nextId = customMsgs.length > 0 ? Math.max(...customMsgs.map(m => m.id)) + 1 : 1;
  const newMsg = {
    id: nextId,
    tutorId,
    ...message,
    date: "এই মাত্র"
  };
  
  customMsgs.push(newMsg);
  localStorage.setItem('tutor_khuji_custom_messages', JSON.stringify(customMsgs));
  
  // Increment custom stats count if exists
  const statsOverrideKey = `tutor_khuji_stats_override_${tutorId}`;
  const storedOverride = localStorage.getItem(statsOverrideKey);
  let currentIncrement = 0;
  if (storedOverride) {
    currentIncrement = Number(storedOverride) || 0;
  }
  localStorage.setItem(statsOverrideKey, String(currentIncrement + 1));
};

