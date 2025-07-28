import React from 'react';
import { Card } from '../components/ui';
import { StatCardProps } from '../types/component.types';
import { getTailwindClass } from '../utils/styleMapping';

const StatCard: React.FC<StatCardProps> = ({ 
  label, 
  value, 
  icon, 
  color, 
  onClick 
}) => {
  return (
    <Card 
      className={`${getTailwindClass('stats-card')} hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer`}
      style={{ 
        borderRadius: '12px', 
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
        border: 'none', 
        background: 'white'
      }}
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ 
              background: `${color}15`,
              color: color
            }}
          >
            {icon}
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">{label}</div>
            <div 
              className="text-2xl font-bold"
              style={{ color: color }}
            >
              {value}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StatCard; 