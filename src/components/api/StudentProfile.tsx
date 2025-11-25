import React, { useState } from 'react';

interface StudentProfile {
  studentVector?: [];
  eligiblePrograms?: string[];
}

export function StudentProfile({
  studentVector, 
  eligiblePrograms,
}: StudentProfile) {
    const [value, setValue] = useState<StudentProfile>({})}
