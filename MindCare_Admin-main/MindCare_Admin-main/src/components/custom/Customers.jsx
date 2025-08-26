import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { format } from 'date-fns';

// Skeleton Loading Component
const PatientsSkeleton = () => {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, index) => (
        <div key={index} className="grid grid-cols-6 gap-4 p-4 border-b border-gray-200 animate-pulse">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      ))}
    </div>
  );
};

const fetchPatients = async () => {
  const response = await fetch('http://localhost:5000/api/patients');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const Customers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Using useQuery to fetch patients data
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['patients'],
    queryFn: fetchPatients,
  });

  // Filter patients based on search query
  const filteredPatients = data?.patients?.filter((patient) =>
    patient.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Function to truncate text and wrap with Tooltip if needed
  const TruncatedCell = ({ value, maxLength = 20 }) => {
    if (!value) return <span className="text-gray-400">N/A</span>;
    
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

  return (
    <div className="p-6 w-full">
      {/* Title and Search Row */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">Patient Records</h1>
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search patients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-gray-300"
          />
        </div>
      </div>

      {/* Divider */}
      <hr className="border-gray-200 mb-6" />

      {/* Loading State */}
      {isLoading && <PatientsSkeleton />}

      {/* Error State */}
      {isError && (
        <div className="p-6 text-red-500">Error: {error.message}</div>
      )}

      {/* Patients Table */}
      {!isLoading && !isError && (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Patient Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Phone Number</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Address</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Date of Birth</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Joined Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <tr key={patient.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <TruncatedCell value={patient.full_name} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <TruncatedCell value={patient.phone} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <TruncatedCell value={patient.email} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <TruncatedCell value={patient.address} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {patient.date_of_birth ? (
                        <TruncatedCell value={format(new Date(patient.date_of_birth), 'MMM dd, yyyy')} maxLength={12} />
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {patient.created_at ? (
                        <TruncatedCell value={format(new Date(patient.created_at), 'MMM dd, yyyy')} maxLength={12} />
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-6 text-center text-gray-500">
                    {searchQuery ? 'No matching patients found' : 'No patients available'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Customers;