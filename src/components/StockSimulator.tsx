"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { themeStyles } from "@/lib/theme";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  ComposedChart,
} from "recharts";
import { Sun, Moon, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChartSkeleton from "@/components/ChartSkeleton";
import MarketAlert from "./MarketAlert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: {
      displayTime: string;
      price: number;
      volume: number;
      change?: number;
      changePercent?: number;
      ma20?: number;
    };
  }>;
}

interface AlertState {
  show: boolean;
  title: string;
  message: string;
  type: "info" | "warning" | "error";
}

const CustomTooltip: React.FC<TooltipProps> = ({ active, payload }) => {
  if (active && payload?.[0]) {
    const data = payload[0].payload;
    const isPositive = (data.change || 0) >= 0;

    return (
      <div className="bg-black/90 px-4 py-3 rounded-lg shadow-lg min-w-[200px]">
        <p className="text-gray-400 text-sm border-b border-gray-700 pb-2 mb-2">
          {data.displayTime}
        </p>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Price</span>
            <span className="text-white text-lg font-bold">
              ${Number(data.price).toFixed(2)}
            </span>
          </div>
          {typeof data.change !== "undefined" && (
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Change</span>
              <span
                className={`${isPositive ? "text-green-500" : "text-red-500"}`}
              >
                {isPositive ? "+" : ""}
                {data.change.toFixed(2)} ({data.changePercent?.toFixed(2)}%)
              </span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Volume</span>
            <span className="text-gray-200">
              {data.volume.toLocaleString()}
            </span>
          </div>
          {data.ma20 && (
            <div className="flex justify-between items-center">
              <span className="text-gray-400">MA20</span>
              <span className="text-blue-400">${data.ma20.toFixed(2)}</span>
            </div>
          )}
        </div>
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
        hour12: false,
      });
    case "1W":
    case "1M":
      return date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      });
    case "3M":
    case "1Y":
      return `${date.toLocaleDateString([], {
        month: "short",
      })} ${date.getFullYear()}`;
    case "5Y":
      return date.getFullYear().toString();
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
  theme: initialTheme = "dark",
  onTimeframeChange,
  onThemeChange,
}) => {
  const [volume] = useState(Math.floor(Math.random() * 1000000));
  const [stockData, setStockData] = useState<StockDataPoint[]>([]);
  const [currentPrice, setCurrentPrice] = useState(initialPrice);
  const [trend, setTrend] = useState<"up" | "down">("up");
  const [theme, setTheme] = useState(initialTheme);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] =
    useState<TimeFrame>(defaultTimeframe);
  const [alert, setAlert] = useState<AlertState>({
    show: false,
    title: "",
    message: "",
    type: "info",
  });

  const currentPriceRef = useRef(initialPrice);
  const timeframeRef = useRef(defaultTimeframe);

  const generateNewPrice = useCallback(
    (currentPrice: number, timeframe: TimeFrame): number => {
      const volatilityMap = {
        "1D": 0.0002,
        "1W": 0.0005,
        "1M": 0.001,
        "3M": 0.002,
        "1Y": 0.003,
        "5Y": 0.005,
      };

      const baseVolatility = volatilityMap[timeframe];
      const randomFactor = Math.random() * 2 - 1;
      const change = currentPrice * baseVolatility * randomFactor;

      // Adjust mean reversion based on timeframe
      const meanReversionMap = {
        "1D": 0.001,
        "1W": 0.002,
        "1M": 0.005,
        "3M": 0.01,
        "1Y": 0.02,
        "5Y": 0.03,
      };

      const meanPrice = initialPrice;
      const meanReversionFactor = meanReversionMap[timeframe];
      const meanReversion = (meanPrice - currentPrice) * meanReversionFactor;

      const newPrice = currentPrice + change + meanReversion;
      return Math.max(0, Number(newPrice.toFixed(2)));
    },
    [initialPrice]
  );

  const generateDataPoints = useCallback(
    (
      timeframe: TimeFrame,
      currentPrice: number,
      now: Date = new Date()
    ): StockDataPoint[] => {
      const pointsMap = {
        "1D": { points: 24, interval: 60 }, // Every hour
        "1W": { points: 7, interval: 24 * 60 }, // Daily
        "1M": { points: 30, interval: 24 * 60 }, // Daily
        "3M": { points: 90, interval: 24 * 60 }, // Daily
        "1Y": { points: 365, interval: 24 * 60 }, // Daily
        "5Y": { points: 60, interval: 30 * 24 * 60 }, // Monthly
      };

      const { points, interval } = pointsMap[timeframe];
      const newData: StockDataPoint[] = [];
      let basePrice = currentPrice;

      for (let i = points - 1; i >= 0; i--) {
        const timestamp = new Date(now);
        timestamp.setMinutes(timestamp.getMinutes() - i * interval);

        // Generate more realistic price movements
        basePrice = generateNewPrice(basePrice, timeframe);

        newData.push({
          timestamp,
          displayTime: formatDateByTimeframe(timestamp, timeframe),
          price: basePrice,
          volume: Math.floor(Math.random() * 1000000),
          change: basePrice - currentPrice,
          changePercent: ((basePrice - currentPrice) / currentPrice) * 100,
        });
      }

      return newData;
    },
    [generateNewPrice]
  );

  const generateSimulatedData = useCallback(
    (timeframe: TimeFrame, basePrice: number) => {
      setIsLoading(true);
      const newData = generateDataPoints(timeframe, basePrice);
      const lastPrice = newData[newData.length - 1]?.price ?? basePrice;

      setCurrentPrice(lastPrice);
      currentPriceRef.current = lastPrice;

      setStockData(newData);
      setTrend(lastPrice >= basePrice ? "up" : "down");
      setIsLoading(false);
    },
    [generateDataPoints]
  );

  useEffect(() => {
    // Initial data generation
    const initialData = generateDataPoints(
      timeframeRef.current,
      currentPriceRef.current
    );
    setStockData(initialData);
    setIsLoading(false);

    // Update more frequently (every 10 seconds instead of every minute)
    const interval = setInterval(() => {
      const now = new Date();
      const newPrice = generateNewPrice(
        currentPriceRef.current,
        timeframeRef.current
      );
      currentPriceRef.current = newPrice;

      setCurrentPrice(newPrice);
      setStockData((prevData) => {
        const newData = [
          ...prevData.slice(1),
          {
            timestamp: now,
            displayTime: formatDateByTimeframe(now, timeframeRef.current),
            price: newPrice,
            volume: Math.floor(Math.random() * 1000000),
            change: newPrice - prevData[0].price,
            changePercent:
              ((newPrice - prevData[0].price) / prevData[0].price) * 100,
          },
        ];

        setTrend(
          newPrice >= prevData[prevData.length - 1].price ? "up" : "down"
        );
        return newData;
      });
    }, 1000);

    intervalRef.current = interval;

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [generateDataPoints, generateNewPrice]);

  const handleTimeframeChange = (newTimeframe: TimeFrame) => {
    setIsLoading(true);
    setSelectedTimeframe(newTimeframe);
    timeframeRef.current = newTimeframe;

    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Generate new data with a slight delay
    setTimeout(() => {
      generateSimulatedData(newTimeframe, currentPriceRef.current);

      // Adjust update frequency based on timeframe
      const updateInterval = newTimeframe === "1D" ? 1000 : 5000;

      intervalRef.current = setInterval(() => {
        generateSimulatedData(timeframeRef.current, currentPriceRef.current);
      }, updateInterval);
    }, 300);

    onTimeframeChange?.(newTimeframe);
  };

  const handleThemeChange = (newTheme: "dark" | "light") => {
    setTheme(newTheme);
    if (onThemeChange) {
      onThemeChange(newTheme);
    }
  };

  return (
    <div
      className={`w-full min-h-screen ${themeStyles[theme].background} ${themeStyles[theme].text} p-2 sm:p-4`}
    >
      <div className="max-w-7xl mx-auto">
        {/* header section */}
        <div className="mb-4 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              {/* Make heading text responsive */}
              <h1 className="text-3xl sm:text-5xl font-bold mb-1">{symbol}</h1>
              <span className="text-gray-400 text-sm sm:text-base">
                {companyName}
              </span>
            </div>
            <div className="mt-2 sm:mt-0 flex flex-col sm:items-end">
              <span className="text-xl sm:text-2xl font-bold">
                ${currentPrice.toFixed(2)}
              </span>
              <span
                className={`text-base sm:text-lg ${
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
          {description && (
            <span className="text-xs sm:text-sm text-gray-500 mt-2 block">
              {description}
            </span>
          )}
        </div>

        {/* chart card section */}
        <div
          className={`${themeStyles[theme].card} rounded-xl p-3 sm:p-6 mb-4 sm:mb-6`}
        >
          {/* mobile timeframe dropdown */}
          <div className="sm:hidden mb-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between h-9 px-3 text-sm font-medium bg-gray-800/50 border-gray-700 hover:bg-gray-700/50"
                >
                  <span className="text-gray-100">{selectedTimeframe}</span>
                  <ChevronDown className="h-4 w-4 ml-2 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full bg-gray-800 border-gray-700">
                {["1D", "1W", "1M", "3M", "1Y", "5Y"].map((tf) => (
                  <DropdownMenuItem
                    key={tf}
                    onClick={() => handleTimeframeChange(tf as TimeFrame)}
                    className="text-gray-100 hover:bg-gray-700/50 hover:text-white focus:bg-gray-700/50 focus:text-white"
                  >
                    {tf}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {/* desktop timeframe buttons to hide on mobile */}
          <div className="hidden sm:flex justify-between items-center mb-6">
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
          </div>

          <div className="sm:hidden mt-4 flex justify-end">
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
          </div>
          {/* MarketDetails component */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4 mb-4 sm:mb-6">
            <MetricCard
              title="24h Volume"
              value={volume.toLocaleString(undefined, {
                style: "currency",
                currency: "USD",
                notation: "compact",
                maximumFractionDigits: 1,
              })}
              theme={theme}
            />
            <MetricCard title="Market Cap" value="$724.5B" theme={theme} />
            <MetricCard title="P/E Ratio" value="70.5" theme={theme} />
            <MetricCard
              title="52W Range"
              value="$101.81 - $299.29"
              theme={theme}
            />
          </div>
          {/* Chart */}
          {isLoading ? (
            <ChartSkeleton theme={theme} />
          ) : (
            <div className="h-64 sm:h-96">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={stockData}
                  margin={{
                    top: 5,
                    right: 10,
                    left: 5,
                    bottom: 20,
                  }}
                >
                  <CartesianGrid
                    stroke={theme === "dark" ? "#374151" : "#E5E7EB"}
                    opacity={0.1} // Reduce grid opacity
                    vertical={true}
                    horizontal={true}
                    strokeDasharray="3 3" // Add dashed lines like TradingView
                  />

                  <XAxis
                    dataKey="displayTime"
                    tick={{
                      fill: theme === "dark" ? "#9CA3AF" : "#4B5563",
                      fontSize: "0.7rem",
                    }}
                    interval="preserveStartEnd"
                    minTickGap={30}
                    height={30}
                    dy={10}
                    axisLine={{
                      stroke: theme === "dark" ? "#374151" : "#E5E7EB",
                      opacity: 0.2,
                    }}
                  />

                  <YAxis
                    domain={["auto", "auto"]}
                    tick={{
                      fill: theme === "dark" ? "#9CA3AF" : "#4B5563",
                      fontSize: "0.7rem",
                    }}
                    axisLine={{
                      stroke: theme === "dark" ? "#374151" : "#E5E7EB",
                      opacity: 0.2,
                    }}
                    tickLine={false}
                    tickCount={8}
                    tickFormatter={(value) => `$${value.toFixed(2)}`}
                  />
                  <Tooltip
                    content={({ active, payload }) => (
                      <CustomTooltip
                        active={active}
                        payload={payload as TooltipProps["payload"]}
                      />
                    )}
                    cursor={{
                      stroke: theme === "dark" ? "#4B5563" : "#9CA3AF",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke={trend === "up" ? "#10B981" : "#EF4444"}
                    strokeWidth={2}
                    fill={trend === "up" ? "#10B981" : "#EF4444"}
                    fillOpacity={0.1}
                    connectNulls
                    dot={false}
                    isAnimationActive={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
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

interface MetricCardProps {
  title: string;
  value: string | number;
  theme: "dark" | "light";
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, theme }) => (
  <div
    className={`p-2 sm:p-4 rounded-lg ${
      theme === "dark" ? "bg-gray-800/50" : "bg-gray-100"
    }`}
  >
    <h3 className="text-xs sm:text-sm text-gray-400 mb-1">{title}</h3>
    <p className="text-sm sm:text-base font-semibold">{value}</p>
  </div>
);

export default StockSimulator;
