
import React, { useState, useMemo } from 'react';
import TutorCard from '../components/TutorCard';
import { SUBJECTS, CLASSES, LOCATIONS } from '../constants';
import { getTutors } from '../services/tutorService';
import MagnifyingGlassIcon from '../components/icons/MagnifyingGlassIcon';
import type { Tutor } from '../types';

const FindTutorPage: React.FC = () => {
  const [filters, setFilters] = useState({
    subject: '',
    classLevel: '',
    location: '',
    onlyAvailable: false,
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const filteredTutors = useMemo((): Tutor[] => {
    const tutors = getTutors();
    return tutors.filter(tutor => {
      const subjectMatch = filters.subject ? tutor.subjects.includes(filters.subject) : true;
      const classMatch = filters.classLevel ? tutor.classLevel.includes(filters.classLevel.split(' ')[0]) : true;
      const locationMatch = filters.location ? tutor.location === filters.location : true;
      const availabilityMatch = filters.onlyAvailable ? tutor.isAvailable !== false : true;
      return subjectMatch && classMatch && locationMatch && availabilityMatch;
    });
  }, [filters]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="bg-white p-6 rounded-xl shadow-lg mb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700">বিষয়</label>
              <select id="subject" name="subject" onChange={handleFilterChange} value={filters.subject} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md">
                <option value="">সব বিষয়</option>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="classLevel" className="block text-sm font-medium text-gray-700">ক্লাস</label>
              <select id="classLevel" name="classLevel" onChange={handleFilterChange} value={filters.classLevel} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md">
                <option value="">সব ক্লাস</option>
                 {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">এলাকা</label>
              <select id="location" name="location" onChange={handleFilterChange} value={filters.location} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md">
                <option value="">সব এলাকা</option>
                {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <button className="w-full flex items-center justify-center bg-emerald-600 text-white font-bold py-2 px-4 rounded-md hover:bg-emerald-700 transition-colors h-10">
            <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
            <span>খুঁজুন</span>
          </button>
        </div>
        
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center">
          <input
            id="onlyAvailable"
            name="onlyAvailable"
            type="checkbox"
            checked={filters.onlyAvailable}
            onChange={(e) => setFilters(prev => ({ ...prev, onlyAvailable: e.target.checked }))}
            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded cursor-pointer"
          />
          <label htmlFor="onlyAvailable" className="ml-2 block text-sm font-medium text-slate-700 cursor-pointer">
            শুধুমাত্র টিউশনি খুঁজছেন এমন শিক্ষক (উপলব্ধ)
          </label>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">
          ফলাফল ({filteredTutors.length} জন শিক্ষক পাওয়া গেছে)
        </h2>
        {filteredTutors.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredTutors.map(tutor => (
              <TutorCard key={tutor.id} tutor={tutor} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg shadow">
            <h3 className="text-xl font-semibold text-slate-700">দুঃখিত, কোনো শিক্ষক খুঁজে পাওয়া যায়নি।</h3>
            <p className="mt-2 text-slate-500">অনুগ্রহ করে আপনার ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindTutorPage;
