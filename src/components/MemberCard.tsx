import React from 'react';
import { Member } from '../types';
import { User, Award, Clock, MapPin, AlertCircle } from 'lucide-react';

interface MemberCardProps {
  member: Member;
  isDragging: boolean;
  hasConflict: boolean;
}

const MemberCard: React.FC<MemberCardProps> = ({ member, isDragging, hasConflict }) => {
  return (
    <div
      className={`
        bg-white rounded-lg border-2 p-3 cursor-grab transition-all duration-200
        ${isDragging ? 'rotate-3 scale-105 shadow-2xl border-blue-400' : 'shadow-md hover:shadow-lg border-gray-200'}
        ${hasConflict ? 'border-red-400 bg-red-50' : ''}
      `}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          hasConflict ? 'bg-red-100' : 'bg-blue-100'
        }`}>
          <User className={`w-4 h-4 ${hasConflict ? 'text-red-600' : 'text-blue-600'}`} />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-gray-900 text-sm">{member.name}</div>
          <div className="text-xs text-gray-500">{member.team}</div>
        </div>
        {hasConflict && (
          <AlertCircle className="w-4 h-4 text-red-500" />
        )}
      </div>

      <div className="space-y-1 text-xs text-gray-600">
        {member.qualifications.length > 0 && (
          <div className="flex items-center gap-1">
            <Award className="w-3 h-3" />
            <span className="truncate">{member.qualifications[0]}</span>
          </div>
        )}
        
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{member.availableHours.start} - {member.availableHours.end}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          <span className="truncate">{member.availableAreas.join(', ')}</span>
        </div>
      </div>

      {member.notes && (
        <div className="mt-2 text-xs text-gray-500 bg-gray-50 rounded p-1">
          {member.notes}
        </div>
      )}
    </div>
  );
};

export default MemberCard;