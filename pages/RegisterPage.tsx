
import React, { useState } from 'react';
import RegistrationForm from '../components/RegistrationForm';
import { UserType } from '../types';
import UserCircleIcon from '../components/icons/UserCircleIcon';
import BookOpenIcon from '../components/icons/BookOpenIcon';


const RegisterPage: React.FC = () => {
  const [userType, setUserType] = useState<UserType | null>(null);

  const selectUserType = (type: UserType) => {
    setUserType(type);
  };
  
  const activeBtnClasses = "bg-emerald-600 text-white";
  const inactiveBtnClasses = "bg-white text-slate-700 hover:bg-slate-100";

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-2xl mx-auto">
        <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
                আমাদের সাথে যোগ দিন
            </h1>
            <p className="mt-3 text-lg text-slate-600">
                আপনি কি একজন ছাত্র/ছাত্রী নাকি শিক্ষক? আপনার পরিচয় নির্বাচন করুন।
            </p>
        </div>

        {!userType ? (
           <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
             <button
               onClick={() => selectUserType(UserType.STUDENT)}
               className="group flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
             >
               <UserCircleIcon className="w-16 h-16 text-emerald-500 group-hover:text-emerald-600 transition-colors" />
               <h2 className="mt-4 text-2xl font-bold text-slate-800">আমি একজন ছাত্র/ছাত্রী</h2>
               <p className="mt-1 text-slate-500">সেরা শিক্ষকদের খুঁজে পেতে নিবন্ধন করুন</p>
             </button>
             <button
               onClick={() => selectUserType(UserType.TUTOR)}
               className="group flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
             >
               <BookOpenIcon className="w-16 h-16 text-indigo-500 group-hover:text-indigo-600 transition-colors" />
               <h2 className="mt-4 text-2xl font-bold text-slate-800">আমি একজন শিক্ষক</h2>
               <p className="mt-1 text-slate-500">আপনার প্রোফাইল তৈরি করে ছাত্র/ছাত্রী খুঁজুন</p>
             </button>
           </div>
        ) : (
            <div className="mt-10 bg-white p-6 sm:p-8 rounded-xl shadow-2xl">
                <div className="flex justify-center mb-6">
                    <div className="relative flex p-1 bg-slate-200 rounded-lg">
                        <button onClick={() => setUserType(UserType.STUDENT)} className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${userType === UserType.STUDENT ? activeBtnClasses : inactiveBtnClasses}`}>
                            ছাত্র-ছাত্রী
                        </button>
                         <button onClick={() => setUserType(UserType.TUTOR)} className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${userType === UserType.TUTOR ? activeBtnClasses : inactiveBtnClasses}`}>
                            শিক্ষক
                        </button>
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">নিবন্ধন ফরম ({userType})</h2>
                <RegistrationForm userType={userType} />
            </div>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
