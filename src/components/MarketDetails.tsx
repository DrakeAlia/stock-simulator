import React, { useEffect, useState } from "react";
import MetricCard from "./MetricCard";
import { generateSparklineData } from "@/lib/utils";

interface MarketDetailsProps {
  theme: "dark" | "light";
  currentPrice: number;
  volume: number;
}

const MarketDetails: React.FC<MarketDetailsProps> = ({
  theme,
  currentPrice,
  volume,
}) => {
  const [metricsData, setMetricsData] = useState({
    volume: generateSparklineData(24, volume * 0.8, volume * 1.2),
    marketCap: generateSparklineData(24, 700e9, 750e9),
    peRatio: generateSparklineData(24, 65, 75),
    weekRange: generateSparklineData(24, 100, 300),
  });

  // Update sparkline data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setMetricsData((prev) => ({
        volume: [...prev.volume.slice(1), volume * (0.9 + Math.random() * 0.2)],
        marketCap: [
          ...prev.marketCap.slice(1),
          prev.marketCap[prev.marketCap.length - 1] *
            (0.995 + Math.random() * 0.01),
        ],
        peRatio: [
          ...prev.peRatio.slice(1),
          prev.peRatio[prev.peRatio.length - 1] * (0.99 + Math.random() * 0.02),
        ],
        weekRange: [...prev.weekRange.slice(1), currentPrice],
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [volume, currentPrice]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <MetricCard
        title="24h Volume"
        value={volume.toLocaleString(undefined, {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        })}
        description="Total trading volume in the last 24 hours"
        theme={theme}
        sparklineData={metricsData.volume}
      />
      <MetricCard
        title="Market Cap"
        value="$724.5B"
        description="Total market value of all outstanding shares"
        theme={theme}
        sparklineData={metricsData.marketCap}
      />
      <MetricCard
        title="P/E Ratio"
        value="70.5"
        description="Price-to-Earnings ratio indicates company valuation"
        theme={theme}
        sparklineData={metricsData.peRatio}
      />
      <MetricCard
        title="52W Range"
        value="$101.81 - $299.29"
        description="Price range over the last 52 weeks"
        theme={theme}
        sparklineData={metricsData.weekRange}
      />
    </div>
  );
};

export default MarketDetails;
