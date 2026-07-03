
import React, { useState } from 'react';
import { UserType } from '../types';
import { SUBJECTS, CLASSES, LOCATIONS } from '../constants';
import { generateTutorBio } from '../services/geminiService';
import { addTutor, setCurrentTutorId } from '../services/tutorService';
import { registerUser, loginUser } from '../services/authService';
import { Link } from 'react-router-dom';

interface RegistrationFormProps {
  userType: UserType;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ userType }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    location: '',
    classLevel: '',
    subjects: '',
    experience: '',
    bio: ''
  });
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerateBio = async () => {
    if (!formData.name || !formData.subjects || !formData.experience) {
      alert("বায়ো তৈরি করতে অনুগ্রহ করে আপনার নাম, বিষয়, এবং অভিজ্ঞতার তথ্য দিন।");
      return;
    }
    setIsGeneratingBio(true);
    try {
      const generatedBio = await generateTutorBio(formData.name, formData.subjects, formData.experience);
      setFormData(prev => ({ ...prev, bio: generatedBio }));
    } catch (error) {
      console.error("Bio generation failed:", error);
    } finally {
      setIsGeneratingBio(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let tutorProfileId: number | undefined;

    if (userType === UserType.TUTOR) {
      const newTutor = addTutor({
        name: formData.name,
        subjects: formData.subjects.split(',').map(s => s.trim()).filter(Boolean),
        classLevel: formData.classLevel,
        location: formData.location,
        experience: Number(formData.experience) || 0,
        bio: formData.bio || "আমি একজন ডেডিকেটেড শিক্ষক।",
        contact: formData.email,
      });
      tutorProfileId = newTutor.id;
      setCurrentTutorId(newTutor.id);
    }

    // Register User in Authentication System
    registerUser({
      name: formData.name,
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      password: formData.password,
      userType,
      location: formData.location,
      classLevel: formData.classLevel,
      subjects: formData.subjects.split(',').map(s => s.trim()).filter(Boolean),
      tutorProfileId
    });

    // Automatically log them in!
    loginUser(formData.email, formData.password);

    setIsSubmitted(true);
  };
  
  if (isSubmitted) {
    return (
        <div className="text-center p-8 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-2xl font-bold text-green-700">নিবন্ধন সফল হয়েছে!</h3>
            {userType === UserType.TUTOR ? (
              <div className="mt-4 space-y-4">
                <p className="text-green-600">
                  শিক্ষক হিসেবে আপনার প্রোফাইল তৈরি হয়ে গেছে। এখন আপনি আপনার ড্যাশবোর্ডে গিয়ে শিক্ষার্থীর যোগাযোগের অনুরোধ, প্রোফাইল ভিউ এবং পড়ানোর প্রাপ্যতা নিয়ন্ত্রণ করতে পারেন।
                </p>
                <div className="pt-2">
                  <Link to="/dashboard" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 transition-colors">
                    শিক্ষক ড্যাশবোর্ডে যান
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <p className="text-green-600">
                  ছাত্র/ছাত্রী হিসেবে আপনার নিবন্ধন সফল হয়েছে। এখন আপনি আপনার ড্যাশবোর্ডে গিয়ে আপনার পাঠানো যোগাযোগের অনুরোধ এবং সেরা শিক্ষকদের তালিকা দেখতে পারেন।
                </p>
                <div className="pt-2">
                  <Link to="/dashboard" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 transition-colors">
                    ছাত্র ড্যাশবোর্ডে যান
                  </Link>
                </div>
              </div>
            )}
        </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700">পুরো নাম</label>
        <input type="text" name="name" id="name" required value={formData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">ইমেইল</label>
          <input type="email" name="email" id="email" required value={formData.email} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-slate-700">ফোন নম্বর</label>
          <input type="tel" name="phone" id="phone" required value={formData.phone} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" />
        </div>
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-700">পাসওয়ার্ড (পরবর্তীতে লগইনের জন্য)</label>
        <input type="password" name="password" id="password" required value={formData.password} onChange={handleChange} placeholder="কমপক্ষে ৬টি ক্যারেক্টার দিন" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" />
      </div>
       <div>
        <label htmlFor="location" className="block text-sm font-medium text-slate-700">আপনার এলাকা</label>
        <select name="location" id="location" required value={formData.location} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500">
          <option value="" disabled>এলাকা নির্বাচন করুন</option>
          {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
        </select>
      </div>
       <div>
        <label htmlFor="classLevel" className="block text-sm font-medium text-slate-700">ক্লাস/শ্রেণী</label>
        <select name="classLevel" id="classLevel" required value={formData.classLevel} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500">
          <option value="" disabled>ক্লাস নির্বাচন করুন</option>
          {CLASSES.map(cls => <option key={cls} value={cls}>{cls}</option>)}
        </select>
      </div>

       <div>
        <label htmlFor="subjects" className="block text-sm font-medium text-slate-700">
          {userType === UserType.TUTOR ? 'পছন্দের বিষয় (যেগুলো পড়াতে চান)' : 'পছন্দের বিষয় (যেগুলো পড়তে চান)'}
        </label>
        <input type="text" name="subjects" id="subjects" required value={formData.subjects} onChange={handleChange} placeholder="যেমন: গণিত, ইংরেজি" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" />
        <p className="text-xs text-slate-500 mt-1">একাধিক বিষয় হলে কমা (,) দিয়ে লিখুন।</p>
      </div>

      {userType === UserType.TUTOR && (
        <>
           <div>
            <label htmlFor="experience" className="block text-sm font-medium text-slate-700">শিক্ষকতার অভিজ্ঞতা (বছর)</label>
            <input type="number" name="experience" id="experience" required value={formData.experience} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" />
          </div>
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-slate-700">আপনার সম্পর্কে কিছু লিখুন (বায়ো)</label>
            <textarea name="bio" id="bio" rows={4} required value={formData.bio} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"></textarea>
            <button type="button" onClick={handleGenerateBio} disabled={isGeneratingBio} className="mt-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded-md transition-colors disabled:bg-indigo-300">
              {isGeneratingBio ? 'তৈরি হচ্ছে...' : 'AI দিয়ে বায়ো তৈরি করুন'}
            </button>
          </div>
        </>
      )}

      <div>
        <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
          রেজিস্ট্রেশন সম্পন্ন করুন
        </button>
      </div>
    </form>
  );
};

export default RegistrationForm;
