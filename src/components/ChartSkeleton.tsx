import React from "react";

interface ChartSkeletonProps {
  theme: "dark" | "light";
}

const ChartSkeleton: React.FC<ChartSkeletonProps> = ({ theme }) => {
  const bgColor = theme === "dark" ? "bg-gray-800" : "bg-gray-200";
  const animatePulse = "animate-pulse";

  return (
    <div className="space-y-4">
      {/* Chart Area */}
      <div className={`h-64 sm:h-96 ${bgColor} ${animatePulse} rounded-lg`} />
      {/* Time Labels */}
      <div className="flex justify-between mt-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`h-4 w-16 ${bgColor} ${animatePulse} rounded`}
          />
        ))}
      </div>
      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className={`h-4 w-20 ${bgColor} ${animatePulse} rounded`} />
            <div className={`h-8 w-32 ${bgColor} ${animatePulse} rounded`} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChartSkeleton;
