import React, { useState, useRef, useEffect } from 'react';

interface MonthlyProgressChartProps {
  data: { day: number; percentage: number }[];
  isCurrentMonth?: boolean;
  currentDay?: number;
}

export function MonthlyProgressChart({ data, isCurrentMonth = false, currentDay = 0 }: MonthlyProgressChartProps) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; day: number; percentage: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

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
    return { x, y, day: item.day, percentage: item.percentage };
  });

  const linePath = linePoints
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Find nearest point
    let nearestPoint = linePoints[0];
    let minDistance = Infinity;

    linePoints.forEach((point) => {
      const distance = Math.sqrt(Math.pow(point.x - mouseX, 2) + Math.pow(point.y - mouseY, 2));
      if (distance < minDistance) {
        minDistance = distance;
        nearestPoint = point;
      }
    });

    // Show tooltip if within reasonable distance (30px)
    if (minDistance < 30) {
      setTooltip({
        x: nearestPoint.x,
        y: nearestPoint.y,
        day: nearestPoint.day,
        percentage: nearestPoint.percentage,
      });
    } else {
      setTooltip(null);
    }
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  const handleTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    if (!svgRef.current || e.touches.length === 0) return;

    const rect = svgRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;

    // Find nearest point
    let nearestPoint = linePoints[0];
    let minDistance = Infinity;

    linePoints.forEach((point) => {
      const distance = Math.sqrt(Math.pow(point.x - touchX, 2) + Math.pow(point.y - touchY, 2));
      if (distance < minDistance) {
        minDistance = distance;
        nearestPoint = point;
      }
    });

    // Show tooltip if within reasonable distance (40px for touch)
    if (minDistance < 40) {
      setTooltip({
        x: nearestPoint.x,
        y: nearestPoint.y,
        day: nearestPoint.day,
        percentage: nearestPoint.percentage,
      });
    }
  };

  const handleTouchEnd = () => {
    // Keep tooltip visible for a moment on touch
    setTimeout(() => setTooltip(null), 1500);
  };

  return (
    <div className="w-full overflow-x-auto">
      <svg
        ref={svgRef}
        width={chartWidth + padding.left + padding.right}
        height={chartHeight + padding.top + padding.bottom}
        className="min-w-full"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
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
        {linePoints.map((point, index) => {
          const isToday = isCurrentMonth && point.day === currentDay;
          const isHovered = tooltip && tooltip.day === point.day;

          return (
            <g key={index}>
              {/* Highlight today with a larger circle and ring */}
              {isToday && (
                <>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="8"
                    className="fill-primary/20"
                  />
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="5"
                    className="fill-primary stroke-background"
                    strokeWidth="2"
                  />
                </>
              )}
              {/* Regular point */}
              {!isToday && (
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={isHovered ? "5" : "3"}
                  className={isHovered ? "fill-primary stroke-background" : "fill-primary"}
                  strokeWidth={isHovered ? "2" : "0"}
                />
              )}
            </g>
          );
        })}

        {/* X-axis day labels */}
        {data.map((item, index) => {
          const x = padding.left + index * dayWidth + dayWidth / 2;
          const showLabel = data.length <= 15 || index % 2 === 0;
          const isToday = isCurrentMonth && item.day === currentDay;

          return showLabel ? (
            <text
              key={item.day}
              x={x}
              y={padding.top + chartHeight + 15}
              textAnchor="middle"
              className={isToday ? "text-xs fill-primary font-bold" : "text-xs fill-muted-foreground"}
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

        {/* Tooltip */}
        {tooltip && (
          <g>
            {/* Tooltip background */}
            <rect
              x={tooltip.x - 35}
              y={tooltip.y - 45}
              width="70"
              height="35"
              rx="4"
              className="fill-popover stroke-border"
              strokeWidth="1"
            />
            {/* Tooltip text */}
            <text
              x={tooltip.x}
              y={tooltip.y - 30}
              textAnchor="middle"
              className="text-xs fill-popover-foreground font-medium"
            >
              Day {tooltip.day}
            </text>
            <text
              x={tooltip.x}
              y={tooltip.y - 16}
              textAnchor="middle"
              className="text-sm fill-popover-foreground font-bold"
            >
              {tooltip.percentage}%
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
