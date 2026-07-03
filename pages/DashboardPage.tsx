import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Tutor, UserType } from '../types';
import { SUBJECTS, CLASSES, LOCATIONS } from '../constants';
import { 
  getTutors, 
  getTutorById, 
  saveTutor, 
  getTutorStats, 
  getMockMessages,
  addTutor
} from '../services/tutorService';
import { getCurrentUser, logoutUser, updateCurrentUserProfile } from '../services/authService';
import { generateTutorBio } from '../services/geminiService';
import BookOpenIcon from '../components/icons/BookOpenIcon';
import MapPinIcon from '../components/icons/MapPinIcon';
import UserCircleIcon from '../components/icons/UserCircleIcon';
import { 
  initGoogleAuth, 
  googleSignIn, 
  logoutGoogle, 
  getOrCreateFolder, 
  listFiles, 
  uploadFileToDrive, 
  deleteFileFromDrive 
} from '../services/googleDriveService';
import { 
  Cloud, 
  UploadCloud, 
  FileText, 
  FolderOpen, 
  Trash2, 
  Share2, 
  ExternalLink, 
  Lock, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  File, 
  Video, 
  Image as ImageIcon, 
  FileSpreadsheet, 
  FileArchive,
  CheckCircle
} from 'lucide-react';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [currentTutor, setCurrentTutor] = useState<Tutor | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  
  // Edit Form State
  const [editForm, setEditForm] = useState({
    location: '',
    classLevel: '',
    subjects: '',
    experience: 0,
    bio: '',
    contact: ''
  });
  
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [replyMessageId, setReplyMessageId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replySuccess, setReplySuccess] = useState<number | null>(null);

  // Student Dashboard Specific State
  const [studentInquiries, setStudentInquiries] = useState<any[]>([]);
  const [recommendedTutors, setRecommendedTutors] = useState<Tutor[]>([]);

  // Google Drive Integration State
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [driveToken, setDriveToken] = useState<string | null>(null);
  const [isDriveConnecting, setIsDriveConnecting] = useState(false);
  const [driveFiles, setDriveFiles] = useState<any[]>([]);
  const [isDriveLoading, setIsDriveLoading] = useState(false);
  const [driveError, setDriveError] = useState<string | null>(null);
  const [isUploadingToDrive, setIsUploadingToDrive] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [driveFolderId, setDriveFolderId] = useState<string | null>(null);

  // Initialize Google Auth listener
  useEffect(() => {
    const unsubscribe = initGoogleAuth(
      (user, token) => {
        setGoogleUser(user);
        setDriveToken(token);
      },
      () => {
        setGoogleUser(null);
        setDriveToken(null);
      }
    );
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const loadDriveContent = async () => {
    setIsDriveLoading(true);
    setDriveError(null);
    try {
      const folderId = await getOrCreateFolder('TutorKhuji_Materials');
      setDriveFolderId(folderId);
      const files = await listFiles(folderId);
      setDriveFiles(files);
    } catch (err: any) {
      console.error(err);
      setDriveError('গুগল ড্রাইভ ফাইল লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার ট্রাই করুন।');
    } finally {
      setIsDriveLoading(false);
    }
  };

  useEffect(() => {
    if (driveToken && currentUser?.userType === UserType.TUTOR) {
      loadDriveContent();
    }
  }, [driveToken]);

  const handleConnectDrive = async () => {
    setIsDriveConnecting(true);
    setDriveError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
        setDriveToken(result.accessToken);
      }
    } catch (err: any) {
      console.error(err);
      setDriveError('গুগল ড্রাইভ কানেক্ট করতে ব্যর্থ হয়েছে।');
    } finally {
      setIsDriveConnecting(false);
    }
  };

  const handleDisconnectDrive = async () => {
    try {
      await logoutGoogle();
      setGoogleUser(null);
      setDriveToken(null);
      setDriveFiles([]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDriveFileUpload = async (file: File) => {
    if (!driveFolderId) return;
    setIsUploadingToDrive(true);
    setDriveError(null);
    try {
      const uploaded = await uploadFileToDrive(file, driveFolderId);
      // Auto refresh files from Drive
      await loadDriveContent();
      
      // Auto share uploaded file to Tutor's profile
      if (currentTutor) {
        const newMaterial = {
          id: uploaded.id,
          name: uploaded.name,
          webViewLink: uploaded.webViewLink,
          webContentLink: uploaded.webContentLink,
          size: uploaded.size,
          mimeType: uploaded.mimeType
        };
        const updatedMaterials = [...(currentTutor.driveMaterials || []), newMaterial];
        const updatedTutor = { ...currentTutor, driveMaterials: updatedMaterials };
        saveTutor(updatedTutor);
        setCurrentTutor(updatedTutor);
        setTutors(getTutors());
      }
    } catch (err: any) {
      console.error(err);
      setDriveError('ফাইল আপলোড করতে সমস্যা হয়েছে।');
    } finally {
      setIsUploadingToDrive(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleDriveFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleShareFile = (file: any) => {
    if (!currentTutor) return;
    const isAlreadyShared = currentTutor.driveMaterials?.some(m => m.id === file.id);
    if (isAlreadyShared) return;

    const newMaterial = {
      id: file.id,
      name: file.name,
      webViewLink: file.webViewLink,
      webContentLink: file.webContentLink,
      size: file.size,
      mimeType: file.mimeType
    };

    const updatedMaterials = [...(currentTutor.driveMaterials || []), newMaterial];
    const updatedTutor = { ...currentTutor, driveMaterials: updatedMaterials };
    
    saveTutor(updatedTutor);
    setCurrentTutor(updatedTutor);
    setTutors(getTutors());
  };

  const handleUnshareFile = (fileId: string) => {
    if (!currentTutor) return;
    const updatedMaterials = (currentTutor.driveMaterials || []).filter(m => m.id !== fileId);
    const updatedTutor = { ...currentTutor, driveMaterials: updatedMaterials };
    
    saveTutor(updatedTutor);
    setCurrentTutor(updatedTutor);
    setTutors(getTutors());
  };

  const handleDeleteDriveFile = async (fileId: string, fileName: string) => {
    const confirmed = window.confirm(
      `আপনি কি নিশ্চিত যে আপনি আপনার গুগল ড্রাইভ থেকে "${fileName}" ফাইলটি ডিলিট করতে চান? এটি প্রোফাইল থেকেও আন-শেয়ার হয়ে যাবে।`
    );
    if (!confirmed) return;

    setIsDriveLoading(true);
    try {
      await deleteFileFromDrive(fileId);
      handleUnshareFile(fileId);
      await loadDriveContent();
    } catch (err: any) {
      console.error(err);
      setDriveError('ফাইল ডিলিট করতে সমস্যা হয়েছে।');
    } finally {
      setIsDriveLoading(false);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return <FileText className="w-6 h-6 text-red-500" />;
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType.includes('csv')) return <FileSpreadsheet className="w-6 h-6 text-emerald-600" />;
    if (mimeType.includes('image')) return <ImageIcon className="w-6 h-6 text-blue-500" />;
    if (mimeType.includes('video')) return <Video className="w-6 h-6 text-indigo-500" />;
    if (mimeType.includes('zip') || mimeType.includes('rar')) return <FileArchive className="w-6 h-6 text-amber-600" />;
    return <File className="w-6 h-6 text-slate-500" />;
  };

  const formatBytes = (bytes: number = 0, decimals = 2) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Authenticated redirect and state initialization
  useEffect(() => {
    if (!currentUser) {
      return;
    }

    const allTutors = getTutors();
    setTutors(allTutors);

    if (currentUser.userType === UserType.TUTOR) {
      // Find or initialize tutor profile for logged-in teacher
      let activeTutor = allTutors.find(t => 
        t.id === currentUser.tutorProfileId || 
        t.contact?.toLowerCase() === currentUser.email.toLowerCase()
      );

      if (!activeTutor) {
        // Create an active profile for them on the fly
        activeTutor = addTutor({
          name: currentUser.name,
          subjects: currentUser.subjects && currentUser.subjects.length > 0 ? currentUser.subjects : ['গণিত', 'ইংরেজি'],
          classLevel: currentUser.classLevel || 'দশম শ্রেণী',
          location: currentUser.location || 'মিরপুর, ঢাকা',
          experience: 2,
          bio: 'আমি একজন ডেডিকেটেড শিক্ষক এবং শিক্ষার্থীদের পাশে থেকে সাহায্য করতে ভালোবাসি।',
          contact: currentUser.email,
        });
        
        // Save the profile link back to current user
        updateCurrentUserProfile({ tutorProfileId: activeTutor.id });
      }

      setCurrentTutor(activeTutor);
      setStats(getTutorStats(activeTutor.id));
      setMessages(getMockMessages(activeTutor.id));
      
      setEditForm({
        location: activeTutor.location,
        classLevel: activeTutor.classLevel,
        subjects: activeTutor.subjects.join(', '),
        experience: activeTutor.experience,
        bio: activeTutor.bio,
        contact: activeTutor.contact || ''
      });
    } else {
      // Initialize Student Dashboard details
      // Get custom messages sent by this student
      const customStored = localStorage.getItem('tutor_khuji_custom_messages');
      let mySentInquiries: any[] = [];
      if (customStored) {
        try {
          const parsed = JSON.parse(customStored);
          mySentInquiries = parsed.filter((m: any) => 
            m.phone === currentUser.phone || 
            m.sender?.toLowerCase() === currentUser.name?.toLowerCase()
          );
        } catch (e) {
          console.error(e);
        }
      }
      setStudentInquiries(mySentInquiries);

      // Filter recommended tutors based on student preferred subjects and location
      const studentSubs = currentUser.subjects || [];
      const studentClass = currentUser.classLevel || '';
      const recs = allTutors.filter(t => 
        t.classLevel === studentClass ||
        t.subjects.some(sub => studentSubs.includes(sub)) ||
        t.location === currentUser.location
      ).slice(0, 6); // Limit to 6 recommendations

      setRecommendedTutors(recs.length > 0 ? recs : allTutors.slice(0, 3));
    }
  }, []);

  const handleLogout = () => {
    logoutUser();
    navigate('/');
    window.location.reload();
  };

  const handleAvailabilityToggle = () => {
    if (!currentTutor) return;
    
    const updated = {
      ...currentTutor,
      isAvailable: currentTutor.isAvailable === false ? true : false
    };
    
    saveTutor(updated);
    setCurrentTutor(updated);
    setTutors(getTutors());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: name === 'experience' ? Number(value) || 0 : value
    }));
  };

  const handleGenerateBioWithAI = async () => {
    if (!currentTutor) return;
    setIsGeneratingBio(true);
    try {
      const generated = await generateTutorBio(
        currentTutor.name, 
        editForm.subjects, 
        String(editForm.experience)
      );
      setEditForm(prev => ({ ...prev, bio: generated }));
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingBio(false);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTutor) return;
    
    const updated: Tutor = {
      ...currentTutor,
      location: editForm.location,
      classLevel: editForm.classLevel,
      subjects: editForm.subjects.split(',').map(s => s.trim()).filter(Boolean),
      experience: editForm.experience,
      bio: editForm.bio,
      contact: editForm.contact
    };
    
    saveTutor(updated);
    setCurrentTutor(updated);
    setTutors(getTutors());
    setSaveSuccess(true);
    
    setTimeout(() => {
      setSaveSuccess(false);
    }, 4000);
  };

  const handleSendReply = (messageId: number) => {
    if (!replyText.trim()) return;
    setReplySuccess(messageId);
    setTimeout(() => {
      setReplySuccess(null);
      setReplyMessageId(null);
      setReplyText('');
    }, 3000);
  };

  // -------------------------------------------------------------
  // Case 1: Unauthenticated View
  // -------------------------------------------------------------
  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-lg text-center">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 text-amber-600 mb-6">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            লগইন করা আবশ্যক
          </h1>
          <p className="mt-4 text-slate-600 leading-relaxed text-sm">
            ড্যাশবোর্ডে প্রবেশ করতে অনুগ্রহ করে আপনার শিক্ষক বা ছাত্র-ছাত্রী একাউন্টে লগইন করুন।
          </p>

          <div className="mt-8 space-y-3">
            <Link
              to="/login"
              className="w-full inline-block py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors shadow-md text-sm"
            >
              লগইন করুন (Login)
            </Link>
            <Link
              to="/register"
              className="w-full inline-block py-3 px-6 border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold rounded-lg transition-colors text-sm"
            >
              নতুন একাউন্ট নিবন্ধন করুন
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Case 2: Student Dashboard View
  // -------------------------------------------------------------
  if (currentUser.userType === UserType.STUDENT) {
    return (
      <div className="bg-slate-50 min-h-screen">
        {/* Top Student Banner */}
        <div className="bg-slate-900 text-white py-8 shadow-md">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center">
              <div className="w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg border-2 border-emerald-500">
                {currentUser.name.charAt(0)}
              </div>
              <div className="ml-4">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{currentUser.name}</h1>
                  <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500 text-white rounded-full">
                    ছাত্র-ছাত্রী ড্যাশবোর্ড
                  </span>
                </div>
                <p className="text-slate-400 text-sm mt-0.5">{currentUser.classLevel} • {currentUser.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link 
                to="/find-tutor"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold text-white rounded-lg transition-colors shadow"
              >
                শিক্ষক খুঁজুন
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-sm font-semibold rounded-lg transition-colors text-white"
              >
                লগআউট (Logout)
              </button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Student Inquiries & Info (Left 2 columns) */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Profile Overview */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                  <span className="h-5 w-1 bg-emerald-600 rounded mr-2 inline-block"></span>
                  আমার প্রোফাইল বিবরণী
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-400 font-bold">শ্রেণী/ক্লাস</p>
                    <p className="text-slate-800 font-semibold mt-1">{currentUser.classLevel || 'তথ্য দেওয়া হয়নি'}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-400 font-bold">যোগাযোগের মোবাইল</p>
                    <p className="text-slate-800 font-semibold mt-1">{currentUser.phone || 'তথ্য দেওয়া হয়নি'}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-400 font-bold">ইলাকা/অবস্থান</p>
                    <p className="text-slate-800 font-semibold mt-1">{currentUser.location || 'তথ্য দেওয়া হয়নি'}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-xs text-slate-400 font-bold">পছন্দের বিষয়সমূহ</p>
                    <p className="text-emerald-700 font-semibold mt-1">
                      {currentUser.subjects && currentUser.subjects.length > 0 
                        ? currentUser.subjects.join(', ') 
                        : 'তথ্য দেওয়া হয়নি'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Sent inquiries to tutors */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                  <span className="h-5 w-1 bg-emerald-600 rounded mr-2 inline-block"></span>
                  শিক্ষকদের কাছে পাঠানো যোগাযোগের অনুরোধসমূহ ({studentInquiries.length})
                </h2>

                {studentInquiries.length > 0 ? (
                  <div className="space-y-4">
                    {studentInquiries.map((inq: any) => {
                      const tutorDetails = getTutorById(inq.tutorId);
                      return (
                        <div key={inq.id} className="p-5 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-3 mb-3">
                            <div className="flex items-center gap-3">
                              {tutorDetails ? (
                                <>
                                  <img 
                                    src={tutorDetails.imageUrl} 
                                    alt={tutorDetails.name} 
                                    className="w-10 h-10 rounded-full object-cover shadow"
                                  />
                                  <div>
                                    <h4 className="font-bold text-slate-900">{tutorDetails.name}</h4>
                                    <p className="text-xs text-slate-500">{tutorDetails.classLevel} • {tutorDetails.location}</p>
                                  </div>
                                </>
                              ) : (
                                <div>
                                  <h4 className="font-bold text-slate-900">শিক্ষক (ID: {inq.tutorId})</h4>
                                  <p className="text-xs text-slate-500">প্রোফাইল অবলুপ্ত</p>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-1 text-[10px] font-bold bg-amber-50 text-amber-700 rounded-full border border-amber-200">
                                ⏳ অপেক্ষমাণ (Pending Reply)
                              </span>
                              {tutorDetails && (
                                <Link 
                                  to={`/tutor/${tutorDetails.id}`} 
                                  className="text-xs text-emerald-600 font-bold hover:underline"
                                >
                                  প্রোফাইল দেখুন →
                                </Link>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex gap-2 flex-wrap">
                              <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-700 rounded">
                                বিষয়: {inq.subject}
                              </span>
                              <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-700 rounded">
                                শ্রেণী: {inq.class}
                              </span>
                            </div>
                            <p className="text-slate-600 text-sm italic bg-slate-50 p-3 rounded-lg border border-slate-100 mt-2">
                              "{inq.message}"
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl text-slate-400">
                    <p className="mb-4">আপনি এখনও কোনো শিক্ষকের কাছে যোগাযোগের অনুরোধ পাঠাননি।</p>
                    <Link
                      to="/find-tutor"
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow inline-block transition-colors"
                    >
                      টিউটরদের তালিকা ব্রাউজ করুন
                    </Link>
                  </div>
                )}
              </div>

            </div>

            {/* Sidebar / Recommended Tutors (Right 1 column) */}
            <div className="space-y-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                  <span className="h-5 w-1 bg-emerald-600 rounded mr-2 inline-block"></span>
                  আপনার জন্য উপযুক্ত শিক্ষকবৃন্দ
                </h2>
                
                <div className="space-y-4">
                  {recommendedTutors.map(t => (
                    <div key={t.id} className="p-3 border border-slate-100 rounded-lg hover:border-emerald-200 hover:bg-emerald-50/20 transition-all">
                      <div className="flex items-center gap-3">
                        <img 
                          src={t.imageUrl} 
                          alt={t.name} 
                          className="w-12 h-12 rounded-full object-cover border" 
                        />
                        <div className="flex-grow">
                          <h4 className="font-bold text-slate-950 text-sm">{t.name}</h4>
                          <p className="text-[11px] text-slate-500">{t.classLevel}</p>
                          <p className="text-[10px] text-emerald-600 font-bold mt-0.5">{t.subjects.slice(0, 2).join(', ')}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex justify-between items-center pt-2.5 border-t border-slate-100">
                        <span className="text-[10px] font-semibold text-slate-500">⭐ {t.rating.toFixed(1)} ({t.experience} বছর অভিজ্ঞতা)</span>
                        <Link 
                          to={`/tutor/${t.id}`}
                          className="text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1 rounded transition-colors shadow-sm"
                        >
                          যোগাযোগ করুন
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Case 3: Teacher Dashboard View
  // -------------------------------------------------------------
  if (!currentTutor) return null; // Safe guard, should be initialized in useEffect

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white py-8 shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center">
            <img 
              src={currentTutor.imageUrl} 
              alt={currentTutor.name} 
              className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500 shadow-lg" 
            />
            <div className="ml-4">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{currentTutor.name}</h1>
                <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${currentTutor.isAvailable !== false ? 'bg-emerald-500 text-white' : 'bg-slate-600 text-slate-300'}`}>
                  {currentTutor.isAvailable !== false ? 'উপলব্ধ' : 'ব্যস্ত'}
                </span>
              </div>
              <p className="text-slate-400 text-sm">{currentTutor.classLevel}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              to={`/tutor/${currentTutor.id}`}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-lg border border-slate-700 transition-colors"
            >
              পাবলিক প্রোফাইল দেখুন
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
            >
              লগআউট (Logout)
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">প্রোফাইল ভিউ (Views)</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-2">{stats?.profileViews}</h3>
              <p className="text-xs text-emerald-600 mt-1 flex items-center">
                <span>↑ ১২% বৃদ্ধি পেয়েছে</span>
              </p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">যোগাযোগের অনুরোধ (Requests)</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-2">{stats?.contactRequests} টি</h3>
              <p className="text-xs text-slate-500 mt-1">সবমিলিয়ে জমা হওয়া মেসেজ</p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"/></svg>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">গড় প্রোফাইল রেটিং</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-2">{currentTutor.rating.toFixed(1)} ⭐</h3>
              <p className="text-xs text-amber-600 mt-1">পাবলিক রিভিউ ভিত্তিক স্কোর</p>
            </div>
            <div className="p-3 bg-amber-50 text-amber-500 rounded-lg">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">রেসপন্স হার (Response)</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-2">{stats?.responseRate}%</h3>
              <p className="text-xs text-emerald-600 mt-1">গড় রেসপন্স সময়: ~২ ঘণ্টা</p>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Availability & Inquiries (Left 2 columns in large screens) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Availability Box */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                <span className="h-5 w-1 bg-emerald-600 rounded mr-2 inline-block"></span>
                টিউটর প্রাপ্যতা অবস্থা (Teaching Availability Status)
              </h2>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-slate-50 p-5 rounded-xl border border-slate-200">
                <div className="flex-grow">
                  <h3 className="font-bold text-slate-800">
                    {currentTutor.isAvailable !== false ? 'বর্তমানে নতুন ছাত্র পড়ানোর জন্য উপলব্ধ' : 'বর্তমানে কোনো ছাত্র নিচ্ছেন না'}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {currentTutor.isAvailable !== false 
                      ? 'আপনার প্রোফাইল সার্চ তালিকায় সক্রিয় আছে এবং শিক্ষার্থীরা সরাসরি যোগাযোগ করতে পারবে।'
                      : 'আপনি সার্চ তালিকায় "বুকড" হিসেবে দৃশ্যমান হবেন। নতুন ছাত্র নেওয়ার সময় আবার এটি চালু করুন।'
                    }
                  </p>
                </div>
                
                <button
                  type="button"
                  onClick={handleAvailabilityToggle}
                  className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    currentTutor.isAvailable !== false ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      currentTutor.isAvailable !== false ? 'translate-x-7' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Google Drive Study Materials Manager */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center">
                  <Cloud className="w-6 h-6 text-emerald-600 mr-2 shrink-0" />
                  গুগল ড্রাইভ স্টাডি মেটেরিয়ালস (Google Drive Materials)
                </h2>
                {driveToken && (
                  <button
                    onClick={handleDisconnectDrive}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg border border-rose-200 transition-colors cursor-pointer"
                  >
                    ডিসকানেক্ট করুন (Disconnect)
                  </button>
                )}
              </div>

              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                আপনার শিক্ষার্থীদের জন্য লেকচার শিট, ক্লাস নোট, পিডিএফ বা সাজেশন্স সরাসরি আপনার গুগল ড্রাইভ থেকে পাবলিক প্রোফাইলে শেয়ার করুন। শিক্ষার্থীরা সেগুলো সরাসরি ডাউনলোড বা দেখতে পারবে।
              </p>

              {driveError && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-sm font-semibold flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>{driveError}</span>
                  <button 
                    onClick={loadDriveContent}
                    className="ml-auto text-xs bg-rose-100 text-rose-800 px-2.5 py-1 rounded-md border border-rose-200 hover:bg-rose-200"
                  >
                    পুনরায় চেষ্টা
                  </button>
                </div>
              )}

              {!driveToken ? (
                <div className="text-center p-8 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                  <div className="inline-flex p-4 bg-emerald-50 rounded-full text-emerald-600 mb-4">
                    <Cloud className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">গুগল ড্রাইভ কানেক্ট করা নেই</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    আপনার গুগল ড্রাইভ সংযোগ করে একটি ডেডিকেটেড ফোল্ডার তৈরি করুন এবং সহজেই ফাইল শেয়ারিং শুরু করুন।
                  </p>
                  <button
                    type="button"
                    disabled={isDriveConnecting}
                    onClick={handleConnectDrive}
                    className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all text-sm disabled:bg-slate-300 cursor-pointer"
                  >
                    {isDriveConnecting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        কানেক্ট হচ্ছে...
                      </>
                    ) : (
                      <>
                        <Cloud className="w-4 h-4" />
                        গুগল ড্রাইভ সংযোগ করুন
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Connected Account Display */}
                  <div className="flex items-center gap-3 p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                    <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                      <FolderOpen className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-grow">
                      <p className="text-[10px] text-slate-400">সংযুক্ত গুগল অ্যাকাউন্ট</p>
                      <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">{googleUser?.email || localStorage.getItem('tutor_khuji_google_email') || 'Google Account Connected'}</p>
                    </div>
                    <span className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle className="w-3 h-3" />
                      কানেক্টেড
                    </span>
                  </div>

                  {/* Drag and Drop Upload Area */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleFileDrop}
                    className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                      dragActive 
                        ? 'border-emerald-500 bg-emerald-50/40 scale-[0.99]' 
                        : 'border-slate-300 bg-slate-50 hover:bg-slate-100/50 hover:border-slate-400'
                    }`}
                  >
                    <input
                      type="file"
                      id="drive-file-upload"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleDriveFileUpload(e.target.files[0]);
                        }
                      }}
                    />
                    <label htmlFor="drive-file-upload" className="cursor-pointer block">
                      <div className="inline-flex p-3 bg-white border border-slate-200 text-slate-500 rounded-xl shadow-sm mb-3">
                        <UploadCloud className="w-6 h-6 text-emerald-600" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800">স্টাডি মেটেরিয়াল ফাইল আপলোড করুন</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        এখানে ফাইল ড্র্যাগ অ্যান্ড ড্রপ করুন অথবা <span className="text-emerald-600 font-bold underline">ক্লিক করে ফাইল সিলেক্ট করুন</span>
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1.5">
                        PDF, DOCX, ZIP বা যেকোনো ইমেজ ফাইল
                      </p>
                    </label>

                    {isUploadingToDrive && (
                      <div className="absolute inset-0 bg-white/90 rounded-2xl flex flex-col items-center justify-center">
                        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mb-2" />
                        <p className="text-sm font-bold text-slate-800">গুগল ড্রাইভে ফাইল আপলোড হচ্ছে...</p>
                        <p className="text-xs text-slate-500 mt-1">ফাইলটি আপলোড হওয়ার পর অটোমেটিক শেয়ার হয়ে যাবে।</p>
                      </div>
                    )}
                  </div>

                  {/* Files List inside TutorKhuji_Materials folder */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-800">গুগল ড্রাইভ ফাইলসমূহ ({driveFiles.length})</h3>
                      <button 
                        onClick={loadDriveContent}
                        className="text-xs font-bold text-slate-500 hover:text-emerald-600 flex items-center gap-1 transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        রিফ্রেশ
                      </button>
                    </div>

                    {isDriveLoading ? (
                      <div className="text-center py-8">
                        <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin mx-auto mb-2" />
                        <p className="text-xs text-slate-500">লোড হচ্ছে...</p>
                      </div>
                    ) : driveFiles.length > 0 ? (
                      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                        {driveFiles.map(file => {
                          const isShared = currentTutor.driveMaterials?.some(m => m.id === file.id);
                          return (
                            <div key={file.id} className="p-3 border border-slate-100 hover:border-slate-200 bg-white rounded-xl flex items-center gap-3 transition-colors shadow-sm">
                              <div className="shrink-0">
                                {getFileIcon(file.mimeType || '')}
                              </div>
                              <div className="flex-grow min-w-0">
                                <h4 className="font-bold text-slate-800 text-xs truncate" title={file.name}>{file.name}</h4>
                                <p className="text-[10px] text-slate-400 mt-0.5">{formatBytes(file.size)}</p>
                              </div>
                              
                              <div className="flex items-center gap-1.5 shrink-0">
                                {isShared ? (
                                  <div className="flex items-center gap-1">
                                    <span className="hidden sm:inline-block text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md">
                                      শেয়ারড ✓
                                    </span>
                                    <button
                                      onClick={() => handleUnshareFile(file.id)}
                                      title="আন-শেয়ার করুন"
                                      className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-rose-600 rounded-lg border border-slate-100 transition-colors"
                                    >
                                      <Lock className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleShareFile(file)}
                                    title="প্রোফাইলে শেয়ার করুন"
                                    className="px-2.5 py-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 rounded-lg transition-all flex items-center gap-1"
                                  >
                                    <Share2 className="w-3.5 h-3.5" />
                                    <span>শেয়ার</span>
                                  </button>
                                )}

                                <a
                                  href={file.webViewLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="ওপেন করুন"
                                  className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-indigo-600 rounded-lg border border-slate-100 transition-colors"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>

                                <button
                                  onClick={() => handleDeleteDriveFile(file.id, file.name)}
                                  title="ড্রাইভ থেকে ডিলিট করুন"
                                  className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg border border-transparent hover:border-rose-100 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                        আপনার গুগল ড্রাইভ ফোল্ডারে কোনো ফাইল পাওয়া যায়নি। উপরে ফাইল আপলোড করুন।
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Inquiries / Messages Feed */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                <span className="h-5 w-1 bg-emerald-600 rounded mr-2 inline-block"></span>
                শিক্ষার্থীদের যোগাযোগের অনুরোধসমূহ ({messages.length})
              </h2>

              {messages.length > 0 ? (
                <div className="space-y-4">
                  {messages.map(msg => (
                    <div key={msg.id} className="p-5 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-800">{msg.sender}</span>
                            <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 rounded border border-emerald-100">
                              {msg.class}
                            </span>
                            <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700 rounded border border-indigo-100">
                              {msg.subject}
                            </span>
                          </div>
                          <span className="text-slate-400 text-xs block mt-1">{msg.date}</span>
                        </div>
                        <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                          ফোন: {msg.phone}
                        </span>
                      </div>
                      
                      <p className="mt-3 text-slate-600 text-sm leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                        "{msg.message}"
                      </p>

                      <div className="mt-4 flex gap-2 justify-end">
                        {replyMessageId === msg.id ? (
                          <div className="w-full space-y-3">
                            <textarea
                              rows={2}
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="আপনার উত্তর লিখুন..."
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setReplyMessageId(null)}
                                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                              >
                                বাতিল
                              </button>
                              <button
                                onClick={() => handleSendReply(msg.id)}
                                className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors"
                              >
                                উত্তর পাঠান
                              </button>
                            </div>
                          </div>
                        ) : replySuccess === msg.id ? (
                          <span className="text-emerald-600 text-xs font-bold bg-green-50 px-3 py-1 rounded border border-green-200">
                            ✓ উত্তর পাঠানো হয়েছে! (এসএমএস এর মাধ্যমে পাঠানো হলো)
                          </span>
                        ) : (
                          <>
                            <a 
                              href={`tel:${msg.phone}`}
                              className="px-3 py-1.5 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors flex items-center"
                            >
                              <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.387a20.302 20.302 0 01-6.797-6.797c-.155-.44.01-1.27.387-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"/></svg>
                              কল করুন
                            </a>
                            <button
                              onClick={() => setReplyMessageId(msg.id)}
                              className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors"
                            >
                              উত্তর দিন
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl text-slate-400">
                  বর্তমানে কোনো ছাত্রের যোগাযোগের অনুরোধ নেই।
                </div>
              )}
            </div>

          </div>

          {/* Edit Profile Form (Right column in large screens) */}
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                <span className="h-5 w-1 bg-emerald-600 rounded mr-2 inline-block"></span>
                প্রোফাইল তথ্য আপডেট
              </h2>

              {saveSuccess && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm font-semibold flex items-center">
                  <svg className="w-5 h-5 mr-2 text-emerald-600 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                  আপনার প্রোফাইল তথ্য সফলভাবে আপডেট করা হয়েছে!
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700">বর্তমান অবস্থান</label>
                  <select 
                    name="location" 
                    value={editForm.location} 
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                  >
                    {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700">যেসব শ্রেণী পড়ান</label>
                  <select 
                    name="classLevel" 
                    value={editForm.classLevel} 
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                  >
                    {CLASSES.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700">পড়ানোর বিষয়সমূহ</label>
                  <input 
                    type="text" 
                    name="subjects" 
                    value={editForm.subjects} 
                    onChange={handleInputChange}
                    placeholder="যেমন: গণিত, রসায়ন"
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">একাধিক বিষয় কমা (,) দিয়ে আলাদা করুন</span>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700">অভিজ্ঞতা (বছর)</label>
                  <input 
                    type="number" 
                    name="experience" 
                    value={editForm.experience} 
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700">যোগাযোগের ইমেইল / ঠিকানা</label>
                  <input 
                    type="text" 
                    name="contact" 
                    value={editForm.contact} 
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-semibold text-slate-700">আপনার সম্পর্কে বায়ো (Bio)</label>
                    <button
                      type="button"
                      disabled={isGeneratingBio}
                      onClick={handleGenerateBioWithAI}
                      className="text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-2 py-0.5 rounded transition-colors disabled:bg-slate-300"
                    >
                      {isGeneratingBio ? 'তৈরি হচ্ছে...' : '✨ AI রিরাইট'}
                    </button>
                  </div>
                  <textarea 
                    name="bio" 
                    rows={5} 
                    value={editForm.bio} 
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 shadow-md transition-colors text-sm cursor-pointer"
                >
                  প্রোফাইল সংরক্ষণ করুন
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
