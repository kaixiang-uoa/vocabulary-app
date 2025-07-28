/**
 * Style mapping file
 * Maps existing CSS class names to TailwindCSS class names
 * Used for gradual migration process
 */

export const styleMapping = {
  // Layout classes
  'home-page': 'w-full max-w-7xl mx-auto p-6',
  'unit-detail-page': 'w-full max-w-7xl mx-auto p-6',
  'review-page': 'w-full max-w-7xl mx-auto p-6',
  'spelling-review-page': 'w-full max-w-7xl mx-auto p-6',
  
  // Page title classes
  'page-title': 'text-3xl font-bold text-gray-900 mb-6',
  'page-header': 'flex justify-between items-center mb-6',
  
  // Control panel classes
  'control-panel': 'flex items-center justify-between mb-6 p-3 bg-gray-50 rounded-lg border border-gray-200',
  'control-panel-left': 'flex items-center gap-3',
  'control-panel-right': 'flex items-center gap-3',
  
  // Button styles
  'btn-primary': 'bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-semibold text-lg border-none shadow-md transition-all duration-200 cursor-pointer px-5 py-2.5 hover:transform hover:-translate-y-0.5 hover:shadow-lg',
  'btn-secondary': 'bg-gray-100 text-gray-700 rounded-lg font-medium text-lg border-none shadow-sm transition-all duration-200 cursor-pointer px-5 py-2.5',
  'btn-danger': 'bg-gradient-to-r from-error-500 to-error-600 text-white rounded-lg font-semibold text-lg border-none shadow-md transition-all duration-200 cursor-pointer px-5 py-2.5 hover:transform hover:-translate-y-0.5 hover:shadow-lg',
  'btn-success': 'bg-gradient-to-r from-success-500 to-success-600 text-white rounded-lg font-semibold text-lg border-none shadow-md transition-all duration-200 cursor-pointer px-5 py-2.5 hover:transform hover:-translate-y-0.5 hover:shadow-lg',
  'btn-standard': 'px-6 py-2 text-base font-medium',
  'btn-large': 'px-8 py-3 text-lg font-semibold',
  
  // Card styles
  'word-card': 'rounded-xl border-2 border-gray-200 bg-white transition-all duration-300 h-full flex flex-col cursor-pointer p-6 relative min-h-[280px] hover:transform hover:-translate-y-1 hover:shadow-wordcard-hover',
  'word-card.mastered': 'border-success-500 bg-gradient-to-br from-success-50 to-blue-50',
  'unit-card': 'rounded-xl border-2 border-gray-200 bg-white shadow-wordcard transition-all duration-300 h-full flex flex-col cursor-pointer relative overflow-hidden hover:transform hover:-translate-y-1 hover:shadow-wordcard-hover min-h-[320px]',
  'unit-card.selected': 'border-primary-500 shadow-wordcard-hover',
  'review-card': 'rounded-xl border-2 border-gray-200 bg-white transition-all duration-300 h-full flex flex-col cursor-pointer p-6 relative min-h-[280px] hover:transform hover:-translate-y-1 hover:shadow-wordcard-hover',
  'spelling-card': 'max-w-2xl mx-auto p-8 bg-white rounded-xl shadow-lg',
  
  // Stats card styles
  'stats-card': 'rounded-xl border-2 border-gray-200 bg-white shadow-wordcard transition-all duration-300 h-full flex flex-col cursor-pointer p-5 relative hover:transform hover:-translate-y-1 hover:shadow-wordcard-hover',
  'stats-card.mastered': 'border-success-500 bg-gradient-to-br from-success-50 to-blue-50',
  
  // Utility classes
  'flex-between': 'flex items-center justify-between',
  'flex-center': 'flex items-center justify-center',
  'flex-start': 'flex items-center',
  'mb-24': 'mb-24',
  'mb-8': 'mb-8',
  'mb-32': 'mb-32',
  'mr-8': 'mr-8',
  'text-secondary': 'text-gray-500',
  'text-small': 'text-sm',
  'text-large': 'text-lg',
  'text-standard': 'text-base',
  'font-semibold': 'font-semibold',
  'font-medium': 'font-medium',
  'rounded': 'rounded-lg',
  'hidden': 'hidden',
  
  // Component specific classes
  'word-card-edit': 'absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 transition-colors duration-200',
  'word-card-header': 'flex items-center justify-between mb-4',
  'word-card-checkbox': 'flex items-center gap-2',
  'word-card-content': 'flex items-center gap-2 mb-4',
  'word-card-word': 'text-2xl font-bold text-gray-900',
  'word-card-pronunciation': 'p-1 text-gray-500 hover:text-gray-700 transition-colors duration-200',
  'word-card-meaning': 'flex-1',
  'word-card-meaning-text': 'text-lg text-gray-700 leading-relaxed',
  
  'unit-card-header': 'bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-t-xl',
  'unit-card-icon': 'w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center',
  'unit-card-actions': 'flex items-center gap-2',
  'unit-card-edit': 'p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors duration-200',
  'unit-card-content': 'p-5 flex flex-col h-full',
  'unit-card-title': 'mb-4',
  'unit-card-name': 'text-xl font-bold text-gray-900 mb-2',
  'unit-card-word-count': 'text-sm text-gray-500',
  'unit-card-progress': 'mb-4',
  'unit-card-progress-header': 'flex items-center justify-between mb-2',
  'unit-card-progress-label': 'text-sm font-medium text-gray-700',
  'unit-card-progress-value': 'text-sm font-semibold text-blue-600',
  'unit-card-progress-bar': 'w-full bg-gray-200 rounded-full h-2',
  'unit-card-progress-fill': 'bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300',
  'unit-card-stats': 'flex items-center gap-4 mb-4',
  'unit-card-stat': 'flex items-center gap-1',
  'unit-card-stat.mastered': 'text-green-600',
  'unit-card-stat.unmastered': 'text-red-600',
  'unit-card-detail-link': 'mt-auto flex items-center justify-between text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200',
  
  'review-card-inner': 'relative w-full h-full transition-transform duration-500 transform-style-preserve-3d',
  'review-card-front': 'absolute inset-0 backface-hidden bg-white rounded-xl border-2 border-gray-200 p-8 flex flex-col items-center justify-center',
  'review-card-back': 'absolute inset-0 backface-hidden rotate-y-180 bg-white rounded-xl border-2 border-gray-200 p-8 flex flex-col items-center justify-center',
  'review-card-word': 'text-3xl font-bold text-gray-900',
  'review-card-pronunciation': 'p-2 text-gray-500 hover:text-gray-700 transition-colors duration-200',
  'review-card-master-btn': 'btn-secondary px-6 py-3 text-base font-medium',
  
  'spelling-input': 'text-lg h-12 text-center font-mono',
  'spelling-input-display': 'inline-block w-8 h-8 mx-1 text-center leading-8 border-2 rounded font-mono text-lg font-bold',
  'spelling-history': 'mt-8 text-center',
  'spelling-history-item': 'inline-block mx-1 px-3 py-1 rounded text-sm font-mono',
  
  // Icon classes
  'icon-standard': 'text-gray-500 hover:text-gray-700',
  'icon-success': 'text-green-500',
  
  // Text classes
  'text-success': 'text-green-600',
  'text-error': 'text-red-600',
  'text-warning': 'text-yellow-600',
  
  // Progress classes
  'progress-text': 'text-lg font-medium text-gray-700 mb-2',
};

/**
 * Get TailwindCSS class name for a given CSS class
 * @param className Original CSS class name
 * @returns TailwindCSS class name
 */
export const getTailwindClass = (className: string): string => {
  return styleMapping[className] || className;
};

/**
 * Get TailwindCSS class names for multiple CSS classes
 * @param classNames Array of original CSS class names
 * @returns TailwindCSS class names string
 */
export const getTailwindClasses = (classNames: string[]): string => {
  return classNames.map(getTailwindClass).join(' ');
}; 