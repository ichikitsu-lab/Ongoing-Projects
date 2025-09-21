import React from 'react';
import { Calendar, Search } from 'lucide-react';

interface FilterPanelProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  selectedDate,
  onDateChange,
  searchTerm,
  onSearchChange,
}) => {
  return (
    <div className="flex gap-4 items-center">
      <div className="flex items-center gap-2">
        <Calendar className="w-5 h-5 text-gray-500" />
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <div className="flex items-center gap-2 flex-1 max-w-md">
        <Search className="w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="メンバー名で検索..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  );
};

export default FilterPanel;