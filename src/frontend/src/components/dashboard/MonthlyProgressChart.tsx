import React from 'react';

interface MonthlyProgressChartProps {
  data: { day: number; percentage: number }[];
}

export function MonthlyProgressChart({ data }: MonthlyProgressChartProps) {
  if (data.length === 0) {
    return null;
  }

  const maxPercentage = 100;
  const chartHeight = 200;
  const dayWidth = 28;
  const chartWidth = data.length * dayWidth;
  const padding = { top: 20, right: 10, bottom: 30, left: 40 };

  // Generate line path
  const linePoints = data.map((item, index) => {
    const x = padding.left + index * dayWidth + dayWidth / 2;
    const y = padding.top + chartHeight - (item.percentage / maxPercentage) * chartHeight;
    return { x, y };
  });

  const linePath = linePoints
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  return (
    <div className="w-full overflow-x-auto">
      <svg
        width={chartWidth + padding.left + padding.right}
        height={chartHeight + padding.top + padding.bottom}
        className="min-w-full"
      >
        {/* Y-axis labels and grid lines */}
        {[0, 25, 50, 75, 100].map((value) => {
          const y = padding.top + chartHeight - (value / maxPercentage) * chartHeight;
          return (
            <g key={value}>
              <line
                x1={padding.left}
                y1={y}
                x2={chartWidth + padding.left}
                y2={y}
                stroke="currentColor"
                strokeOpacity="0.1"
                strokeWidth="1"
              />
              <text
                x={padding.left - 10}
                y={y}
                textAnchor="end"
                alignmentBaseline="middle"
                className="text-xs fill-muted-foreground"
              >
                {value}%
              </text>
            </g>
          );
        })}

        {/* Line chart */}
        <path
          d={linePath}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {linePoints.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="3"
            className="fill-primary"
          />
        ))}

        {/* X-axis day labels */}
        {data.map((item, index) => {
          const x = padding.left + index * dayWidth + dayWidth / 2;
          const showLabel = data.length <= 15 || index % 2 === 0;
          
          return showLabel ? (
            <text
              key={item.day}
              x={x}
              y={padding.top + chartHeight + 15}
              textAnchor="middle"
              className="text-xs fill-muted-foreground"
            >
              {item.day}
            </text>
          ) : null;
        })}

        {/* X-axis line */}
        <line
          x1={padding.left}
          y1={padding.top + chartHeight}
          x2={chartWidth + padding.left}
          y2={padding.top + chartHeight}
          stroke="currentColor"
          strokeOpacity="0.2"
          strokeWidth="1"
        />

        {/* Y-axis line */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={padding.top + chartHeight}
          stroke="currentColor"
          strokeOpacity="0.2"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}
