
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, DollarSign, FileText, Info, User } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import DoctorBookAppointment from './DoctorBookAppointment';

// Skeleton Loader Component
const SkeletonLoader = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
    <div className="flex items-center mb-8">
      <div className="h-5 w-5 bg-gray-200 rounded-full mr-2" />
      <div className="h-5 w-32 bg-gray-200 rounded" />
    </div>
    <div className="flex flex-col md:flex-row gap-8 mb-12">
      <div className="w-full md:w-1/3 lg:w-1/4">
        <div className="w-full h-auto bg-gray-200 rounded-lg border-1 border-gray-800" />
      </div>
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded" />
            <div className="flex items-center gap-2 mt-2">
              <div className="h-6 w-24 bg-gray-200 rounded" />
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
        </div>
        <div className="mt-6 flex items-start">
          <div className="h-5 w-5 bg-gray-200 rounded-full mr-2 mt-0.5" />
          <div className="h-5 w-48 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  </div>
);

const TreatmentInfo = () => {
  const { id } = useParams();

  // Fetch treatment data using useQuery
  const { data: treatment, isLoading: isLoadingTreatment, error: treatmentError } = useQuery({
    queryKey: ['treatment', id],
    queryFn: async () => {
      const response = await axios.get(`http://localhost:5000/api/treatments/${id}`, {
        timeout: 5000,
        validateStatus: (status) => status >= 200 && status < 300,
      });
      console.log('GET treatment response:', {
        status: response.status,
        data: response.data,
      });
      const treatmentData = response.data.treatment;
      return {
        id: treatmentData.id.toString(),
        name: treatmentData.name,
        description: treatmentData.description || 'No description available.',
        price: parseFloat(treatmentData.price),
        imageUrl: treatmentData.image_path || 'https://via.placeholder.com/800x600?text=Image+Not+Found',
      };
    },
    onError: (err) => {
      console.error('GET treatment error:', {
        message: err.message,
        response: err.response ? {
          status: err.response.status,
          data: err.response.data,
        } : null,
      });
      toast.error('Failed to fetch treatment details: ' + (err.response?.data?.error || err.message), {
        style: { background: '#fee2e2', color: '#b91c1c', fontWeight: 'bold' },
        icon: '❌',
        duration: 5000,
      });
    },
  });

  // Fetch doctors who offer this treatment
  const { data: doctors, isLoading: isLoadingDoctors, error: doctorsError } = useQuery({
    queryKey: ['doctors_for_treatment', id],
    queryFn: async () => {
      console.log(`Fetching doctors for treatment ID: ${id}`);
      const response = await axios.get(`http://localhost:5000/api/treatments/${id}/doctors`);
      console.log('Doctors API response:', response.data);
      const doctors = response.data.doctors;
      console.log('Raw doctors data:', doctors);
      
      const processedDoctors = doctors.map(doctor => ({
        id: doctor.id.toString(),
        name: doctor.full_name,
        serviceTimes: (() => {
          if (!doctor.service_times) return [];
          
          try {
            // Try to parse as JSON first (for admin-assigned times)
            const parsedTimes = JSON.parse(doctor.service_times);
            if (Array.isArray(parsedTimes)) {
              return parsedTimes.map(time => 
                typeof time === 'string' ? time.trim().replace('.', ':').replace(/am$/i, ' AM').replace(/pm$/i, ' PM') : time
              );
            }
          } catch (e) {
            // Fallback to comma-separated string (for legacy data)
            return doctor.service_times.split(',').map(time => 
              time.trim().replace('.', ':').replace(/am$/i, ' AM').replace(/pm$/i, ' PM')
            );
          }
          
          return [];
        })(),
      }));
      
      console.log('Processed doctors data:', processedDoctors);
      return processedDoctors;
    },
    onError: (err) => {
      console.error('GET doctors error:', {
        message: err.message,
        response: err.response ? {
          status: err.response.status,
          data: err.response.data,
        } : null,
      });
      toast.error('Failed to fetch doctors for this treatment: ' + (err.response?.data?.error || err.message), {
        style: { background: '#fee2e2', color: '#b91c1c', fontWeight: 'bold' },
        icon: '❌',
        duration: 5000,
      });
    },
    enabled: !!treatment, // Wait for treatment to load
  });

  if (isLoadingTreatment || isLoadingDoctors) {
    return <SkeletonLoader />;
  }

  if (treatmentError || doctorsError || !treatment) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center bg-red-50 p-6 rounded-lg border-2 border-red-200">
          <p className="text-lg font-semibold text-red-600">Error Fetching Treatment Details</p>
          <p className="text-sm text-gray-600 mt-2">Please try again later or contact support.</p>
          <Link
            to="/treatments"
            className="inline-flex items-center text-[#667449] hover:text-lime-700 text-base font-semibold mt-4 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Treatments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back Link */}
      <Link
        to="/treatments"
        className="inline-flex items-center text-[#667449] hover:text-lime-700 text-base font-semibold mb-8 transition-colors duration-200"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Treatments
      </Link>

      {/* Treatment Header */}
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        {/* Treatment Image */}
        <div className="w-full md:w-1/3 lg:w-1/4">
          <Avatar className="w-auto h-auto rounded-lg shadow-md border-gray-300">
            <AvatarImage
              src={treatment.imageUrl}
              alt={treatment.name}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
              }}
            />
            <AvatarFallback className="w-full h-auto rounded-lg shadow-md">
              {treatment.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Treatment Info */}
        <div className="flex-1 border-1 bg-white shadow border-gray-300 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{treatment.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="text-base">
                  Treatment
                </Badge>
              </div>
            </div>
          </div>

          {/* Quick Info */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center">
              <Info className="w-5 h-5 text-[#667449] mr-2" />
              <span>Treatment ID: {treatment.id}</span>
            </div>
            <div className="flex items-center">
              <DollarSign className="w-5 h-5 text-[#667449] mr-2" />
              <span>Price: ${treatment.price.toFixed(2)}</span>
            </div>
          </div>

          {/* Description */}
          <div className="mt-6 border-t border-gray-200 pt-6">
            <div className="flex items-start">
              <FileText className="w-5 h-5 text-[#667449] mr-2 mt-0.5" />
              <p className="text-gray-700">{treatment.description}</p>
            </div>
          </div>

          {/* Available Therapists */}
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 text-[#667449]  mr-2" />
              Available Therapists
            </h3>
            {doctors && doctors.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {doctors.map((doctor) => (
                  <Link
                    key={doctor.id}
                    to={`/doctors/${doctor.id}`}
                    className="flex items-center p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <Avatar className="h-12 w-12 mr-4">
                      <AvatarImage src="https://via.placeholder.com/150?text=Doctor+Image" alt={doctor.name} />
                      <AvatarFallback>
                        {doctor.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-gray-900">{doctor.name}</p>
                      <Badge variant="secondary">Therapist</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No therapists available for this treatment.</p>
            )}
          </div>
<br />
          {/* Doctor Book Appointment */}
          {doctors && doctors.length > 0 ? (
            <DoctorBookAppointment
              serviceId={treatment.id}
              doctors={doctors}
              serviceTimes={doctors.flatMap(doctor => doctor.serviceTimes)}
            />
          ) : (
            <p className="text-red-600 mt-6">No doctors available for this treatment.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TreatmentInfo;
