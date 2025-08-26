import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Twitter, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold text-gray-200 mb-4">MediCare Clinic</h3>
            <p className="text-base text-gray-400 mb-4">
              Providing world-class medical care with compassion and expertise. Your health is our priority.
            </p>
            <Button asChild className="bg-[#667449] text-white hover:bg-lime-700">
              <Link to="/">Book Appointment</Link>
            </Button>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold text-gray-200 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-base text-gray-400 hover:text-[#667449] hover:underline">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/therapist" className="text-base text-gray-400 hover:text-[#667449] hover:underline">
                  Therapists
                </Link>
              </li>
              <li>
                <Link to="/treatments" className="text-base text-gray-400 hover:text-[#667449] hover:underline">
                  Treatments
                </Link>
              </li>
              <li>
                <Link to="/appointments" className="text-base text-gray-400 hover:text-[#667449] hover:underline">
                  Appointments
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-base text-gray-400 hover:text-[#667449] hover:underline">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-xl font-bold text-gray-200 mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-gray-400" />
                <span className="text-base text-gray-400">123 Health St, Bambalapitiya, Colombo 7</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-gray-400" />
                <span className="text-base text-gray-400">+94760848706</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-gray-400" />
                <span className="text-base text-gray-400">info@medicareclinic.com</span>
              </li>
            </ul>
            <div className="mt-4 flex gap-4">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#667449]">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#667449]">
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-700 text-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} MediCare Clinic. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;