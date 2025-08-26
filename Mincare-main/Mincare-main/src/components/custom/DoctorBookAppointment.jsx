import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { CalendarIcon } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

const DoctorBookAppointment = ({ doctorId, treatments, serviceId, doctors, serviceTimes }) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { control, watch, setValue, trigger, formState: { errors } } = useForm({
    defaultValues: {
      treatmentId: treatments && treatments.length > 0 ? treatments[0].value.toString() : serviceId?.toString() || '',
      doctorId: doctorId?.toString() || '',
      date: new Date(),
      time: '',
    },
    mode: 'onChange',
  });

  const selectedTreatmentId = watch('treatmentId');
  const selectedDoctorId = watch('doctorId');
  const selectedDate = watch('date');
  const selectedTime = watch('time');

  // Fetch all appointments
  const { data: allAppointments = [], refetch } = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      console.log('Fetching all appointments');
      const response = await axios.get('http://localhost:5000/api/appointments');
      return response.data.appointments || [];
    },
  });

  // Normalize and filter available times, excluding booked times
  const availableTimes = (doctorId
    ? serviceTimes
    : selectedDoctorId
      ? doctors.find((doctor) => doctor.id.toString() === selectedDoctorId)?.serviceTimes || []
      : serviceTimes
  ).map(time => {
    try {
      if (!time || typeof time !== 'string') {
        console.error(`Invalid time in serviceTimes: ${time}`);
        return null;
      }
      const cleanedTime = time.toLowerCase().trim().replace('.', ':').replace(/\s+/g, ' ');
      const [timePart, period] = cleanedTime.split(' ');
      if (!period || !['am', 'pm'].includes(period)) {
        console.error(`Invalid or missing am/pm in time: ${time}`);
        return null;
      }
      let [hours, minutes] = timePart.split(':');
      hours = parseInt(hours);
      minutes = parseInt(minutes || 0).toString().padStart(2, '0');
      if (isNaN(hours) || hours < 1 || hours > 12 || isNaN(minutes)) {
        console.error(`Invalid hours or minutes in time: ${time}`);
        return null;
      }
      return `${hours}:${minutes} ${period}`;
    } catch (error) {
      console.error(`Error processing time: ${time}, Error: ${error.message}`);
      return null;
    }
  }).filter(time => {
    if (!time) return false;
    // Exclude times that are booked for the selected therapist, treatment, and date
    const isBooked = allAppointments.some(appt => 
      appt.time === time && 
      appt.therapist_id === Number(doctorId || selectedDoctorId) &&
      appt.treatment_id === Number(selectedTreatmentId) &&
      appt.date === format(selectedDate, 'yyyy-MM-dd') &&
      appt.status !== 'cancelled' // Allow cancelled appointments to be reused
    );
    return !isBooked;
  });

  console.log('Raw serviceTimes:', serviceTimes);
  console.log('Processed availableTimes:', availableTimes);
  console.log('All appointments:', allAppointments);

  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserId(Number(decoded.patient_id));
      } catch (error) {
        console.error('Failed to decode JWT:', error);
        setUserId(null);
      }
    } else {
      setUserId(null);
    }
  }, []);

  // Mutation for creating appointment
  const mutation = useMutation({
    mutationFn: async (appointmentData) => {
      console.log('Sending appointment data:', appointmentData);
      const response = await axios.post('http://localhost:5000/api/appointment', appointmentData);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Appointment created successfully!', {
        style: { background: '#d4edda', color: '#155724', fontWeight: 'bold' },
        duration: 3000,
      });
      console.log('Appointment saved:', data);
      setIsSheetOpen(false);
      refetch(); // Refresh appointments after booking
    },
    onError: (error) => {
      console.error('Full error:', error);
      toast.error('Failed to save appointment: ' + 
        (error.response?.data?.error || error.message || 'Unknown error'), {
        style: { background: '#fee2e2', color: '#b91c1c', fontWeight: 'bold' },
        duration: 5000,
      });
    },
  });

  // Normalize time format to HH:MM am/pm
  const normalizeTime = (time) => {
    try {
      if (!time || typeof time !== 'string') throw new Error('Invalid time: null or non-string');
      console.log('Normalizing time:', time);
      const cleanedTime = time.toLowerCase().trim().replace('.', ':').replace(/\s+/g, ' ');
      const [timePart, period] = cleanedTime.split(' ');
      if (!period || !['am', 'pm'].includes(period)) throw new Error(`Invalid or missing am/pm: ${time}`);
      let [hours, minutes] = timePart.split(':');
      hours = parseInt(hours);
      minutes = parseInt(minutes || 0).toString().padStart(2, '0');
      if (isNaN(hours) || hours < 1 || hours > 12 || isNaN(minutes)) throw new Error(`Invalid hours or minutes: ${time}`);
      return `${hours}:${minutes} ${period}`;
    } catch (error) {
      console.error('Time normalization error:', error.message, 'Input:', time);
      toast.error('Invalid time format selected', {
        style: { background: '#fee2e2', color: '#b91c1c', fontWeight: 'bold' },
        duration: 5000,
      });
      return null;
    }
  };

  // Handle time selection and trigger mutation
  const handleTimeSelection = async (time) => {
    const normalizedTime = normalizeTime(time);
    if (!normalizedTime) return;
    setValue('time', normalizedTime, { shouldValidate: true });
    
    const isValid = await trigger();
    if (!isValid) {
      toast.error('Please fill all required fields correctly', {
        style: { background: '#fee2e2', color: '#b91c1c', fontWeight: 'bold' },
        duration: 5000,
      });
      return;
    }

    if (!userId) {
      toast.error('User not authenticated. Please log in.', {
        style: { background: '#fee2e2', color: '#b91c1c', fontWeight: 'bold' },
        duration: 5000,
      });
      return;
    }

    const appointmentData = {
      userId: userId,
      treatmentId: Number(selectedTreatmentId),
      doctorId: Number(doctorId || selectedDoctorId),
      date: format(selectedDate, 'yyyy-MM-dd'),
      time: normalizedTime,
    };

    console.log('Submitting appointment:', appointmentData);
    mutation.mutate(appointmentData);
  };

  // Refetch appointments when doctor, treatment, or date changes
  useEffect(() => {
    refetch();
  }, [selectedDoctorId, doctorId, selectedTreatmentId, selectedDate, refetch]);

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <Button className="w-full sm:w-auto bg-[#667449] hover:bg-lime-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
          Book Appointment
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md p-6 bg-white rounded-lg shadow-lg overflow-y-auto max-h-full">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold text-gray-900">Book an Appointment</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          {/* Conditional Selector: Treatments or Doctors */}
          {doctorId ? (
            <div>
              <Label htmlFor="treatmentId" className="block text-sm font-medium text-gray-700">
                Select Treatment
              </Label>
              <Controller
                name="treatmentId"
                control={control}
                rules={{ required: 'Please select a treatment' }}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(val) => {
                      field.onChange(val);
                      trigger('treatmentId');
                    }}
                  >
                    <SelectTrigger className="w-full border-gray-300 focus:ring-[#667449] focus:border-lime-600">
                      <SelectValue placeholder="Choose a treatment" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {treatments.map((treatment) => (
                        <SelectItem key={treatment.value} value={treatment.value.toString()}>
                          {treatment.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.treatmentId && (
                <p className="text-red-600 text-sm mt-1">{errors.treatmentId.message}</p>
              )}
            </div>
          ) : (
            <div>
              <Label htmlFor="doctorId" className="block text-sm font-medium text-gray-700">
                Select Doctor
              </Label>
              <Controller
                name="doctorId"
                control={control}
                rules={{ required: 'Please select a doctor' }}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(val) => {
                      field.onChange(val);
                      trigger('doctorId');
                    }}
                  >
                    <SelectTrigger className="w-full border-gray-300 focus:ring-[#667449] focus:border-lime-800">
                      <SelectValue placeholder="Choose a doctor" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id.toString()}>
                          {doctor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.doctorId && (
                <p className="text-red-600 text-sm mt-1">{errors.doctorId.message}</p>
              )}
            </div>
          )}

          {/* Date Selection */}
          <div>
            <Label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Select Date
            </Label>
            <Controller
              name="date"
              control={control}
              rules={{ required: 'Please select a date' }}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal border-gray-300 focus:ring-[#667449] focus:border-lime-800"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-[#667449]" />
                      {format(field.value, 'PPP')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        field.onChange(date);
                        trigger('date');
                      }}
                      className="rounded-md border border-gray-300 shadow-sm"
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            {errors.date && (
              <p className="text-red-600 text-sm mt-1">{errors.date.message}</p>
            )}
          </div>

          {/* Time Selection */}
          <div>
            <Label htmlFor="time" className="block text-sm font-medium text-gray-700">
              Select Time
            </Label>
            <Controller
              name="time"
              control={control}
              rules={{ required: 'Please select a time' }}
              render={({ field }) => (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {availableTimes.length > 0 ? (
                    availableTimes.map((time) => (
                      <Button
                        key={time}
                        type="button"
                        variant={field.value === time ? 'default' : 'outline'}
                        onClick={() => handleTimeSelection(time)}
                        disabled={doctorId ? false : !selectedDoctorId}
                        className={`w-full py-2 ${
                          field.value === time
                            ? 'bg-[#667449] text-white hover:bg-lime-700'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        } transition-colors duration-200`}
                      >
                        {time}
                      </Button>
                    ))
                  ) : (
                    <p className="text-gray-600 text-sm">
                      No available times {doctorId ? 'for this doctor' : 'for the selected doctor'}.
                    </p>
                  )}
                </div>
              )}
            />
            {errors.time && (
              <p className="text-red-600 text-sm mt-1">{errors.time.message}</p>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default DoctorBookAppointment;