import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  LayoutDashboard, Users, User, Calendar, 
  LogOut, FileText, Activity, Sun, Moon,
  Stethoscope, ChevronRight, Bell
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getNavItems = () => {
    switch (user?.role) {
      case 'ADMIN':
        return [
          { path: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={18} />, color: 'text-indigo-400' },
          { path: '/admin/doctors', label: 'Doctors', icon: <Stethoscope size={18} />, color: 'text-emerald-400' },
          { path: '/admin/patients', label: 'Patients', icon: <Users size={18} />, color: 'text-cyan-400' },
          { path: '/admin/profile', label: 'My Profile', icon: <User size={18} />, color: 'text-violet-400' },
        ];
      case 'DOCTOR':
        return [
          { path: '/doctor', label: 'Appointments', icon: <Calendar size={18} />, color: 'text-indigo-400' },
          { path: '/doctor/patients', label: 'My Patients', icon: <Users size={18} />, color: 'text-cyan-400' },
          { path: '/doctor/prescriptions', label: 'Prescriptions', icon: <FileText size={18} />, color: 'text-emerald-400' },
          { path: '/doctor/profile', label: 'My Profile', icon: <User size={18} />, color: 'text-violet-400' },
        ];
      case 'PATIENT':
        return [
          { path: '/patient', label: 'Dashboard', icon: <LayoutDashboard size={18} />, color: 'text-indigo-400' },
          { path: '/patient/appointments', label: 'Appointments', icon: <Calendar size={18} />, color: 'text-cyan-400' },
          { path: '/patient/prescriptions', label: 'Prescriptions', icon: <FileText size={18} />, color: 'text-emerald-400' },
          { path: '/patient/profile', label: 'My Profile', icon: <User size={18} />, color: 'text-violet-400' },
        ];
      default:
        return [];
    }
  };

  const roleColors = {
    ADMIN: { bg: 'from-violet-500 to-indigo-500', badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
    DOCTOR: { bg: 'from-emerald-500 to-teal-500', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    PATIENT: { bg: 'from-indigo-500 to-sky-500', badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  };
  const rc = roleColors[user?.role] || roleColors.PATIENT;

  return (
    <div className="w-64 bg-surface border-r border-border flex flex-col flex-shrink-0 z-50">
      {/* Logo */}
      <div className="h-16 px-5 flex items-center gap-3 border-b border-border">
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${rc.bg} flex items-center justify-center shadow-lg`}>
          <Activity size={20} strokeWidth={2.5} className="text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-content tracking-tight leading-none">Medicare</h2>
          <p className="text-[10px] uppercase tracking-widest text-content-muted font-medium">Hospital System</p>
        </div>
      </div>

      {/* User Panel */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${rc.bg} flex items-center justify-center text-white font-bold text-sm overflow-hidden shadow-md`}>
            {user?.profilePhoto
              ? <img src={user.profilePhoto} alt="avatar" className="w-full h-full object-cover" />
              : (user?.username?.charAt(0) || '?').toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-content truncate">{user?.username}</p>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${rc.badge}`}>
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        <p className="px-3 text-[10px] font-bold text-content-muted uppercase tracking-widest mb-2">Navigation</p>
        {getNavItems().map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-primary/10 text-primary border border-primary/15 shadow-sm'
                  : 'text-content-muted hover:bg-border/40 hover:text-content'
              }`
            }
          >
            <span className={item.color}>{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            <ChevronRight size={14} className="opacity-0 group-hover:opacity-50 transition-opacity" />
          </NavLink>
        ))}
      </div>

      {/* Logout */}
      <div className="p-3 border-t border-border">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500/80 hover:bg-red-500/10 hover:text-red-500 transition-all duration-150"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );
};

const Topbar = () => {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const pageTitle = () => {
    const path = window.location.pathname;
    if (path.includes('prescriptions')) return 'Prescriptions';
    if (path.includes('appointments')) return 'Appointments';
    if (path.includes('patients')) return 'Patients';
    if (path.includes('doctors')) return 'Doctors';
    if (path.includes('profile')) return 'My Profile';
    return 'Dashboard';
  };

  return (
    <div className="h-16 border-b border-border flex items-center justify-between px-6 bg-surface/70 backdrop-blur-xl flex-shrink-0 sticky top-0 z-40">
      <div>
        <h1 className="text-lg font-bold text-content leading-none">{pageTitle()}</h1>
        <p className="text-xs text-content-muted mt-0.5">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          className="p-2 rounded-xl bg-background border border-border text-content-muted hover:text-primary hover:border-primary/30 transition-all"
          title="Notifications"
        >
          <Bell size={18} />
        </button>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-background border border-border text-content-muted hover:text-primary hover:border-primary/30 transition-all"
          title={isDark ? 'Light Mode' : 'Dark Mode'}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="flex items-center gap-2.5 bg-background border border-border px-3 py-1.5 rounded-xl">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary overflow-hidden">
            {user?.profilePhoto
              ? <img src={user.profilePhoto} alt="avatar" className="w-full h-full object-cover" />
              : <User size={14} />}
          </div>
          <div>
            <p className="text-xs font-bold text-content leading-none">{user?.username}</p>
            <p className="text-[10px] text-primary font-semibold uppercase">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Layout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-background text-content relative">
      {/* Ambient background glows */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-15%] right-[-5%] w-[500px] h-[500px] bg-primary/8 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[450px] h-[450px] bg-secondary/8 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-emerald-500/4 rounded-full blur-[100px]" />
      </div>

      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <Topbar />
        <div className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
