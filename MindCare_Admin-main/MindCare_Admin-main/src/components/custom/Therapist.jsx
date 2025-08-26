import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, MoreVertical, Edit, Trash, Loader2, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import axios from 'axios';
import AddTherapist from './AddTherapist';
import EditTherapist from './EditTherapist';
import ViewTherapist from './ViewTherapist';

// Skeleton component for loading state
const TherapistSkeleton = () => {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, index) => (
        <div key={index} className="flex items-center space-x-4 p-4 border-b border-gray-200">
          <div className="rounded-full bg-gray-200 h-10 w-10 animate-pulse"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        </div>
      ))}
    </div>
  );
};

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

const Therapist = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [therapistToDelete, setTherapistToDelete] = useState(null);
  const [therapistToView, setTherapistToView] = useState(null);
  const queryClient = useQueryClient();

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
        date_of_birth: therapist.date_of_birth,
        nic_number: therapist.nic_number,
        age: calculateAge(therapist.date_of_birth),
        phone: therapist.phone,
        email: therapist.email,
        address: therapist.address,
        role: therapist.role,
        gender: therapist.gender,
        work_start_year: therapist.work_start_year,
        image: therapist.image_path ? `http://localhost:5000/${therapist.image_path}` : null,
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

  // Delete therapist using useMutation
  const deleteMutation = useMutation({
    mutationFn: async (therapistId) => {
      try {
        const response = await axios.delete(`http://localhost:5000/api/therapists/${therapistId}`, {
          validateStatus: (status) => status >= 200 && status < 300,
        });
        console.log('DELETE response:', {
          status: response.status,
          data: response.data,
        });
        return response.data;
      } catch (error) {
        console.error('DELETE error:', {
          message: error.message,
          response: error.response ? {
            status: error.response.status,
            data: error.response.data,
          } : null,
        });
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('DELETE onSuccess:', data);
      if (data.success) {
        toast.success(data.message || 'Therapist deleted successfully', {
          style: { background: '#d1fae5', color: '#065f46', fontWeight: 'bold' },
          icon: '✅',
          duration: 3000,
        });
        queryClient.invalidateQueries(['therapists']);
        setIsDeleteOpen(false);
        setTherapistToDelete(null);
      } else {
        toast.error(data.error || 'Failed to delete therapist', {
          style: { background: '#fee2e2', color: '#b91c1c', fontWeight: 'bold' },
          icon: '❌',
          duration: 5000,
        });
      }
    },
    onError: (error) => {
      console.error('DELETE onError:', {
        message: error.message,
        response: error.response ? {
          status: error.response.status,
          data: error.response.data,
        } : null,
      });
      toast.error(error.response?.data?.error || error.message || 'Failed to delete therapist', {
        style: { background: '#fee2e2', color: '#b91c1c', fontWeight: 'bold' },
        icon: '❌',
        duration: 5000,
      });
    },
  });

  // Filter therapists based on search query
  const filteredTherapists = therapists.filter((therapist) =>
    therapist.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  // Handle delete confirmation
  const handleDelete = (therapist) => {
    deleteMutation.mutate(therapist.id);
  };

  return (
    <div className="p-6 w-full">
      {/* Title and Action Row */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">Manage Therapists</h1>
        <div className="flex items-center gap-4">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search therapists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-gray-300"
            />
          </div>
          <AddTherapist />
        </div>
      </div>

      {/* Divider */}
      <hr className="border-gray-200 mb-6" />

      {/* Loading State */}
      {isLoading && <TherapistSkeleton />}

      {/* Error State */}
      {error && <div className="text-center text-red-600">Error fetching therapists</div>}

      {/* Therapists Table */}
      {!isLoading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Therapist Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Age</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Phone Number</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Address</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Role</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Image</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTherapists.map((therapist) => (
                <tr key={therapist.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <TruncatedCell value={therapist.name} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <TruncatedCell value={therapist.age.toString()} maxLength={5} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <TruncatedCell value={therapist.phone} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <TruncatedCell value={therapist.email} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <TruncatedCell value={therapist.address} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <TruncatedCell value={therapist.role} />
                  </td>
                  <td className="px-4 py-3">
                    <Avatar>
                      <AvatarImage
                        src={therapist.image}
                        alt={therapist.name}
                        onError={(e) => {
                          console.error(`Failed to load image for ${therapist.name}: ${therapist.image}`);
                          e.target.style.display = 'none';
                        }}
                      />
                      <AvatarFallback className="bg-gray-200 text-gray-600">
                        {therapist.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
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
                          onClick={() => {
                            setTherapistToView(therapist);
                            setIsViewOpen(true);
                          }}
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4 text-green-600" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedTherapist(therapist);
                            setIsEditOpen(true);
                          }}
                          className="flex items-center gap-2"
                        >
                          <Edit className="h-4 w-4 text-blue-600" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setTherapistToDelete(therapist);
                            setIsDeleteOpen(true);
                          }}
                          className="flex items-center gap-2"
                        >
                          <Trash className="h-4 w-4 text-red-600" />
                          Delete
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

      {/* View Therapist Sheet */}
      {therapistToView && (
        <ViewTherapist
          therapist={therapistToView}
          open={isViewOpen}
          onOpenChange={setIsViewOpen}
        />
      )}

      {/* Edit Therapist Sheet */}
      {selectedTherapist && (
        <EditTherapist
          therapist={selectedTherapist}
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {therapistToDelete && (
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent className="sm:max-w-md bg-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-800">
                Confirm Deletion
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Are you sure you want to permanently delete this therapist? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex justify-end gap-2">
              <Button
                variant="outline"
                className="border-gray-300 text-gray-700"
                onClick={() => {
                  setIsDeleteOpen(false);
                  setTherapistToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => handleDelete(therapistToDelete)}
                disabled={deleteMutation.isLoading}
              >
                {deleteMutation.isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Yes'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Therapist;