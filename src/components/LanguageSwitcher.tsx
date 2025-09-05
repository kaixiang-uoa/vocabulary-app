import React from 'react';
import { useTranslation } from 'react-i18next';

import { LanguageSwitcherProps } from '../types';

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  style = {},
  className,
}) => {
  const { i18n, t } = useTranslation();

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
  };

  return (
    <div
      className={`flex items-center gap-1 bg-white rounded-lg border border-gray-200 shadow-sm ${className || ''}`}
      style={style}
    >
      <button
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${
          i18n.language === 'zh'
            ? 'bg-blue-500 text-white'
            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
        }`}
        onClick={() => handleLanguageChange('zh')}
      >
        {t('chinese')}
      </button>
      <button
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${
          i18n.language === 'en'
            ? 'bg-blue-500 text-white'
            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
        }`}
        onClick={() => handleLanguageChange('en')}
      >
        {t('english')}
      </button>
    </div>
  );
};

export default LanguageSwitcher;
