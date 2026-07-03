
import React from 'react';
import { Link } from 'react-router-dom';
import TutorCard from '../components/TutorCard';
import { getTutors } from '../services/tutorService';

const HomePage: React.FC = () => {
  const featuredTutors = getTutors().slice(0, 3);

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative bg-slate-800 text-white pt-20 pb-28 sm:pt-24 sm:pb-32 text-center">
        <div className="absolute inset-0">
            <img src="https://picsum.photos/seed/homebg/1920/1080" className="w-full h-full object-cover opacity-30" alt="Students studying"/>
        </div>
        <div className="relative container mx-auto px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
            আপনার পছন্দের <span className="text-emerald-400">প্রাইভেট শিক্ষক</span> খুঁজে নিন
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-300">
            বাংলাদেশের সবচেয়ে নির্ভরযোগ্য প্ল্যাটফর্মে ক্লাস ১ থেকে বিশ্ববিদ্যালয় ভর্তি পর্যন্ত সব বিষয়ের জন্য সেরা শিক্ষক খুঁজুন।
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              to="/find-tutor"
              className="w-full sm:w-auto text-lg font-semibold bg-emerald-600 hover:bg-emerald-500 rounded-lg px-8 py-4 transition-colors duration-300"
            >
              শিক্ষক খুঁজুন
            </Link>
            <Link
              to="/register"
              className="w-full sm:w-auto text-lg font-semibold bg-slate-100 text-slate-800 hover:bg-white rounded-lg px-8 py-4 transition-colors duration-300"
            >
              শিক্ষক হিসেবে জয়েন করুন
            </Link>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">কিভাবে কাজ করে?</h2>
          <p className="mt-2 text-lg text-slate-600">মাত্র ৩টি সহজ ধাপে আপনার শিক্ষক খুঁজে পান।</p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-3 text-center">
          <div className="p-6">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto text-3xl font-bold">১</div>
            <h3 className="mt-5 text-xl font-semibold">অনুসন্ধান করুন</h3>
            <p className="mt-2 text-slate-600">আপনার বিষয়, ক্লাস এবং এলাকা অনুযায়ী সেরা শিক্ষকদের তালিকা থেকে পছন্দের শিক্ষক খুঁজুন।</p>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto text-3xl font-bold">২</div>
            <h3 className="mt-5 text-xl font-semibold">প্রোফাইল দেখুন</h3>
            <p className="mt-2 text-slate-600">শিক্ষকের প্রোফাইল, অভিজ্ঞতা, এবং পড়ানোর ধরণ সম্পর্কে বিস্তারিত জানুন।</p>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto text-3xl font-bold">৩</div>
            <h3 className="mt-5 text-xl font-semibold">যোগাযোগ করুন</h3>
            <p className="mt-2 text-slate-600">পছন্দের শিক্ষকের সাথে সরাসরি যোগাযোগ করে পড়াশোনা শুরু করুন।</p>
          </div>
        </div>
      </section>

      {/* Featured Tutors Section */}
      <section className="bg-slate-100 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">আমাদের কয়েকজন সেরা শিক্ষক</h2>
            <p className="mt-2 text-lg text-slate-600">অভিজ্ঞ এবং নিবেদিতপ্রাণ শিক্ষকদের সাথে পরিচিত হোন।</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featuredTutors.map(tutor => (
              <TutorCard key={tutor.id} tutor={tutor} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
