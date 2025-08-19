import React from "react";
import Skeleton from "./Skeleton";

// Unit Card Skeleton
export const UnitCardSkeleton: React.FC = () => (
  <div className="bg-white/90 rounded-xl shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-between mb-4">
      <Skeleton.Text width="60%" height={24} />
      <Skeleton.Circle size="small" />
    </div>

    <div className="space-y-3 mb-4">
      <Skeleton.Text width="80%" />
      <Skeleton.Text width="60%" />
      <Skeleton.Text width="40%" />
    </div>

    <div className="flex items-center justify-between">
      <Skeleton.Text width="30%" height={16} />
      <Skeleton.Rounded width={80} height={32} />
    </div>
  </div>
);

// Statistics Card Skeleton
export const StatCardSkeleton: React.FC = () => (
  <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 p-6">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton.Text width="40%" height={16} />
        <Skeleton.Text width="60%" height={32} />
      </div>
      <Skeleton.Circle size="large" />
    </div>
  </div>
);

// Word Card Skeleton
export const WordCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
    <div className="flex items-center justify-between mb-3">
      <Skeleton.Text width="50%" height={20} />
      <Skeleton.Circle size="small" />
    </div>
    <Skeleton.Text width="70%" height={16} />
  </div>
);

// Table Row Skeleton
export const TableRowSkeleton: React.FC<{ columns: number }> = ({
  columns,
}) => (
  <tr className="hover:bg-gray-50 transition-colors duration-150">
    {Array.from({ length: columns }).map((_, index) => (
      <td
        key={index}
        className="px-4 py-3 text-sm text-gray-900 border-b border-gray-100"
      >
        <Skeleton.Text width="80%" />
      </td>
    ))}
  </tr>
);

// Search Bar Skeleton
export const SearchBarSkeleton: React.FC = () => (
  <div className="relative">
    <Skeleton.Rounded width="100%" height={48} />
  </div>
);

// Button Skeleton
export const ButtonSkeleton: React.FC<{ width?: string | number }> = ({
  width = 120,
}) => <Skeleton.Rounded width={width} height={40} />;

// Modal Skeleton
export const ModalSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
    <div className="space-y-4">
      <Skeleton.Text width="60%" height={24} />
      <Skeleton.Text width="100%" />
      <Skeleton.Text width="80%" />
      <div className="flex gap-3 pt-4">
        <Skeleton.Rounded width={80} height={36} />
        <Skeleton.Rounded width={80} height={36} />
      </div>
    </div>
  </div>
);

// Progress Bar Skeleton
export const ProgressBarSkeleton: React.FC = () => (
  <div className="space-y-2">
    <div className="flex justify-between">
      <Skeleton.Text width="30%" height={16} />
      <Skeleton.Text width="20%" height={16} />
    </div>
    <Skeleton.Rounded width="100%" height={12} />
  </div>
);

// List Item Skeleton
export const ListItemSkeleton: React.FC = () => (
  <div className="flex items-center space-x-3 p-3 border-b border-gray-100">
    <Skeleton.Circle size="medium" />
    <div className="flex-1 space-y-2">
      <Skeleton.Text width="60%" />
      <Skeleton.Text width="40%" />
    </div>
    <Skeleton.Rounded width={60} height={24} />
  </div>
);

// Grid Skeleton
export const GridSkeleton: React.FC<{
  items: number;
  columns?: number;
  renderItem?: () => React.ReactNode;
}> = ({ items, columns = 3, renderItem = () => <UnitCardSkeleton /> }) => (
  <div
    className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-4`}
  >
    {Array.from({ length: items }).map((_, index) => (
      <div key={index}>{renderItem()}</div>
    ))}
  </div>
);

// Page Skeleton
export const PageSkeleton: React.FC = () => (
  <div className="space-y-6">
    {/* Header */}
    <div className="flex justify-between items-center">
      <Skeleton.Text width="200px" height={32} />
      <div className="flex gap-3">
        <ButtonSkeleton width={100} />
        <ButtonSkeleton width={100} />
      </div>
    </div>

    {/* Search and filters */}
    <div className="space-y-4">
      <SearchBarSkeleton />
      <div className="flex gap-3">
        <ButtonSkeleton width={120} />
        <ButtonSkeleton width={120} />
        <ButtonSkeleton width={120} />
      </div>
    </div>

    {/* Content grid */}
    <GridSkeleton items={6} />
  </div>
);
