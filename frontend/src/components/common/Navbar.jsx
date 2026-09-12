import React from 'react';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import { Building2, LogOut, ShieldCheck } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();

  const getRoleBadge = (role) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <span className="bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 text-[11px] font-semibold px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-800">Super Admin</span>;
      case 'WARDEN':
        return <span className="bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 text-[11px] font-semibold px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">Hostel Warden</span>;
      default:
        return <span className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">Student</span>;
    }
  };

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white sticky top-0 z-50 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 via-purple-700 to-slate-900 dark:from-white dark:via-indigo-200 dark:to-purple-300">
                Smart Hostel
              </span>
              <span className="hidden sm:inline-block ml-2.5 text-[11px] font-mono text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800 font-semibold">
                Compatibility Engine v2.0
              </span>
            </div>
          </div>

          {/* Controls & User Profile */}
          <div className="flex items-center space-x-3">
            <ThemeToggle />

            {user && (
              <div className="flex items-center space-x-3">
                <div className="hidden md:flex items-center space-x-3 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-1.5">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                    {user.student ? user.student.firstName[0] : (user.warden ? user.warden.name[0] : 'A')}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {user.student ? `${user.student.firstName} ${user.student.lastName}` : (user.warden ? user.warden.name : 'Administrator')}
                    </div>
                    <div className="flex items-center space-x-2 mt-0.5">
                      {getRoleBadge(user.role)}
                    </div>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-slate-800 px-3 py-2 rounded-xl text-sm font-medium transition"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
