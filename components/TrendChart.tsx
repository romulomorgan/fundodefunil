
import React from 'react';

interface TrendChartProps {
  data: number[];
  color: string;
}

const TrendChart: React.FC<TrendChartProps> = ({ data, color }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;
  
  return (
    <div className="flex items-end gap-1 h-12 w-full px-2">
      {data.map((v, i) => (
        <div 
          key={i} 
          className={`flex-1 rounded-t-sm transition-all duration-500 bg-${color}-500/40 border-t border-${color}-400/50`}
          style={{ height: `${((v - min) / range) * 100}%` }}
        ></div>
      ))}
    </div>
  );
};

export default TrendChart;
