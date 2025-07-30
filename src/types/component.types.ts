// Component Props Types

export interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
}

export interface UnitCardProps {
  unit: {
    id: string;
    name: string;
    createTime: number;
    words: any[];
  };
  isSelected?: boolean;
  onSelect?: (unitId: string) => void;
  onEdit?: (unitId: string, values: { name: string }) => void;
  onDelete?: (unitId: string) => void;
  onViewDetails?: (unitId: string) => void;
}

export interface UnitListProps {
  units: UnitCardProps['unit'][];
  selectedUnits: string[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onSelectUnit: (unitId: string) => void;
  onSelectAll: (checked: boolean) => void;
  onCreateUnit: () => void;
  onDeleteSelected: () => void;
  onExportAll: () => void;
  onImportAll: () => void;
  onHelp: () => void;
}

export interface ActionButtonProps {
  icon: React.ReactNode;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
} 