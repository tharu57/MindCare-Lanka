import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Search, MoreVertical, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { toast } from 'sonner';
import ProcessAppointment from './ProcessAppointment';

// Skeleton Component
const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200 ${className || ''}`}
      {...props}
    />
  )
}

// Table Skeleton Component
const TableSkeleton = ({ rows = 5, columns = 9 }) => (
  <div className="overflow-x-auto overflow-y-auto max-h-[600px] border border-gray-200 rounded-lg">
    <table className="w-full table-auto border-collapse">
      <thead>
        <tr className="bg-gray-100 sticky top-0 z-10">
          {Array.from({ length: columns }).map((_, i) => (
            <th key={i} className="px-4 py-3 text-left">
              <Skeleton className="h-4 w-20" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <tr key={rowIndex} className="border-b border-gray-200">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <td key={colIndex} className="px-4 py-3">
                {colIndex === columns - 2 ? ( // Status column
                  <Skeleton className="h-6 w-16 rounded-full" />
                ) : colIndex === columns - 1 ? ( // Actions column
                  <Skeleton className="h-8 w-8" />
                ) : (
                  <Skeleton className="h-4 w-full" />
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Appointments = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Fetch all appointments using react-query
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      console.log('Fetching appointments from: http://localhost:5000/api/appointments');
      const response = await axios.get('http://localhost:5000/api/appointments', {
        timeout: 10000,
      });
      console.log('API response:', response.data);
      return response.data.appointments.map((appt) => ({
        id: appt.id,
        appointmentNo: `APP${String(appt.id).padStart(3, '0')}`,
        patientName: appt.patient_name || 'Unknown',
        treatment: appt.treatment_name || 'Unknown',
        doctor: appt.therapist_name || 'Unknown',
        date: new Date(appt.date),
        time: appt.time,
        price: 50.0 + appt.treatment_id * 10.0, // Mock price based on treatment_id
        status: appt.status.charAt(0).toUpperCase() + appt.status.slice(1), // Capitalize status
      }));
    },
    onError: (error) => {
      console.error('Fetch error:', {
        message: error.message,
        response: error.response ? {
          status: error.response.status,
          data: error.response.data,
        } : null,
      });
      toast.error(error.response?.data?.error || 'Failed to fetch appointments', {
        style: { background: '#fee2e2', color: '#b91c1c', fontWeight: 'bold' },
        icon: '❌',
        duration: 3000,
      });
    },
  });

  // Filter appointments based on search query and status
  const filteredAppointments = (data || []).filter((appointment) => {
    const matchesSearch =
      appointment.doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.appointmentNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'All' || appointment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Function to truncate text and wrap with Tooltip if needed
  const TruncatedCell = ({ value, maxLength = 20 }) => {
    const isTruncated = value.length > maxLength;
    const displayText = isTruncated ? `${value.slice(0, maxLength)}...` : value;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="block truncate max-w-[150px]">{displayText}</span>
          </TooltipTrigger>
          {isTruncated && (
            <TooltipContent>
              <p>{value}</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    );
  };

  // Handle view details action
  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setIsViewOpen(true);
  };

  const formatDate = (date) => {
    return format(date, 'MMM dd, yyyy');
  };

  return (
    <div className="p-6 w-full">
      {/* Title and Filter Row */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">All Appointments</h1>
        <div className="flex items-center gap-4">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by doctor or appointment no..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-gray-300"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 border-gray-300">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Confirmed">Confirmed</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
              <SelectItem value="Waiting">Waiting</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Divider */}
      <hr className="border-gray-200 mb-6" />

      {/* Loading State with Skeleton */}
      {isLoading && <TableSkeleton rows={5} columns={9} />}

      {/* Error State */}
      {isError && (
        <div className="text-center py-10 text-red-500">
          Error: Failed to fetch appointments
        </div>
      )}

      {/* No Data State */}
      {!isLoading && !isError && filteredAppointments.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          No appointments found.
        </div>
      )}

      {/* Appointments Table */}
      {!isLoading && !isError && filteredAppointments.length > 0 && (
        <div className="overflow-x-auto overflow-y-auto max-h-[600px] border border-gray-200 rounded-lg">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100 sticky top-0 z-10">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Appointment No</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Patient Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Treatment</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Doctor</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Time</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Price ($)</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((appointment) => (
                <tr key={appointment.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <TruncatedCell value={appointment.appointmentNo} maxLength={10} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <TruncatedCell value={appointment.patientName} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <TruncatedCell value={appointment.treatment} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <TruncatedCell value={appointment.doctor} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <TruncatedCell value={formatDate(appointment.date)} maxLength={12} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <TruncatedCell value={appointment.time} maxLength={10} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <TruncatedCell value={appointment.price.toFixed(2)} maxLength={10} />
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={cn(
                        'px-2 py-1 rounded-full text-xs font-medium',
                        appointment.status === 'Pending' ? 'bg-blue-100 text-blue-700' :
                        appointment.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                        appointment.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      )}
                    >
                      {appointment.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4 text-gray-600" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white">
                        <DropdownMenuItem
                          onClick={() => handleViewDetails(appointment)}
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4 text-blue-500" />
                          View Appointment Details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Process Appointment Sheet */}
      {selectedAppointment && (
        <ProcessAppointment
          appointment={selectedAppointment}
          open={isViewOpen}
          onOpenChange={setIsViewOpen}
        />
      )}
    </div>
  );
};

export default Appointments;