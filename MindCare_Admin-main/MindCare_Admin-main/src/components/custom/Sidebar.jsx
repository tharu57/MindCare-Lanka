import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, User, Stethoscope, Calendar, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { removeAuthToken } from '../../utils/auth';
import logo from "../../assets/logo.png";

const Sidebar = () => {
  const navigate = useNavigate();
  const navItems = [
    { name: 'Therapist', path: '/therapist', icon: User },
    { name: 'Treatments', path: '/treatments', icon: Stethoscope },
    { name: 'Appointments', path: '/appointments', icon: Calendar },
    { name: 'Customers', path: '/customers', icon: Users },
  ];

  const handleLogout = () => {
    removeAuthToken();
    navigate('/login'); // Better than window.location for SPA
  };

  return (
    <aside className="flex h-screen w-64 flex-col bg-white border-r border-gray-200 fixed left-0 top-0">
      {/* Logo Section */}
      <div className="flex items-center justify-center h-20 border-b border-gray-200">
        <img
          src={logo}
          alt="Admin Logo"
          className="h-18 w-auto"
          aria-hidden="true"
        />
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 overflow-y-auto" aria-label="Main navigation">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-6 py-3 text-base font-medium transition-colors mx-2 rounded-md',
                      isActive
                        ? 'text-gray-800 bg-blue-50'
                        : 'text-gray-950 hover:text-gray-900 hover:bg-gray-50'
                    )
                  }
                  end
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  <span>{item.name}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Signout Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-6 py-3 text-base font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors rounded-md"
          aria-label="Sign out"
        >
          <LogOut className="h-5 w-5" aria-hidden="true" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;