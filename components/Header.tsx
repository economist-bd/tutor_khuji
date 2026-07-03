
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser, logoutUser } from '../services/authService';

const Header: React.FC = () => {
  const currentUser = getCurrentUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/');
    window.location.reload();
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-emerald-600">
              টিউটর খুঁজি
            </Link>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-600 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              হোম
            </Link>
            <Link to="/find-tutor" className="text-gray-600 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              শিক্ষক খুঁজুন
            </Link>
            <Link to="/dashboard" className="text-gray-600 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              ড্যাশবোর্ড
            </Link>
            
            {currentUser ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-full border border-emerald-200">
                  👋 {currentUser.name} ({currentUser.userType})
                </span>
                <button 
                  onClick={handleLogout} 
                  className="text-white bg-rose-600 hover:bg-rose-700 px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm cursor-pointer"
                >
                  লগআউট
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-gray-600 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  লগইন
                </Link>
                <Link to="/register" className="text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  নিবন্ধন করুন
                </Link>
              </div>
            )}
          </nav>
          
          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center gap-2">
            <Link to="/dashboard" className="text-gray-600 hover:text-emerald-600 px-2 py-1.5 rounded-md text-xs font-medium transition-colors">
              ড্যাশবোর্ড
            </Link>
            {currentUser ? (
              <button 
                onClick={handleLogout} 
                className="text-white bg-rose-600 hover:bg-rose-700 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors"
              >
                লগআউট
              </button>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-emerald-600 px-2 py-1.5 rounded-md text-xs font-medium transition-colors">
                  লগইন
                </Link>
                <Link to="/register" className="text-white bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors">
                  নিবন্ধন
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
