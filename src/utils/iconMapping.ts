// Icon mapping from Ant Design to Heroicons
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  BookOpenIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon,
  PencilIcon,
  SpeakerWaveIcon,
  PlusIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ArrowUpTrayIcon,
  QuestionMarkCircleIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

// Icon mapping object
export const iconMapping = {
  // Navigation icons
  ArrowLeftOutlined: ArrowLeftIcon,
  ArrowRightOutlined: ArrowRightIcon,
  
  // Action icons
  ReloadOutlined: ArrowPathIcon,
  EditOutlined: PencilIcon,
  PlusOutlined: PlusIcon,
  DeleteOutlined: TrashIcon,
  SearchOutlined: MagnifyingGlassIcon,
  UploadOutlined: ArrowUpTrayIcon,
  ExportOutlined: ArrowDownTrayIcon,
  
  // Status icons
  CheckCircleOutlined: CheckCircleIcon,
  CloseCircleOutlined: XCircleIcon,
  
  // Feature icons
  BookOutlined: BookOpenIcon,
  SoundOutlined: SpeakerWaveIcon,
  QuestionCircleOutlined: QuestionMarkCircleIcon,
  
  // Sync icon (using ArrowPathIcon as replacement)
  SyncOutlined: ArrowPathIcon,
};

// Helper function to get Heroicon component
export const getIcon = (antIconName: string) => {
  return iconMapping[antIconName as keyof typeof iconMapping] || null;
};

// Type for icon names
export type IconName = keyof typeof iconMapping; 