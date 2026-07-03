import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTutorById, addTutorMessage } from '../services/tutorService';
import BookOpenIcon from '../components/icons/BookOpenIcon';
import MapPinIcon from '../components/icons/MapPinIcon';
import { CLASSES, SUBJECTS } from '../constants';
import { Cloud, FileText, Download, ExternalLink, FileSpreadsheet, Image as ImageIcon, Video, FileArchive, File, FolderOpen } from 'lucide-react';

const TutorProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const tutor = getTutorById(Number(id));

  const getFileIcon = (mimeType: string = '') => {
    if (mimeType.includes('pdf')) return <FileText className="w-5 h-5 text-red-500 shrink-0" />;
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType.includes('csv')) return <FileSpreadsheet className="w-5 h-5 text-emerald-600 shrink-0" />;
    if (mimeType.includes('image')) return <ImageIcon className="w-5 h-5 text-blue-500 shrink-0" />;
    if (mimeType.includes('video')) return <Video className="w-5 h-5 text-indigo-500 shrink-0" />;
    if (mimeType.includes('zip') || mimeType.includes('rar')) return <FileArchive className="w-5 h-5 text-amber-600 shrink-0" />;
    return <File className="w-5 h-5 text-slate-500 shrink-0" />;
  };

  const formatBytes = (bytes: number = 0, decimals = 2) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    sender: '',
    class: '',
    subject: '',
    phone: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!tutor) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold">শিক্ষক পাওয়া যায়নি</h2>
        <p className="mt-4">দুঃখিত, আমরা এই প্রোফাইলটি খুঁজে পাচ্ছি না।</p>
        <Link to="/find-tutor" className="mt-6 inline-block bg-emerald-600 text-white font-bold py-2 px-6 rounded-md hover:bg-emerald-700 transition-colors">
          সকল শিক্ষক দেখুন
        </Link>
      </div>
    );
  }
  
  const StarIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
    <svg className={`w-5 h-5 ${filled ? 'text-amber-400' : 'text-slate-300'}`} fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.sender.trim() || !form.class || !form.subject.trim() || !form.phone.trim() || !form.message.trim()) {
      setErrorMessage('অনুগ্রহ করে সব তথ্য সঠিকভাবে পূরণ করুন।');
      return;
    }
    
    addTutorMessage(tutor.id, {
      sender: form.sender,
      class: form.class,
      subject: form.subject,
      phone: form.phone,
      message: form.message
    });
    
    setIsSubmitted(true);
    setErrorMessage('');
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setIsSubmitted(false);
    setForm({
      sender: '',
      class: '',
      subject: '',
      phone: '',
      message: ''
    });
  };

  return (
    <div className="bg-slate-100 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="md:flex">
            <div className="md:flex-shrink-0">
              <img className="h-64 w-full object-cover md:w-64" src={tutor.imageUrl} alt={tutor.name} />
            </div>
            <div className="p-8 flex-grow">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">{tutor.name}</h1>
                  <p className="mt-1 text-lg text-slate-600">{tutor.classLevel}</p>
                </div>
                <div>
                  {tutor.isAvailable !== false ? (
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-800 shadow-sm border border-emerald-200">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                      পড়ানোর জন্য উপলব্ধ (Available)
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-rose-100 text-rose-800 shadow-sm border border-rose-200">
                      <span className="h-2.5 w-2.5 rounded-full bg-rose-500 mr-2"></span>
                      এই মুহূর্তে বুকড (Busy)
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-4 flex items-center">
                {Array.from({ length: 5 }, (_, i) => (
                    <StarIcon key={i} filled={i < tutor.rating} />
                ))}
                <span className="ml-2 text-slate-600 font-semibold">{tutor.rating.toFixed(1)}</span>
              </div>
            </div>
          </div>
          <div className="p-8 border-t border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4">বিস্তারিত তথ্য</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="flex items-start">
                <MapPinIcon className="w-6 h-6 mr-3 text-emerald-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-slate-700">অবস্থান</h3>
                  <p className="text-slate-600">{tutor.location}</p>
                </div>
              </div>
               <div className="flex items-start">
                <BookOpenIcon className="w-6 h-6 mr-3 text-emerald-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-slate-700">বিষয়সমূহ</h3>
                  <p className="text-slate-600">{tutor.subjects.join(', ')}</p>
                </div>
              </div>
               <div className="flex items-start">
                  <svg className="w-6 h-6 mr-3 text-emerald-600 flex-shrink-0 mt-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                 <div>
                  <h3 className="font-semibold text-slate-700">অভিজ্ঞতা</h3>
                  <p className="text-slate-600">{tutor.experience} বছর</p>
                </div>
              </div>
              {tutor.contact && (
                 <div className="flex items-start">
                   <svg className="w-6 h-6 mr-3 text-emerald-600 flex-shrink-0 mt-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>
                  <div>
                    <h3 className="font-semibold text-slate-700">ইমেইল</h3>
                    <p className="text-slate-600">{tutor.contact}</p>
                  </div>
                 </div>
              )}
            </div>

            <div className="mt-8">
               <h3 className="font-semibold text-slate-700">আমার সম্পর্কে</h3>
               <p className="text-slate-600 mt-2 leading-relaxed">{tutor.bio}</p>
            </div>

            {/* Google Drive Shared Study Materials section */}
            {tutor.driveMaterials && tutor.driveMaterials.length > 0 && (
              <div className="mt-10 pt-8 border-t border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 flex items-center mb-2">
                  <Cloud className="w-6 h-6 text-emerald-600 mr-2 shrink-0 animate-pulse" />
                  শেয়ারকৃত স্টাডি মেটেরিয়ালস (Shared Study Materials)
                </h3>
                <p className="text-sm text-slate-500 mb-5">
                  শিক্ষক কর্তৃক শিক্ষার্থীদের পড়ার সুবিধার জন্য সরাসরি উনার গুগল ড্রাইভ থেকে শেয়ার করা গুরুত্বপূর্ণ নোট এবং সাজেশনস:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {tutor.driveMaterials.map(material => (
                    <div 
                      key={material.id} 
                      className="p-4 border border-slate-200 hover:border-emerald-300 bg-slate-50/50 hover:bg-white rounded-xl flex items-center justify-between gap-4 transition-all hover:shadow-md"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2.5 bg-white border border-slate-100 rounded-lg shrink-0 shadow-sm">
                          {getFileIcon(material.mimeType || '')}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-800 text-sm truncate" title={material.name}>
                            {material.name}
                          </h4>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {formatBytes(material.size)}
                          </p>
                        </div>
                      </div>

                      <a 
                        href={material.webViewLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors shrink-0 shadow-sm cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>ডাউনলোড</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-10 text-center">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full max-w-sm bg-emerald-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-emerald-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 shadow-md"
              >
                যোগাযোগ করুন (Contact Tutor)
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Modal Backdrop */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden transform transition-all duration-300 scale-100 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-6 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 18c-.419 0-.817-.1-1.17-.279A8.91 8.91 0 013 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"/></svg>
                  শিক্ষকের সাথে যোগাযোগ
                </h3>
                <p className="text-xs text-slate-400 mt-1">{tutor.name} কে ইনকোয়ারি মেসেজ পাঠান</p>
              </div>
              <button 
                onClick={handleClose} 
                className="text-slate-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-grow">
              {isSubmitted ? (
                <div className="text-center py-8 px-4 animate-scale-in">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-4 shadow">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                  </div>
                  <h4 className="text-2xl font-bold text-slate-950">মেসেজ সফলভাবে পাঠানো হয়েছে!</h4>
                  <p className="text-slate-600 mt-3 text-sm leading-relaxed">
                    আপনার যোগাযোগের অনুরোধটি শিক্ষক {tutor.name} এর কাছে সফলভাবে জমা হয়েছে। তিনি আপনার মোবাইল নম্বরে (<span className="font-bold text-emerald-700">{form.phone}</span>) শীঘ্রই যোগাযোগ করবেন।
                  </p>
                  <div className="mt-8">
                    <button
                      onClick={handleClose}
                      className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors shadow-md text-sm"
                    >
                      বন্ধ করুন (Close)
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errorMessage && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs font-semibold">
                      {errorMessage}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      অনুরোধকারী ব্যক্তির নাম (শিক্ষার্থী/অভিভাবক) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="sender"
                      value={form.sender}
                      onChange={handleInputChange}
                      placeholder="আপনার নাম লিখুন"
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">
                        শিক্ষার্থীর শ্রেণী <span className="text-rose-500">*</span>
                      </label>
                      <select
                        name="class"
                        value={form.class}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2 border border-slate-300 bg-white rounded-lg text-sm shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                        required
                      >
                        <option value="">শ্রেণী নির্বাচন করুন</option>
                        {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">
                        পড়ানোর বিষয় <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={form.subject}
                        onChange={handleInputChange}
                        placeholder="যেমন: গণিত, ইংরেজি"
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      মোবাইল নম্বর (যোগাযোগের জন্য) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleInputChange}
                      placeholder="যেমন: 017xxxxxxxx"
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      বিস্তারিত অনুরোধ / মেসেজ <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      name="message"
                      rows={4}
                      value={form.message}
                      onChange={handleInputChange}
                      placeholder="আপনি কোন দিনগুলোতে এবং কীভাবে পড়াতে আগ্রহী তা বিস্তারিত লিখুন..."
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-3 border-t border-slate-100 shrink-0">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors"
                    >
                      বাতিল করুন
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors shadow-md"
                    >
                      মেসেজ পাঠান
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorProfilePage;
