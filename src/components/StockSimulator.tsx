"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { Battery, Zap, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TooltipProps } from "recharts";
import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import ChartSettings from "./ChartSettings";
import { Badge } from "./ui/badge";
import MarketDetails from "./MarketDetails";
import { HelpCircle } from "lucide-react";
import TradingTutorial from "./TradingTutorial";
import MetricCard from "./MetricCard";
import MarketAlert from "./MarketAlert";

interface StockSimulatorProps {
  // Basic stock information
  symbol: string;
  companyName: string;
  description?: string;

  // Initial data and configuration
  initialPrice?: number;
  defaultTimeframe?: TimeFrame;
  defaultChartType?: "line" | "candle" | "area";

  // Customization options
  theme?: "dark" | "light";
  defaultShowTutorial: boolean;
  showNewsTicket?: boolean;
  customMetrics?: MetricConfig[];

  // Data sources and updates
  historicalDataProvider?: (timeframe: TimeFrame) => Promise<StockDataPoint[]>;
  realtimeDataProvider?: (symbol: string) => Promise<StockUpdate>;
  newsProvider?: () => Promise<NewsItem[]>;

  // Event handlers
  onPriceChange?: (price: number, trend: "up" | "down") => void;
  onTimeframeChange?: (timeframe: TimeFrame) => void;
  onThemeChange?: (theme: "dark" | "light") => void;
  onError?: (error: Error) => void;
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

interface StockUpdate {
  price: number;
  volume: number;
  timestamp: Date;
  change: number;
  changePercent: number;
}

interface NewsItem {
  title: string;
  content: string;
  timestamp: Date;
  sentiment?: "positive" | "negative" | "neutral";
  url?: string;
}

interface MetricConfig {
  title: string;
  description: string;
  value: number | string;
  formatter?: (value: number | string) => string;
  sparklineData?: number[];
  thresholds?: {
    warning?: number;
    critical?: number;
  };
}

interface MarketStatsProps {
  data: StockDataPoint[];
  theme: "dark" | "light";
  customMetrics?: MetricConfig[];
}

interface NewsTickerProps {
  theme: "dark" | "light";
  newsItems?: NewsItem[];
}

export interface ChartSettingsProps {
  showVolume: boolean;
  showMA: boolean;
  setShowVolume: (show: boolean) => void;
  setShowMA: (show: boolean) => void;
  chartStyle: ChartStyleType;
  setChartStyle: (style: ChartStyleType) => void;
}

interface CustomTooltipProps extends TooltipProps<ValueType, NameType> {
  theme: "dark" | "light";
}

interface ThemeStylesType {
  background: string;
  text: string;
  card: string;
  button: string;
  border: string;
}

interface ThemeStyles {
  dark: ThemeStylesType;
  light: ThemeStylesType;
}

type TimeFrame = "1D" | "1W" | "1M" | "1Y";

export type ChartStyleType = "line" | "candle" | "area";

export const themeStyles: ThemeStyles = {
  dark: {
    background: "bg-gray-900",
    text: "text-white",
    card: "bg-gray-800",
    button: "bg-gray-700",
    border: "border-gray-700",
  },
  light: {
    background: "bg-white",
    text: "text-gray-900",
    card: "bg-gray-100",
    button: "bg-gray-200",
    border: "border-gray-200",
  },
};

// Market Stats Component
const MarketStats: React.FC<MarketStatsProps> = ({
  data,
  theme,
  customMetrics = [],
}) => {
  const priceHistory = data.map((d) => d.price);
  const volumeHistory = data.map((d) => d.volume);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      <MetricCard
        title="Open"
        value={`$${data[0]?.price.toFixed(2)}`}
        description="Opening price for the current trading session"
        theme={theme}
        sparklineData={priceHistory.slice(0, 10)}
      />
      <MetricCard
        title="High"
        value={`$${Math.max(...data.map((d) => d.price)).toFixed(2)}`}
        description="Highest price reached during the session"
        theme={theme}
        sparklineData={priceHistory.slice(-10)}
      />
      <MetricCard
        title="Low"
        value={`$${Math.min(...data.map((d) => d.price)).toFixed(2)}`}
        description="Lowest price reached during the session"
        theme={theme}
        sparklineData={priceHistory.slice(-10)}
      />
      <MetricCard
        title="Volume"
        value={volumeHistory[volumeHistory.length - 1]?.toLocaleString()}
        description="Trading volume in the current session"
        theme={theme}
        sparklineData={volumeHistory.slice(-10)}
      />

      {/* Render custom metrics */}
      {customMetrics.map((metric, index) => (
        <MetricCard
          key={index}
          title={metric.title}
          value={
            metric.formatter ? metric.formatter(metric.value) : metric.value
          }
          description={metric.description}
          theme={theme}
          sparklineData={metric.sparklineData}
        />
      ))}
    </div>
  );
};

const NewsTicker: React.FC<NewsTickerProps & { symbol: string }> = ({
  theme,
  newsItems = [],
  symbol,
}) => (
  <div className={`${themeStyles[theme].card} p-2 mb-4 overflow-hidden`}>
    <div className="animate-scroll whitespace-nowrap">
      {newsItems.length > 0 ? (
        newsItems.map((item, index) => (
          <span
            key={index}
            className={`mr-4 ${
              item.sentiment === "positive"
                ? "text-green-500"
                : item.sentiment === "negative"
                ? "text-red-500"
                : "text-gray-400"
            }`}
          >
            {item.sentiment === "positive"
              ? "▲"
              : item.sentiment === "negative"
              ? "▼"
              : "•"}{" "}
            {item.title}
          </span>
        ))
      ) : (
        // Fallback content when no news items are provided
        <>
          <span className="text-green-500 mr-4">▲ {symbol} +2.3%</span>
          <span className="text-gray-400 mr-4">
            Market News: Trading active
          </span>
          <span className="text-red-500 mr-4">▼ Market volatility high</span>
        </>
      )}
    </div>
  </div>
);

const MemoizedCustomTooltip = React.memo(function CustomTooltip({
  active,
  payload,
  theme,
}: CustomTooltipProps) {
  if (active && payload?.[0]?.value) {
    return (
      <div
        className={`${themeStyles[theme].card} p-4 rounded-lg ${themeStyles[theme].border}`}
      >
        <p className="text-gray-300 text-lg">
          {payload[0].payload.displayTime}
        </p>
        <p className="text-white font-bold text-xl">
          ${Number(payload[0].value).toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
});

MemoizedCustomTooltip.displayName = "CustomTooltip";

const StockSimulator: React.FC<StockSimulatorProps> = ({
  symbol,
  companyName,
  description,
  initialPrice = 100,
  defaultTimeframe = "1D",
  defaultChartType = "area",
  theme: initialTheme = "dark",
  defaultShowTutorial = false,
  showNewsTicket = true,
  customMetrics = [],
  historicalDataProvider,
  realtimeDataProvider,
  newsProvider,
  onPriceChange,
  onTimeframeChange,
  onThemeChange,
  onError,
}): React.ReactElement => {
  const [mounted, setMounted] = useState(false);
  const [stockData, setStockData] = useState<StockDataPoint[]>([]);
  const [currentPrice, setCurrentPrice] = useState(initialPrice);
  const [trend, setTrend] = useState<"up" | "down">("up");
  const [showVolume, setShowVolume] = useState(false);
  const [showMA, setShowMA] = useState(false);
  const [theme, setTheme] = useState(initialTheme);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [selectedTimeframe, setSelectedTimeframe] =
    useState<TimeFrame>(defaultTimeframe);
  const [chartStyle, setChartStyle] =
    useState<ChartStyleType>(defaultChartType);
  const [alert, setAlert] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: "info" | "warning" | "error";
  }>({
    show: false,
    title: "",
    message: "",
    type: "info",
  });

  const lastPriceRef = useRef<number>(currentPrice);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const alertTimeoutRef = useRef<number | null>(null);

  // Update the tutorial state initialization
  const [showTutorial, setShowTutorial] = useState<boolean>(() => {
    if (typeof window === "undefined") {
      return defaultShowTutorial;
    }

    const hasSeenTutorial = localStorage.getItem("hasSeenTutorial");
    if (hasSeenTutorial === "true") {
      return false;
    }

    return defaultShowTutorial;
  });

  // Add this effect to handle prop changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasSeenTutorial = localStorage.getItem("hasSeenTutorial");
      if (!hasSeenTutorial) {
        setShowTutorial(defaultShowTutorial);
      }
    }
  }, [defaultShowTutorial]);

  const getDataPointsForTimeframe = useCallback(
    (timeframe: TimeFrame): number => {
      const points = {
        "1D": 24,
        "1W": 7,
        "1M": 30,
        "1Y": 12,
      };
      return points[timeframe];
    },
    []
  );

  const formatTimestamp = useCallback((date: Date, timeframe: TimeFrame) => {
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
        return date.toLocaleDateString([], { month: "short", day: "numeric" });
      case "1Y":
        return date.toLocaleDateString([], { month: "short", year: "2-digit" });
      default:
        return date.toLocaleString();
    }
  }, []);

  const showAlert = useCallback(
    (title: string, message: string, type: "info" | "warning" | "error") => {
      if (alertTimeoutRef.current) {
        clearTimeout(alertTimeoutRef.current);
      }
      setAlert({ show: true, title, message, type });
      alertTimeoutRef.current = setTimeout(() => {
        setAlert((prev) => ({ ...prev, show: false }));
      }, 5000) as unknown as number;
    },
    []
  );

  const generateSimulatedData = useCallback(
    (timeframe: TimeFrame) => {
      let basePrice = lastPriceRef.current;
      const newData: StockDataPoint[] = [];
      const now = new Date();

      const priceChange =
        ((basePrice - lastPriceRef.current) / lastPriceRef.current) * 100;

      if (Math.abs(priceChange) > 5) {
        showAlert(
          `Significant Price Movement`,
          `${symbol} stock has moved ${
            priceChange > 0 ? "up" : "down"
          } by ${Math.abs(priceChange).toFixed(2)}%`,
          priceChange > 0 ? "info" : "warning"
        );
      }

      // Configure data points and time intervals based on timeframe
      const config = {
        "1D": {
          points: 24,
          getDate: (i: number) => {
            const date = new Date(now);
            date.setHours(date.getHours() - (24 - i));
            return date;
          },
          volatility: 1,
        },
        "1W": {
          points: 7,
          getDate: (i: number) => {
            const date = new Date(now);
            date.setDate(date.getDate() - (7 - i));
            return date;
          },
          volatility: 2,
        },
        "1M": {
          points: 30,
          getDate: (i: number) => {
            const date = new Date(now);
            date.setDate(date.getDate() - (30 - i));
            return date;
          },
          volatility: 3,
        },
        "1Y": {
          points: 12,
          getDate: (i: number) => {
            const date = new Date(now);
            date.setMonth(date.getMonth() - (12 - i));
            return date;
          },
          volatility: 5,
        },
      }[timeframe];

      const generateVolume = () => Math.floor(Math.random() * 1000000);
      const calculateMA = (prices: number[], period: number) => {
        return prices.length >= period
          ? prices.slice(-period).reduce((a, b) => a + b) / period
          : undefined;
      };

      for (let i = 0; i < config.points; i++) {
        const timestamp = config.getDate(i);
        const volatility = (Math.random() * 8 - 4) * config.volatility;
        basePrice = Math.max(0, basePrice + volatility);

        newData.push({
          timestamp,
          displayTime: formatTimestamp(timestamp, timeframe),
          price: Number(basePrice.toFixed(2)),
          volume: generateVolume(),
          change: basePrice - lastPriceRef.current,
          changePercent:
            ((basePrice - lastPriceRef.current) / lastPriceRef.current) * 100,
        });
      }

      const prices = newData.map((d) => d.price);
      newData.forEach((point, i) => {
        point.ma20 = calculateMA(prices.slice(0, i + 1), 20);
      });

      setStockData(newData);
      setCurrentPrice(basePrice);
      setTrend(basePrice >= lastPriceRef.current ? "up" : "down");
      setBatteryLevel((prev) =>
        Math.max(0, Math.min(100, prev + (Math.random() * 10 - 5)))
      );

      lastPriceRef.current = basePrice;
    },
    [symbol, showAlert, formatTimestamp]
  );

  // Add these calls to notify parent component:
  const handleTimeframeChange = (newTimeframe: TimeFrame) => {
    setSelectedTimeframe(newTimeframe);
    onTimeframeChange?.(newTimeframe);
  };

  // Update price changes
  useEffect(() => {
    onPriceChange?.(currentPrice, trend);
  }, [currentPrice, trend, onPriceChange, initialPrice]);

  // Add this function to handle stock updates
  const updateStockData = useCallback(
    (update: StockUpdate) => {
      setStockData((prevData) => {
        const newData = [...prevData];
        newData.push({
          timestamp: update.timestamp,
          displayTime: formatTimestamp(update.timestamp, selectedTimeframe),
          price: update.price,
          volume: update.volume,
          change: update.change,
          changePercent: update.changePercent,
        });
        if (newData.length > getDataPointsForTimeframe(selectedTimeframe)) {
          newData.shift();
        }
        return newData;
      });
      setCurrentPrice(update.price);
      setTrend(update.change >= 0 ? "up" : "down");
    },
    [formatTimestamp, selectedTimeframe, getDataPointsForTimeframe] // Added getDataPointsForTimeframe
  );

  // Update the cleanup effect
  useEffect(() => {
    return () => {
      if (alertTimeoutRef.current) {
        clearTimeout(alertTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!newsProvider || !mounted) return;

    const fetchNews = async () => {
      try {
        const news = await newsProvider();
        setNewsItems(news);
      } catch (error) {
        onError?.(error as Error);
      }
    };

    fetchNews();
    const newsInterval = setInterval(fetchNews, 60000);

    return () => clearInterval(newsInterval);
  }, [mounted, newsProvider, onError]);

  // Custom fetch and update logic using providers
  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        if (historicalDataProvider) {
          const data = await historicalDataProvider(selectedTimeframe);
          setStockData(data);
        } else {
          generateSimulatedData(selectedTimeframe);
        }
      } catch (error) {
        onError?.(error as Error);
      }
    };

    fetchHistoricalData();
  }, [
    selectedTimeframe,
    historicalDataProvider,
    generateSimulatedData,
    onError,
  ]);

  const getUpdateInterval = useCallback((timeframe: TimeFrame): number => {
    const intervals: Record<TimeFrame, number> = {
      "1D": 2000,
      "1W": 5000,
      "1M": 10000,
      "1Y": 15000,
    };
    return intervals[timeframe];
  }, []);

  // Real-time updates
  useEffect(() => {
    if (!realtimeDataProvider || !mounted) return;

    const updateInterval = setInterval(async () => {
      try {
        const update = await realtimeDataProvider(symbol);
        updateStockData(update);
      } catch (error) {
        onError?.(error as Error);
      }
    }, getUpdateInterval(selectedTimeframe));

    // Cleanup
    return () => {
      if (updateInterval) {
        clearInterval(updateInterval);
      }
    };
  }, [
    mounted,
    realtimeDataProvider,
    symbol,
    selectedTimeframe,
    updateStockData,
    onError,
    getUpdateInterval,
  ]);

  // Theme handling
  const handleThemeChange = (newTheme: "dark" | "light") => {
    setTheme(newTheme);
    onThemeChange?.(newTheme);
  };

  useEffect(() => {
    setMounted(true);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;

    generateSimulatedData(selectedTimeframe); // Fixed function name

    const intervalTime = {
      "1D": 2000,
      "1W": 5000,
      "1M": 10000,
      "1Y": 15000,
    }[selectedTimeframe];

    intervalRef.current = setInterval(() => {
      generateSimulatedData(selectedTimeframe); // Fixed function name
    }, intervalTime);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [mounted, selectedTimeframe, generateSimulatedData]);

  return (
    <div
      className={`w-full min-h-screen ${themeStyles[theme].background} ${themeStyles[theme].text} p-2 sm:p-4 lg:p-8`}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {showNewsTicket && (
          <NewsTicker theme={theme} newsItems={newsItems} symbol={symbol} />
        )}

        {/* Header section - Made responsive */}
        <div className="flex items-center justify-between mb-6 sm:mb-10 px-2 sm:px-4">
          <motion.div className="flex items-center space-x-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              {symbol}
            </h1>
            <div className="flex flex-col">
              <span className="text-gray-400">{companyName}</span>
              {description && (
                <span className="text-sm text-gray-500">{description}</span>
              )}
            </div>
          </motion.div>

          <div className="flex items-center space-x-3 sm:space-x-6">
            <motion.div
              className="flex items-center"
              animate={{ opacity: batteryLevel > 20 ? 1 : 0.5 }}
            >
              <Battery className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3" />
              <span className="text-sm sm:text-xl">
                {batteryLevel.toFixed(1)}%
              </span>
            </motion.div>
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
            </motion.div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPrice}
                initial={{ opacity: 0, y: trend === "up" ? 20 : -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: trend === "up" ? -20 : 20 }}
                className="flex items-center space-x-3"
              >
                <span className="text-4xl font-bold">
                  ${currentPrice.toFixed(2)}
                </span>
                <span
                  className={`text-lg ${
                    trend === "up" ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {trend === "up" ? "+" : "-"}
                  {Math.abs(
                    stockData[stockData.length - 1]?.changePercent || 0
                  ).toFixed(2)}
                  %
                </span>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={trend === "up" ? "secondary" : "destructive"}>
              {selectedTimeframe}
            </Badge>
          </div>
        </div>

        {/* Chart section - Made responsive */}
        <motion.div
          className={`${themeStyles[theme].card} rounded-xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-10`}
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {/* Chart controls */}
          <div className="flex space-x-2 mb-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowVolume(!showVolume)}
              className={
                showVolume ? "bg-green-500" : themeStyles[theme].button
              }
            >
              Volume
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowMA(!showMA)}
              className={showMA ? "bg-green-500" : themeStyles[theme].button}
            >
              MA(20)
            </Button>
            {(["1D", "1W", "1M", "1Y"] as TimeFrame[]).map((tf) => (
              <Button
                key={tf}
                variant="secondary"
                size="sm"
                onClick={() => handleTimeframeChange(tf)} // Use handleTimeframeChange instead of setSelectedTimeframe
                className={
                  selectedTimeframe === tf
                    ? "bg-green-500"
                    : themeStyles[theme].button
                }
              >
                {tf}
              </Button>
            ))}
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                handleThemeChange(theme === "dark" ? "light" : "dark")
              }
              className={themeStyles[theme].button}
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTutorial(true)}
              className={themeStyles[theme].button}
            >
              <HelpCircle className="w-4 h-4" />
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

          <MarketStats data={stockData} theme={theme} />
          <MarketDetails theme={theme} />

          {/* Price chart */}
          <div className="h-64 sm:h-80 lg:h-96">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={stockData}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={trend === "up" ? "#10B981" : "#EF4444"}
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor={trend === "up" ? "#10B981" : "#EF4444"}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  stroke={theme === "dark" ? "#374151" : "#E5E7EB"}
                  opacity={0.2}
                  strokeDasharray="3 3"
                />
                <XAxis
                  dataKey="displayTime"
                  tick={{
                    fill: theme === "dark" ? "#9CA3AF" : "#4B5563",
                    fontSize: 12,
                  }}
                  axisLine={{
                    stroke: theme === "dark" ? "#374151" : "#E5E7EB",
                  }}
                  tickLine={{
                    stroke: theme === "dark" ? "#374151" : "#E5E7EB",
                  }}
                />
                <YAxis
                  yAxisId="price"
                  domain={["auto", "auto"]}
                  tick={{
                    fill: theme === "dark" ? "#9CA3AF" : "#4B5563",
                    fontSize: 12,
                  }}
                  axisLine={{
                    stroke: theme === "dark" ? "#374151" : "#E5E7EB",
                  }}
                  tickLine={{
                    stroke: theme === "dark" ? "#374151" : "#E5E7EB",
                  }}
                  tickFormatter={(value) => `$${value}`}
                />
                {showVolume && (
                  <YAxis
                    yAxisId="volume"
                    orientation="right"
                    tick={{
                      fill: theme === "dark" ? "#9CA3AF" : "#4B5563",
                      fontSize: 12,
                    }}
                    axisLine={{
                      stroke: theme === "dark" ? "#374151" : "#E5E7EB",
                    }}
                    tickLine={{
                      stroke: theme === "dark" ? "#374151" : "#E5E7EB",
                    }}
                  />
                )}
                <Tooltip
                  content={(props) => (
                    <MemoizedCustomTooltip {...props} theme={theme} />
                  )}
                />
                <Area
                  yAxisId="price"
                  type={chartStyle === "area" ? "monotone" : "linear"}
                  dataKey="price"
                  stroke={trend === "up" ? "#10B981" : "#EF4444"}
                  fill="url(#colorPrice)"
                  fillOpacity={chartStyle === "area" ? 1 : 0}
                />
                {showMA && (
                  <Line
                    yAxisId="price"
                    type="monotone"
                    dataKey="ma20"
                    stroke="#60A5FA"
                    dot={false}
                    strokeWidth={2}
                  />
                )}
                {showVolume && (
                  <Bar
                    yAxisId="volume"
                    dataKey="volume"
                    fill={theme === "dark" ? "#374151" : "#E5E7EB"}
                    opacity={0.3}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Metrics section - with updated theme */}

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {customMetrics.length > 0 ? (
            customMetrics.map((metric, index) => (
              <motion.div
                key={index}
                className={`${themeStyles[theme].card} rounded-xl p-4 sm:p-6 lg:p-8 text-center backdrop-blur-sm bg-opacity-90`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <h3 className="text-lg sm:text-xl mb-2 sm:mb-4">
                  {metric.title}
                </h3>
                <motion.div
                  className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${
                    metric.thresholds
                      ? typeof metric.value === "number" && metric.thresholds
                        ? metric.value > (metric.thresholds.critical || 0)
                          ? "text-red-500"
                          : metric.value > (metric.thresholds.warning || 0)
                          ? "text-yellow-500"
                          : "text-green-500"
                        : "text-green-500"
                      : "text-green-500"
                  }`}
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [1, 0.8, 1],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {metric.formatter
                    ? metric.formatter(metric.value)
                    : metric.value}
                </motion.div>
              </motion.div>
            ))
          ) : (
            // Fallback default metrics if none provided
            <MetricCard
              title="Market Status"
              value={trend === "up" ? "Bullish" : "Bearish"}
              description="Current market sentiment"
              theme={theme}
            />
          )}
        </motion.div>
      </motion.div>
      <AnimatePresence>
        {showTutorial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <TradingTutorial
              onComplete={() => {
                setShowTutorial(false);
                localStorage.setItem("hasSeenTutorial", "true");
              }}
              theme={theme}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <MarketAlert
        show={alert.show}
        onDismiss={() => setAlert((prev) => ({ ...prev, show: false }))}
        title={alert.title}
        message={alert.message}
        type={alert.type}
      />
    </div>
  );
};

// Add display names for components
NewsTicker.displayName = "NewsTicker";
MemoizedCustomTooltip.displayName = "CustomTooltip";
StockSimulator.displayName = "StockSimulator";

export default StockSimulator;
