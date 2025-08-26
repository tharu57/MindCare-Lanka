import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { User, Stethoscope, Calendar, Star, ArrowRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import axios from 'axios';

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
const SkeletonCard = () => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 animate-pulse">
    <div className="h-60 bg-gray-200" />
    <div className="p-5 space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="h-5 w-40 bg-gray-200 rounded" />
          <div className="h-4 w-32 bg-gray-200 rounded" />
        </div>
        <div className="h-6 w-16 bg-gray-200 rounded" />
      </div>
      <div className="space-y-2">
        <div className="flex items-center">
          <div className="h-4 w-4 bg-gray-200 rounded-full mr-2" />
          <div className="h-4 w-24 bg-gray-200 rounded" />
        </div>
        <div className="flex items-center">
          <div className="h-4 w-4 bg-gray-200 rounded-full mr-2" />
          <div className="h-4 w-28 bg-gray-200 rounded" />
        </div>
      </div>
      <div className="h-10 w-full bg-gray-200 rounded-md" />
    </div>
  </div>
);

function Doctorslist({ limit = null }) {
  // Fetch therapists using useQuery
  const { data: therapists = [], isLoading, error } = useQuery({
    queryKey: ['therapists'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:5000/api/therapists', {
        validateStatus: (status) => status >= 200 && status < 300,
      });
      console.log('GET response:', {
        status: response.status,
        data: response.data,
      });
      return response.data.data.map(therapist => ({
        id: therapist.id,
        name: therapist.full_name,
        specialization: therapist.role,
        age: calculateAge(therapist.date_of_birth),
        image: therapist.image_path ? `http://localhost:5000/${therapist.image_path}` : null,
        experience: therapist.work_start_year
          ? `${new Date().getFullYear() - therapist.work_start_year} years`
          : 'N/A',
        rating: therapist.rating || 4.8, // Use backend rating if available, else fallback
      }));
    },
    onError: (err) => {
      console.error('GET error:', {
        message: err.message,
        response: err.response ? {
          status: err.response.status,
          data: err.response.data,
        } : null,
      });
      toast.error('Failed to fetch therapists: ' + (err.response?.data?.error || err.message), {
        style: { background: '#fee2e2', color: '#b91c1c', fontWeight: 'bold' },
        icon: '❌',
        duration: 5000,
      });
    },
  });

  const shouldShowSeeAll = therapists.length >= 4;
  const displayedTherapists = limit ? therapists.slice(0, limit) : therapists;

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Our Expert Therapists</h1>
        {shouldShowSeeAll && limit && (
          <Link 
            to="/doctors" 
            className="flex items-center text-[#667449] hover:text-[#667449] font-medium transition-colors"
          >
            See All Therapists <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        )}
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: limit || 4 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      )}

      {error && (
        <div className="text-center text-red-600 bg-red-50 p-6 rounded-lg">
          <p className="text-lg font-semibold">Error Fetching Therapists</p>
          <p className="text-sm">Please try again later or contact support.</p>
        </div>
      )}

      {!isLoading && !error && therapists.length === 0 && (
        <div className="text-center bg-gray-50 p-8 rounded-lg border border-gray-200">
          <p className="text-lg font-semibold text-gray-800">No Therapists Available</p>
          <p className="text-sm text-gray-600 mt-2">
            It looks like there are no therapists available at the moment. Please check back later.
          </p>
        </div>
      )}

      {!isLoading && !error && therapists.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayedTherapists.map((therapist) => (
            <div 
              key={therapist.id} 
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100 group"
            >
              {/* Image with scale effect */}
              <div className="h-60 overflow-hidden relative">
                {therapist.image ? (
                  <img 
                    src={therapist.image} 
                    alt={therapist.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      console.error(`Failed to load image for ${therapist.name}: ${therapist.image}`);
                      e.target.style.display = 'none'; // Hide broken image
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <User className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>

              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <h3 className="text-lg font-bold text-gray-900 truncate max-w-[180px] cursor-default">
                            {therapist.name}
                          </h3>
                        </TooltipTrigger>
                        <TooltipContent side="top" align="start" showArrow={false} className="bg-white shadow-xl">
                          <p>{therapist.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <p className="text-[#667449] text-sm font-medium truncate max-w-[180px]">
                      {therapist.specialization}
                    </p>
                  </div>
                  <div className="flex items-center bg-green-50 px-2 py-1 rounded">
                    <Star className="w-4 h-4 text-yellow-500 mr-1" />
                    <span className="text-xs font-medium">{therapist.rating}</span>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-[#667449]" />
                    <span>{therapist.age} years old</span>
                  </div>
                  <div className="flex items-center">
                    <Stethoscope className="w-4 h-4 mr-2 text-[#667449]" />
                    <span>{therapist.experience} experience</span>
                  </div>
                </div>

                <Link 
                  to={`/doctors/${therapist.id}`} 
                  className="mt-4 w-full flex justify-center bg-[#667449] text-white py-2 px-4 rounded-md hover:bg-lime-700 transition-colors duration-200 text-sm"
                >
                  Book Session
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Doctorslist;