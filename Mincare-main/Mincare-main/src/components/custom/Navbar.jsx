import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Auth } from './Auth';
import Appointments from './Appointments';
import { CircleUserRound, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import logo from "../../assets/logo.png"

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/">
              <img
                className="h-16 w-auto"
                src= {logo}
                alt="Logo"
              />
            </Link>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:ml-6 md:flex md:items-center md:space-x-8">
            <NavLink
              to="/"
              className={({ isActive }) => 
                isActive 
                  ? 'text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-[#667449] text-sm font-medium'
                  : 'text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 text-sm font-medium'
              }
              end
            >
              Home
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) => 
                isActive 
                  ? 'text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-[#667449] text-sm font-medium'
                  : 'text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 text-sm font-medium'
              }
            >
              About
            </NavLink>
            <NavLink
              to="/contact"
              className={({ isActive }) => 
                isActive 
                  ? 'text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-[#667449] text-sm font-medium'
                  : 'text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 text-sm font-medium'
              }
            >
              Contact Us
            </NavLink>
            <NavLink
              to="/doctors"
              className={({ isActive }) => 
                isActive 
                  ? 'text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-[#667449] text-sm font-medium'
                  : 'text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 text-sm font-medium'
              }
            >
              Doctors
            </NavLink>
            <NavLink
              to="/treatments"
              className={({ isActive }) => 
                isActive 
                  ? 'text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-[#667449] text-sm font-medium'
                  : 'text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 text-sm font-medium'
              }
            >
              Treatments
            </NavLink>
            <div className='text-gray-500 cursor-pointer hover:text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 text-sm font-medium'>
              <Appointments />
            </div>
          </div>

          {/* Profile Icon and Sign In Button */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-3">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className="text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#667449]"
                      >
                        <CircleUserRound className="h-6 w-6" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-white shadow-md border-1" side="bottom" align="center" showArrow={false}>
                      <p className="font-medium">{user.full_name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <button
                  onClick={logout}
                  className="text-gray-500 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <Auth />
            )}
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 flex items-center md:hidden">
            <button
              type="button"
              className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#667449]"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="block h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu - would need JavaScript to toggle */}
      <div className="md:hidden hidden" id="mobile-menu">
        <div className="pt-2 pb-3 space-y-1">
          <NavLink
            to="/"
            className={({ isActive }) => 
              isActive 
                ? 'bg-blue-50 border-[#667449] text-[#667449] block pl-3 pr-4 py-2 border-l-4 text-base font-medium'
                : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium'
            }
            end
          >
            Home
          </NavLink>
          {/* Repeat for other mobile links */}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;