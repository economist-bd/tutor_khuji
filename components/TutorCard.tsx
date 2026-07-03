
import React from 'react';
import type { Tutor } from '../types';
import { Link } from 'react-router-dom';
import BookOpenIcon from './icons/BookOpenIcon';
import MapPinIcon from './icons/MapPinIcon';

interface TutorCardProps {
  tutor: Tutor;
}

const TutorCard: React.FC<TutorCardProps> = ({ tutor }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 ease-in-out flex flex-col h-full justify-between relative">
      <div className="relative">
        <img className="w-full h-48 object-cover" src={tutor.imageUrl} alt={tutor.name} />
        <div className="absolute top-3 right-3 z-10">
          {tutor.isAvailable !== false ? (
            <span className="bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md flex items-center">
              <span className="h-1.5 w-1.5 rounded-full bg-white mr-1 animate-pulse"></span>
              উপলব্ধ
            </span>
          ) : (
            <span className="bg-slate-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md flex items-center">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-300 mr-1"></span>
              বুকড
            </span>
          )}
        </div>
      </div>
      <div className="p-6 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">{tutor.name}</h3>
          <p className="text-sm text-slate-600 mb-4">{tutor.classLevel}</p>
          
          <div className="flex items-center text-slate-700 mb-2">
            <BookOpenIcon className="w-5 h-5 mr-2 text-emerald-600 flex-shrink-0" />
            <span className="truncate">{tutor.subjects.join(', ')}</span>
          </div>
          <div className="flex items-center text-slate-700 mb-4">
            <MapPinIcon className="w-5 h-5 mr-2 text-emerald-600 flex-shrink-0" />
            <span>{tutor.location}</span>
          </div>
        </div>

        <Link
          to={`/tutor/${tutor.id}`}
          className="w-full text-center block bg-emerald-600 text-white font-bold py-2 px-4 rounded-md hover:bg-emerald-700 transition-colors duration-300 mt-2"
        >
          প্রোফাইল দেখুন
        </Link>
      </div>
    </div>
  );
};

export default TutorCard;
