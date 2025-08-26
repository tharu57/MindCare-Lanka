// DoctorInfo.jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, Calendar, Stethoscope, Star, MapPin, User, Clock, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import DoctorBookAppointment from './DoctorBookAppointment';

// Function to calculate age from date_of_birth
const calculateAge = (dateOfBirth) => {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Skeleton Loader Component
const SkeletonLoader = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
    <div className="flex flex-col md:flex-row gap-8 mb-12">
      <div className="w-full md:w-1/3 lg:w-1/4">
        <div className="h-64 w-64 bg-gray-200 rounded-lg" />
      </div>
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded" />
            <div className="flex items-center gap-2 mt-2">
              <div className="h-6 w-24 bg-gray-200 rounded" />
              <div className="h-6 w-16 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center">
            <div className="h-5 w-5 bg-gray-200 rounded-full mr-2" />
            <div className="h-5 w-24 bg-gray-200 rounded" />
          </div>
          <div className="flex items-center">
            <div className="h-5 w-5 bg-gray-200 rounded-full mr-2" />
            <div className="h-5 w-28 bg-gray-200 rounded" />
          </div>
          <div className="flex items-center">
            <div className="h-5 w-5 bg-gray-200 rounded-full mr-2" />
            <div className="h-5 w-32 bg-gray-200 rounded" />
          </div>
          <div className="flex items-center">
            <div className="h-5 w-5 bg-gray-200 rounded-full mr-2" />
            <div className="h-5 w-36 bg-gray-200 rounded" />
          </div>
          <div className="flex items-center">
            <div className="h-5 w-5 bg-gray-200 rounded-full mr-2" />
            <div className="h-5 w-24 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="mt-6 flex items-start">
          <div className="h-5 w-5 bg-gray-200 rounded-full mr-2 mt-0.5" />
          <div className="h-5 w-48 bg-gray-200 rounded" />
        </div>
        <div className="mt-6 border-2 border-gray-300 rounded-lg p-6">
          <div className="h-6 w-32 bg-gray-200 rounded mb-4" />
          <div className="flex flex-wrap gap-2">
            <div className="h-6 w-24 bg-gray-200 rounded" />
            <div className="h-6 w-24 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="mt-6 border-2 border-gray-300 rounded-lg p-6">
          <div className="h-6 w-32 bg-gray-200 rounded mb-4" />
          <div className="flex flex-wrap gap-2">
            <div className="h-6 w-24 bg-gray-200 rounded" />
            <div className="h-6 w-24 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

function DoctorInfo() {
  const { id } = useParams();

  // Fetch therapist data using useQuery
  const { data: therapist, isLoading, error } = useQuery({
    queryKey: ['therapist', id],
    queryFn: async () => {
      // Get JWT token from localStorage (optional for public access)
      const token = localStorage.getItem('authToken');
      const headers = {};
      
      console.log('🔍 Debug: DoctorInfo authentication');
      console.log('🔍 Token from localStorage:', token ? 'EXISTS' : 'NOT FOUND');
      console.log('🔍 Token value:', token);
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
        console.log('🔍 Authorization header set:', headers.Authorization);
      } else {
        console.log('ℹ️ No token found - making public request (should work now)');
      }

      console.log('🔍 Making API request to:', `http://localhost:5000/api/therapists/${id}`);
      console.log('🔍 Request headers:', headers);

      const response = await axios.get(`http://localhost:5000/api/therapists/${id}`, {
        headers,
        validateStatus: (status) => status >= 200 && status < 300,
      });
      console.log('GET response:', {
        status: response.status,
        data: response.data,
      });
      const therapistData = response.data.data;

      // Fetch treatment details if treatments (JSON array of IDs) exist
      let treatments = [];
      if (therapistData.treatments) {
        console.log('Raw treatments data:', therapistData.treatments);
        let treatmentIds = [];
        
        // Try to parse as JSON first (for admin-assigned treatments)
        try {
          const parsedTreatments = JSON.parse(therapistData.treatments);
          console.log('Parsed treatments as JSON:', parsedTreatments);
          if (Array.isArray(parsedTreatments)) {
            treatmentIds = parsedTreatments;
            console.log('Using JSON array treatment IDs:', treatmentIds);
          }
        } catch (e) {
          console.log('Failed to parse as JSON, trying comma-separated string');
          // Fallback to comma-separated string (for legacy data)
          treatmentIds = therapistData.treatments.split(',').map(tid => tid.trim()).filter(tid => tid && !isNaN(tid));
          console.log('Using comma-separated treatment IDs:', treatmentIds);
        }
        
        if (treatmentIds.length > 0) {
          console.log('Fetching treatment details for IDs:', treatmentIds);
          treatments = await Promise.all(
            treatmentIds.map(async (tid) => {
              try {
                const treatmentResponse = await axios.get(`http://localhost:5000/api/treatments/${tid}`);
                const treatment = treatmentResponse.data.treatment;
                console.log(`Fetched treatment ${tid}:`, treatment);
                return { value: tid, label: treatment.name };
              } catch (err) {
                console.error(`Failed to fetch treatment ${tid}:`, err);
                return null;
              }
            })
          );
          treatments = treatments.filter(t => t !== null);
          console.log('Final treatments array:', treatments);
        } else {
          console.log('No valid treatment IDs found');
        }
      } else {
        console.log('No treatments data in therapist record');
      }

      return {
        id: therapistData.id,
        name: therapistData.full_name,
        specialization: therapistData.role,
        age: calculateAge(therapistData.date_of_birth),
        phone: therapistData.phone,
        email: therapistData.email,
        address: therapistData.address,
        image: therapistData.image_path ? `http://localhost:5000/${therapistData.image_path}` : null,
        experience: therapistData.work_start_year
          ? `${new Date().getFullYear() - therapistData.work_start_year} years`
          : 'N/A',
        rating: 4.9, // Placeholder; adjust if backend provides rating
        gender: therapistData.gender,
        service_times: therapistData.service_times ? (() => {
          try {
            // Parse JSON string if it exists
            if (therapistData.service_times.startsWith('[') && therapistData.service_times.endsWith(']')) {
              const parsedTimes = JSON.parse(therapistData.service_times);
              return Array.isArray(parsedTimes) ? parsedTimes : [];
            } else {
              // Fallback to CSV parsing for backward compatibility
              return therapistData.service_times.split(',').map(time => time.trim().replace('.', ':').replace(/am$/i, ' AM').replace(/pm$/i, ' PM'));
            }
          } catch (error) {
            console.error('Error parsing service_times:', error);
            console.log('Raw service_times:', therapistData.service_times);
            return [];
          }
        })() : [],
        treatments,
      };
    },
    onError: (err) => {
      console.error('GET error:', {
        message: err.message,
        response: err.response ? {
          status: err.response.status,
          data: err.response.data,
        } : null,
      });
      toast.error('Failed to fetch therapist details: ' + (err.response?.data?.error || err.message), {
        style: { background: '#fee2e2', color: '#b91c1c', fontWeight: 'bold' },
        icon: '❌',
        duration: 5000,
      });
    },
  });

  if (isLoading) {
    return <SkeletonLoader />;
  }

  if (error || !therapist) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center bg-red-50 p-6 rounded-lg border border-red-200">
          <p className="text-lg font-semibold text-red-600">Error Fetching Therapist Details</p>
          <p className="text-sm text-gray-600 mt-2">Please try again later or contact support.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Doctor Header */}
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        {/* Doctor Image */}
        <div className="w-full md:w-1/3 lg:w-1/4">
          <Avatar className="h-64 w-64 shadow">
            <AvatarImage src={therapist.image} alt={therapist.name} />
            <AvatarFallback className="rounded-lg border-2 border-gray-300">
              {therapist.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Doctor Info */}
        <div className="flex-1 border-1 border-gray-300 rounded-none p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{therapist.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="text-base">
                  {therapist.specialization}
                </Badge>
                <div className="flex items-center text-yellow-500">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="ml-1 text-gray-900">{therapist.rating}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Info */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-[#667449] mr-2" />
              <span>{therapist.age} years old</span>
            </div>
            <div className="flex items-center">
              <Stethoscope className="w-5 h-5 text-[#667449] mr-2" />
              <span>{therapist.experience} experience</span>
            </div>
            <div className="flex items-center">
              <Phone className="w-5 h-5 text-[#667449] mr-2" />
              <a href={`tel:${therapist.phone}`} className="hover:text-[#667449">
                {therapist.phone}
              </a>
            </div>
            <div className="flex items-center">
              <Mail className="w-5 h-5 text-[#667449] mr-2" />
              <a href={`mailto:${therapist.email}`} className="hover:text-[#667449]">
                {therapist.email}
              </a>
            </div>
            <div className="flex items-center">
              <User className="w-5 h-5 text-[#667449] mr-2" />
              <span>{therapist.gender}</span>
            </div>
          </div>

          {/* Address */}
          <div className="mt-6 border-t border-gray-200 pt-6">
            <div className="flex items-start">
              <MapPin className="w-5 h-5 text-[#667449] mr-2 mt-0.5" />
              <p className="text-gray-700">{therapist.address}</p>
            </div>
          </div>

          {/* Availability Times */}
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="w-5 h-5 text-[#667449] mr-2" />
              Availability Times
            </h3>
            <div className="flex flex-wrap gap-2">
              {therapist.service_times.length > 0 ? (
                therapist.service_times.map((time, index) => (
                  <Badge key={index} variant="outline" className="border-gray-300 text-gray-700">
                    {time}
                  </Badge>
                ))
              ) : (
                <p className="text-gray-600">No availability times provided</p>
              )}
            </div>
          </div>

          {/* Available Treatments */}
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Briefcase className="w-5 h-5 text-[#667449] mr-2" />
              Available Treatments
            </h3>
            <div className="flex flex-wrap gap-2">
              {therapist.treatments.length > 0 ? (
                therapist.treatments.map((treatment, index) => (
                  <Badge key={index} variant="outline" className="border-gray-300 text-gray-700">
                    {treatment.label}
                  </Badge>
                ))
              ) : (
                <p className="text-gray-600">No treatments provided</p>
              )}
            </div>
          </div>
          <br />
          {/* Pass treatments and service_times as props */}
          <DoctorBookAppointment doctorId={therapist.id} treatments={therapist.treatments} serviceTimes={therapist.service_times} />
        </div>
      </div>
    </div>
  );
}

export default DoctorInfo;