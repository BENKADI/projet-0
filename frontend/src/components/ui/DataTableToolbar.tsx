import React from 'react';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Search } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
}

interface DataTableToolbarProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  filterValue?: string;
  onFilterValueChange?: (value: string) => void;
  filterPlaceholder?: string;
  filterOptions?: FilterOption[];
}

export const DataTableToolbar: React.FC<DataTableToolbarProps> = ({
  searchTerm,
  onSearchTermChange,
  filterValue,
  onFilterValueChange,
  filterPlaceholder,
  filterOptions,
}) => {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, email..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className="pl-10"
          />
        </div>
        {filterOptions && onFilterValueChange && (
          <Select value={filterValue} onValueChange={onFilterValueChange}>
            <SelectTrigger className="w-auto min-w-[180px]">
              <SelectValue placeholder={filterPlaceholder} />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
};
