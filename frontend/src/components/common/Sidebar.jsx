import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Building,
  Sparkles,
  RefreshCw,
  MessageSquare,
  Settings,
  ShieldAlert,
  FileSpreadsheet
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  const studentLinks = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/questionnaire', label: 'Compatibility Survey', icon: ClipboardList },
    { to: '/student/roommate-view', label: 'My Room & Roommates', icon: Sparkles },
    { to: '/student/change-request', label: 'Room Change Request', icon: RefreshCw },
    { to: '/student/feedback', label: 'Post-Allocation Feedback', icon: MessageSquare }
  ];

  const wardenLinks = [
    { to: '/warden/dashboard', label: 'Overview Dashboard', icon: LayoutDashboard },
    { to: '/warden/matching-studio', label: 'Matching Studio', icon: Sparkles },
    { to: '/warden/hostel-rooms', label: 'Hostel & Room Grid', icon: Building },
    { to: '/warden/allocations', label: 'Allocation Versions & Export', icon: FileSpreadsheet },
    { to: '/warden/requests', label: 'Room Change Requests', icon: RefreshCw }
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'System Dashboard', icon: LayoutDashboard },
    { to: '/admin/matching-config', label: 'Weight Configurator', icon: Settings },
    { to: '/warden/matching-studio', label: 'Matching Studio', icon: Sparkles },
    { to: '/warden/hostel-rooms', label: 'Hostel & Room Grid', icon: Building },
    { to: '/admin/requests', label: 'Change Requests', icon: ShieldAlert }
  ];

  const links = role === 'SUPER_ADMIN' ? adminLinks : (role === 'WARDEN' ? wardenLinks : studentLinks);

  return (
    <aside className="w-64 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between transition-colors duration-200 shrink-0">
      <div>
        <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-3">
          {role.replace('_', ' ')} MENU
        </div>
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'hover:bg-slate-200/70 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white text-slate-600 dark:text-slate-400'
                  }`
                }
              >
                <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="p-3.5 bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 shadow-sm">
        <p className="font-bold text-slate-800 dark:text-slate-200">Data-Driven Living</p>
        <p className="mt-1 leading-relaxed">Smart Hostel pairs lifestyle compatibility with academic & skill growth.</p>
      </div>
    </aside>
  );
};

export default Sidebar;
