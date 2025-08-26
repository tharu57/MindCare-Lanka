import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import axios from 'axios';

// Skeleton Loader Component
const SkeletonCard = () => (
  <div className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
    <div className="w-full h-48 bg-gray-200" />
    <div className="p-4 space-y-3">
      <div className="h-5 w-3/4 bg-gray-200 rounded" />
      <div className="h-4 w-1/4 bg-gray-200 rounded" />
      <div className="h-10 w-full bg-gray-200 rounded" />
    </div>
  </div>
);

const TreatmentList = ({ limit = null }) => {
  // Fetch treatments using useQuery
  const { data: treatments = [], isLoading, error } = useQuery({
    queryKey: ['treatments'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:5000/api/treatments', {
        timeout: 5000,
        validateStatus: (status) => status >= 200 && status < 300,
      });
      console.log('Fetched treatments:', response.data);
      return response.data.treatments.map(treatment => ({
        id: treatment.id,
        name: treatment.name,
        price: parseFloat(treatment.price),
        imageUrl: treatment.image_path ?  treatment.image_path : null,
      }));
    },
    onError: (error) => {
      console.error('Fetch treatments error:', {
        message: error.message,
        response: error.response ? {
          status: error.response.status,
          data: error.response.data,
        } : null,
        code: error.code,
      });
      toast.error(error.response?.data?.error || 'Failed to fetch treatments', {
        style: { background: '#fee2e2', color: '#b91c1c', fontWeight: 'bold' },
        icon: '❌',
        duration: 5000,
      });
    },
  });

  // Apply limit if provided
  const displayedTreatments = limit !== null ? treatments.slice(0, limit) : treatments;

  // Check if "See All Treatments" should be shown
  const showSeeAll = limit !== null && treatments.length > limit;

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Our Treatments</h2>
          {showSeeAll && (
            <Link
              to="/treatments"
              className="text-[#667449] hover:underline text-base font-medium"
            >
              See All Treatments
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
          <div className="text-center bg-red-50 p-6 rounded-lg">
            <p className="text-lg font-semibold text-red-600">Error Fetching Treatments</p>
            <p className="text-sm text-gray-600 mt-2">Please try again later or contact support.</p>
          </div>
        )}

        {!isLoading && !error && treatments.length === 0 && (
          <div className="text-center bg-gray-50 p-8 rounded-lg border border-gray-200">
            <p className="text-lg font-semibold text-gray-800">No Treatments Available</p>
            <p className="text-sm text-gray-600 mt-2">
              It looks like there are no treatments available at the moment. Please check back later.
            </p>
          </div>
        )}

        {!isLoading && !error && treatments.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayedTreatments.map((treatment) => (
              <div
                key={treatment.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
              >
                <Link to={`/treatments/${treatment.id}`}>
                  <div className="relative overflow-hidden">
                    <img
                      src={treatment.imageUrl || 'https://via.placeholder.com/800x600?text=Image+Not+Found'}
                      alt={treatment.name}
                      className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
                      }}
                    />
                  </div>
                </Link>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 truncate">{treatment.name}</h3>
                  <p className="text-base text-gray-600 mt-1">${treatment.price.toFixed(2)}</p>
                  <Button
                    asChild
                    className="mt-3 w-full bg-[#667449] text-white hover:bg-lime-700 text-base"
                  >
                    <Link to={`/treatments/${treatment.id}`}>
                      Book Appointment
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TreatmentList;