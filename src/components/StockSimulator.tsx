"use client";

import React, { useState, useEffect, useCallback } from "react";
import { themeStyles } from "@/lib/theme";
import {
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  Bar,
  ComposedChart,
} from "recharts";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
// import { TooltipProps } from "recharts";
// import {
//   NameType,
//   ValueType,
// } from "recharts/types/component/DefaultTooltipContent";
import ChartSettings from "./ChartSettings";
import MarketDetails from "./MarketDetails";
import MarketAlert from "./MarketAlert";

interface StockSimulatorProps {
  symbol: string;
  companyName: string;
  description?: string;
  initialPrice?: number;
  defaultTimeframe?: TimeFrame;
  defaultChartType?: ChartStyleType;
  theme?: "dark" | "light";
  defaultShowTutorial?: boolean;
  customMetrics?: {
    title: string;
    value: number;
    description: string;
    formatter?: (value: number) => string;
  }[];
  onTimeframeChange?: (timeframe: TimeFrame) => void;
  onThemeChange?: (theme: "dark" | "light") => void;
}
interface StockDataPoint {
  timestamp: Date;
  price: number;
  displayTime: string;
  volume: number;
  ma20?: number;
  change?: number;
  changePercent?: number;
}

type TimeFrame = "1D" | "1W" | "1M" | "3M" | "1Y" | "5Y";
export type ChartStyleType = "line" | "candle" | "area";

type TooltipPayload = {
  value: number;
  payload: {
    displayTime: string;
    price: number;
    volume: number;
    change?: number;
    changePercent?: number;
  };
};

type CustomTooltipProps = {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
};

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload?.[0]) {
    return (
      <div className="bg-black/90 px-4 py-2 rounded-lg shadow-lg">
        <p className="text-gray-400 text-sm">
          {payload[0].payload.displayTime}
        </p>
        <p className="text-white text-lg font-bold">
          ${Number(payload[0].value).toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

const formatDateByTimeframe = (date: Date, timeframe: TimeFrame): string => {
  switch (timeframe) {
    case "1D":
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    case "1W":
      return date.toLocaleDateString([], {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    case "1M":
      return date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      });
    case "3M":
    case "1Y":
      return date.toLocaleDateString([], {
        month: "short",
        year: "numeric",
      });
    case "5Y":
      return date.toLocaleDateString([], {
        year: "numeric",
      });
    default:
      return date.toLocaleString();
  }
};

const StockSimulator: React.FC<StockSimulatorProps> = ({
  symbol,
  companyName,
  description,
  initialPrice = 100,
  defaultTimeframe = "1D",
  defaultChartType = "area",
  theme: initialTheme = "dark",
  onTimeframeChange,
  onThemeChange,
}) => {
  const [stockData, setStockData] = useState<StockDataPoint[]>([]);
  const [currentPrice, setCurrentPrice] = useState(initialPrice);
  const [trend, setTrend] = useState<"up" | "down">("up");
  const [showVolume, setShowVolume] = useState(false);
  const [showMA, setShowMA] = useState(false);
  const [theme, setTheme] = useState(initialTheme);
  const [selectedTimeframe, setSelectedTimeframe] =
    useState<TimeFrame>(defaultTimeframe);
  const [chartStyle, setChartStyle] =
    useState<ChartStyleType>(defaultChartType);
  const [alert, setAlert] = useState({
    show: false,
    title: "",
    message: "",
    type: "info" as const,
  });

  const generateSimulatedData = useCallback(
    (timeframe: TimeFrame) => {
      const newData: StockDataPoint[] = [];
      const now = new Date();
      let basePrice = currentPrice;

      // Configure time intervals based on timeframe
      const config = {
        "1D": {
          points: 24,
          getDate: (i: number) => {
            const date = new Date(now);
            date.setHours(date.getHours() - (24 - i));
            return date;
          },
        },
        "1W": {
          points: 7,
          getDate: (i: number) => {
            const date = new Date(now);
            date.setDate(date.getDate() - (7 - i));
            return date;
          },
        },
        "1M": {
          points: 30,
          getDate: (i: number) => {
            const date = new Date(now);
            date.setDate(date.getDate() - (30 - i));
            return date;
          },
        },
        "3M": {
          points: 90,
          getDate: (i: number) => {
            const date = new Date(now);
            date.setDate(date.getDate() - (90 - i));
            return date;
          },
        },
        "1Y": {
          points: 365,
          getDate: (i: number) => {
            const date = new Date(now);
            date.setDate(date.getDate() - (365 - i));
            return date;
          },
        },
        "5Y": {
          points: 60,
          getDate: (i: number) => {
            const date = new Date(now);
            date.setMonth(date.getMonth() - (60 - i));
            return date;
          },
        },
      }[timeframe];

      for (let i = 0; i < config.points; i++) {
        const timestamp = config.getDate(i);
        const volatility = Math.random() * 4 - 2;
        basePrice = Math.max(0, basePrice + volatility);

        newData.push({
          timestamp,
          displayTime: formatDateByTimeframe(timestamp, timeframe),
          price: Number(basePrice.toFixed(2)),
          volume: Math.floor(Math.random() * 1000000),
          change: basePrice - currentPrice,
          changePercent: ((basePrice - currentPrice) / currentPrice) * 100,
        });
      }

      setStockData(newData);
      setCurrentPrice(basePrice);
      setTrend(basePrice >= currentPrice ? "up" : "down");
    },
    [currentPrice]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      generateSimulatedData(selectedTimeframe);
    }, 2000);

    return () => clearInterval(interval);
  }, [selectedTimeframe, generateSimulatedData]);

  const handleTimeframeChange = (newTimeframe: TimeFrame) => {
    setSelectedTimeframe(newTimeframe);
    onTimeframeChange?.(newTimeframe);
  };

  const handleThemeChange = (newTheme: "dark" | "light") => {
    setTheme(newTheme);
    onThemeChange?.(newTheme);
  };

  return (
    <div
      className={`w-full min-h-screen ${themeStyles[theme].background} ${themeStyles[theme].text} p-4`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-2">{symbol}</h1>
          <div className="flex flex-col space-y-1">
            <span className="text-gray-400">{companyName}</span>
            {description && (
              <span className="text-sm text-gray-500">{description}</span>
            )}
          </div>
          <span className="text-2xl font-bold mt-4 block">
            ${currentPrice.toFixed(2)}
          </span>
          <div className="flex items-center mt-2">
            <span
              className={`text-lg ${
                trend === "up" ? "text-green-500" : "text-red-500"
              }`}
            >
              {trend === "up" ? "+" : "-"}$
              {Math.abs(stockData[stockData.length - 1]?.change || 0).toFixed(
                2
              )}
              (
              {Math.abs(
                stockData[stockData.length - 1]?.changePercent || 0
              ).toFixed(2)}
              %)
            </span>
          </div>
        </div>

        {/* Chart Section */}
        <div className={`${themeStyles[theme].card} rounded-xl p-6 mb-6`}>
          {/* Chart Controls */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-6">
              {["1D", "1W", "1M", "3M", "1Y", "5Y"].map((tf) => (
                <button
                  key={tf}
                  onClick={() => handleTimeframeChange(tf as TimeFrame)}
                  className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                    selectedTimeframe === tf
                      ? "text-green-500 border-green-500"
                      : "text-gray-400 border-transparent hover:text-gray-300"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  handleThemeChange(theme === "dark" ? "light" : "dark")
                }
                className="hover:bg-gray-800/50"
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </Button>
              <ChartSettings
                showVolume={showVolume}
                showMA={showMA}
                setShowVolume={setShowVolume}
                setShowMA={setShowMA}
                chartStyle={chartStyle}
                setChartStyle={setChartStyle}
              />
            </div>
          </div>

          <MarketDetails theme={theme} />

          {/* Chart */}
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={stockData}>
                <CartesianGrid
                  stroke={theme === "dark" ? "#374151" : "#E5E7EB"}
                  opacity={0.2}
                />
                <XAxis
                  dataKey="displayTime"
                  tick={{ fill: theme === "dark" ? "#9CA3AF" : "#4B5563" }}
                  axisLine={{
                    stroke: theme === "dark" ? "#374151" : "#E5E7EB",
                  }}
                  tickLine={{
                    stroke: theme === "dark" ? "#374151" : "#E5E7EB",
                  }}
                  interval="preserveStartEnd"
                  minTickGap={30}
                  angle={selectedTimeframe === "1D" ? 0 : -45}
                  height={60}
                  dy={20}
                />
                <YAxis
                  domain={["auto", "auto"]}
                  tick={{ fill: theme === "dark" ? "#9CA3AF" : "#4B5563" }}
                  axisLine={{
                    stroke: theme === "dark" ? "#374151" : "#E5E7EB",
                  }}
                  tickLine={{
                    stroke: theme === "dark" ? "#374151" : "#E5E7EB",
                  }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  content={({ active, payload }) => (
                    <CustomTooltip
                      active={active}
                      payload={payload as CustomTooltipProps["payload"]}
                    />
                  )}
                  cursor={{ stroke: theme === "dark" ? "#4B5563" : "#9CA3AF" }}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={trend === "up" ? "#10B981" : "#EF4444"}
                  fill={trend === "up" ? "#10B981" : "#EF4444"}
                  fillOpacity={0.1}
                />
                {showMA && (
                  <Line
                    type="monotone"
                    dataKey="ma20"
                    stroke="#60A5FA"
                    dot={false}
                    strokeWidth={2}
                  />
                )}
                {showVolume && (
                  <Bar
                    dataKey="volume"
                    fill={theme === "dark" ? "#374151" : "#E5E7EB"}
                    opacity={0.3}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <MarketAlert
            show={alert.show}
            onDismiss={() => setAlert((prev) => ({ ...prev, show: false }))}
            title={alert.title}
            message={alert.message}
            type={alert.type}
          />
        </div>
      </div>
    </div>
  );
};

export default StockSimulator;
