import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'sonner';

const Appointments = () => {
  const [userId, setUserId] = useState(null);

  // Extract user_id from JWT
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserId(Number(decoded.patient_id));
      } catch (error) {
        console.error('Failed to decode JWT:', error);
        setUserId(null);
        toast.error('User not authenticated. Please log in.', {
          style: { background: '#fee2e2', color: '#b91c1c', fontWeight: 'bold' },
          duration: 5000,
        });
      }
    } else {
      setUserId(null);
      toast.error('User not authenticated. Please log in.', {
        style: { background: '#fee2e2', color: '#b91c1c', fontWeight: 'bold' },
        duration: 5000,
      });
    }
  }, []);

  // Fetch appointments for the user
  const queryClient = useQueryClient();
  const { data: appointments = [], isLoading, error } = useQuery({
    queryKey: ['appointments', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID not available');
      console.log('Fetching appointments for user_id:', userId);
      const response = await axios.get(`http://localhost:5000/api/appointments/user/${userId}`);
      return response.data.appointments.map(appt => {
        console.log('Processing appointment:', appt);
        return {
          id: appt.id.toString(),
          treatment: {
            name: appt.treatment_name || 'Unknown',
            imageUrl: appt.treatment_image ? `http://localhost:5000/${appt.treatment_image}` : `https://picsum.photos/300/300?random=${appt.treatment_id}`,
          },
          doctor: {
            name: appt.therapist_name || 'Unknown',
            imageUrl: appt.therapy_image ? `http://localhost:5000/${appt.therapy_image}` : `https://picsum.photos/64/64?random=${appt.therapist_id}`,
          },
          date: appt.date,
          time: appt.time,
          status: appt.status,
          amount: 0.00, // Amount not in backend, default to 0.00
        };
      });
    },
    enabled: !!userId,
  });

  // Mutation for accepting an appointment
  const mutation = useMutation({
    mutationFn: async (appointmentId) => {
      console.log('Accepting appointment:', appointmentId);
      const response = await axios.put(`http://localhost:5000/api/appointments/${appointmentId}`, {
        status: 'confirmed',
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Appointment marked as completed!', {
        style: { background: '#d4edda', color: '#155724', fontWeight: 'bold' },
        duration: 3000,
      });
      queryClient.invalidateQueries(['appointments', userId]);
    },
    onError: (error) => {
      console.error('Error marking appointment as completed:', error);
      toast.error('Failed to mark appointment as completed: ' + 
        (error.response?.data?.error || error.message || 'Unknown error'), {
        style: { background: '#fee2e2', color: '#b91c1c', fontWeight: 'bold' },
        duration: 5000,
      });
    },
  });

  // Function to get status styling
  const getStatusStyles = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'waiting':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-green-200 text-green-900';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Skeleton loader component
  const SkeletonCard = () => (
    <div className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
      <div className="flex justify-between items-center mb-2">
        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
      </div>
      <div className="flex justify-between items-center mb-2">
        <div className="w-16 h-16 bg-gray-200 rounded"></div>
        <div className="h-5 bg-gray-200 rounded w-1/2"></div>
      </div>
      <div className="flex justify-between items-center mb-2">
        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
        <div className="h-5 bg-gray-200 rounded w-1/3"></div>
      </div>
      <div className="flex justify-between items-center mb-2">
        <div className="h-5 bg-gray-200 rounded w-1/4"></div>
        <div className="h-5 bg-gray-200 rounded w-1/4"></div>
      </div>
      <div className="flex justify-end">
        <div className="h-5 bg-gray-200 rounded w-1/5"></div>
      </div>
    </div>
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <div>
          Appointments
        </div>
      </SheetTrigger>
      <SheetContent className="md:max-w-[500px] sm:w-[540px] bg-white p-6 overflow-y-auto max-h-screen">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Your Appointments</h2>
        <div className="flex flex-col gap-4">
          {isLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : error ? (
            <p className="text-red-600 text-sm">Error loading appointments: {error.message}</p>
          ) : appointments.length === 0 ? (
            <p className="text-gray-600 text-sm">No appointments found.</p>
          ) : (
            appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow duration-200"
              >
                {/* Line 1: Appointment Number and Status */}
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Appointment #{appointment.id}
                  </h3>
                  {appointment.status === 'waiting' ? (
                    <Button
                      onClick={() => mutation.mutate(appointment.id)}
                      className="bg-[#667449] hover:bg-lime-700 text-white font-semibold py-1 px-2 rounded text-sm"
                      disabled={mutation.isLoading}
                    >
                      Accept
                    </Button>
                  ) : (
                    <span
                      className={`text-sm font-medium px-2 py-1 rounded ${getStatusStyles(
                        appointment.status
                      )}`}
                    >
                      {appointment.status}
                    </span>
                  )}
                </div>

                {/* Line 2: Treatment Image and Name */}
                <div className="flex justify-between items-center mb-2">
                  <img
                    src={appointment.treatment.imageUrl}
                    alt={appointment.treatment.name}
                    className="w-16 h-16 object-cover rounded mr-3"
                    onError={(e) => {
                      console.error(`Failed to load treatment image: ${appointment.treatment.imageUrl}`);
                      e.target.src = 'https://picsum.photos/300/300?random=0';
                    }}
                  />
                  <span className="text-base text-gray-800 font-medium">
                    {appointment.treatment.name}
                  </span>
                </div>

                {/* Line 3: Doctor Image and Name */}
                <div className="flex justify-between items-center mb-2">
                  <img
                    src={appointment.doctor.imageUrl}
                    alt={appointment.doctor.name}
                    className="w-8 h-8 object-cover rounded-full"
                    onError={(e) => {
                      console.error(`Failed to load doctor image: ${appointment.doctor.imageUrl}`);
                      e.target.src = 'https://picsum.photos/64/64?random=0';
                    }}
                  />
                  <span className="text-sm text-gray-800 font-medium">
                    {appointment.doctor.name}
                  </span>
                </div>

                {/* Line 4: Date and Time */}
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">
                    {format(new Date(appointment.date), 'MMM d, yyyy')}
                  </span>
                  <span className="text-sm text-gray-800 font-medium">
                    {appointment.time}
                  </span>
                </div>

                {/* Line 5: Amount */}
                <div className="flex justify-end">
                  <span className="text-sm text-gray-800 font-medium">
                    Rs. {appointment.amount.toFixed(2)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Appointments;