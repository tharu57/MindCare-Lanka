
import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import AddTherapist from './AddTherapist';

const ViewTherapist = ({ therapist, open, onOpenChange }) => {
  // Calculate experience based on work_start_year
  const calculateExperience = (workStartYear) => {
    const currentYear = 2025; // Current year based on provided date
    return workStartYear ? currentYear - parseInt(workStartYear) : 'N/A';
  };

  const fields = [
    { label: 'Name', value: therapist.name || 'N/A' },
    { label: 'Age', value: therapist.age }, // Age is always a number
    { label: 'Email', value: therapist.email || 'N/A' },
    { label: 'Phone', value: therapist.phone || 'N/A' },
    { label: 'Address', value: therapist.address || 'N/A' },
    { label: 'Role', value: therapist.role || 'N/A' },
    { label: 'Experience', value: `${calculateExperience(therapist.work_start_year)} years` },
    { label: 'Gender', value: therapist.gender || 'N/A' },
  ];

  return (
    <Sheet open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) onOpenChange(null); // Clear therapist when closing
    }}>
      <SheetContent className="bg-white p-4 sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-xl font-bold text-gray-800">
            Therapist Details
          </SheetTitle>
          <SheetDescription className="text-gray-600">
            Details for {therapist.name}
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-16 w-16">
              <AvatarImage src={therapist.image} alt={therapist.name} />
              <AvatarFallback className="bg-gray-200 text-gray-600">
                {therapist.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <p className="text-lg font-medium text-gray-700">{therapist.name}</p>
          </div>
          <div className="grid gap-4">
            {fields.map((field) => (
              <div key={field.label} className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">{field.label}</span>
                <span className="text-sm text-gray-600">{field.value}</span>
              </div>
            ))}
          </div>
          
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ViewTherapist;
