import React, { useState } from 'react';
import { Search, MoreVertical, Edit, Trash } from 'lucide-react';
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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';
import AddTreatment from './AddTreatment';
import EditTreatment from './EditTreatment';

// Skeleton Loading Component
const TreatmentsSkeleton = () => {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, index) => (
        <div key={index} className="grid grid-cols-5 gap-4 p-4 border-b border-gray-200 animate-pulse">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="flex items-center">
            <div className="rounded-full bg-gray-200 h-10 w-10"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
      ))}
    </div>
  );
};

const Treatments = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [treatmentToDelete, setTreatmentToDelete] = useState(null);
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Fetch treatments using React Query
  const { data: treatmentsData, isLoading, isError, error } = useQuery({
    queryKey: ['treatments'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:5000/api/treatments', {
        timeout: 5000,
      });
      console.log('Fetched treatments:', response.data);
      return response.data.treatments;
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

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (treatmentId) => {
      const response = await axios.delete(`http://localhost:5000/api/treatments/${treatmentId}`, {
        timeout: 5000,
      });
      console.log('Delete response:', {
        status: response.status,
        data: response.data,
      });
      return response.data;
    },
    onSuccess: (data) => {
      console.log('Delete onSuccess:', data);
      toast.success(data.message || 'Treatment deleted successfully', {
        style: { background: '#d1fae5', color: '#065f46', fontWeight: 'bold' },
        icon: '✅',
        duration: 3000,
      });
      queryClient.invalidateQueries(['treatments']);
      setIsDeleteOpen(false);
      setTreatmentToDelete(null);
    },
    onError: (error) => {
      console.error('Delete error:', {
        message: error.message,
        response: error.response ? {
          status: error.response.status,
          data: error.response.data,
        } : null,
        code: error.code,
      });
      toast.error(error.response?.data?.error || 'Failed to delete treatment', {
        style: { background: '#fee2e2', color: '#b91c1c', fontWeight: 'bold' },
        icon: '❌',
        duration: 5000,
      });
      setIsDeleteOpen(false);
      setTreatmentToDelete(null);
    },
  });

  // Filter treatments based on search query
  const filteredTreatments = Array.isArray(treatmentsData)
    ? treatmentsData.filter((treatment) =>
        treatment.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

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
  const handleDelete = (treatment) => {
    deleteMutation.mutate(treatment.id);
  };

  return (
    <div className="p-6 w-full">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">Manage Treatments</h1>
        <div className="flex items-center gap-4">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search treatments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-gray-300"
            />
          </div>
          <AddTreatment />
        </div>
      </div>
      <hr className="border-gray-200 mb-6" />
      <div className="overflow-x-auto">
        {isLoading ? (
          <TreatmentsSkeleton />
        ) : isError ? (
          <div className="text-center py-4 text-red-600">Error loading treatments</div>
        ) : filteredTreatments.length === 0 ? (
          <div className="text-center py-4">No treatments found</div>
        ) : (
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Treatment Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Image</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Description</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Hourly Rate ($)</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTreatments.map((treatment) => (
                <tr key={treatment.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <TruncatedCell value={treatment.name} />
                  </td>
                  <td className="px-4 py-3">
                    <Avatar>
                      <AvatarImage src={treatment.image_path} alt={treatment.name} />
                      <AvatarFallback className="bg-gray-200 text-gray-600">
                        {treatment.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <TruncatedCell value={treatment.description} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <TruncatedCell value={treatment.price} maxLength={10} />
                  </td>
                  <td className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4 text-gray-600" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedTreatment(treatment);
                            setIsEditOpen(true);
                          }}
                          className="flex items-center gap-2"
                        >
                          <Edit className="h-4 w-4 text-blue-600" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setTreatmentToDelete(treatment);
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
        )}
      </div>
      {selectedTreatment && (
        <EditTreatment
          treatment={selectedTreatment}
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
        />
      )}
      {treatmentToDelete && (
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent className="sm:max-w-md bg-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-800">
                Confirm Deletion
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Are you sure you want to permanently delete this treatment? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex justify-end gap-2">
              <Button
                variant="outline"
                className="border-gray-300 text-gray-700"
                onClick={() => {
                  setIsDeleteOpen(false);
                  setTreatmentToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => handleDelete(treatmentToDelete)}
                disabled={deleteMutation.isLoading}
              >
                {deleteMutation.isLoading ? 'Deleting...' : 'Yes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Treatments;