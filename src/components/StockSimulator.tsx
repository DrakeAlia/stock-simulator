"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
} from "recharts";
import { TrendingUp, TrendingDown, Battery, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TooltipProps } from "recharts";
import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";

interface StockDataPoint {
  timestamp: Date;
  price: number;
  displayTime: string;
}

type TimeFrame = "1D" | "1W" | "1M" | "1Y";

const AnimatedPrice = ({ price, trend }: { price: number; trend: string }) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={price}
        initial={{ opacity: 0, y: trend === "up" ? 20 : -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: trend === "up" ? -20 : 20 }}
        transition={{ duration: 0.3 }}
        className="text-4xl font-bold md:text-3xl sm:text-2xl"
      >
        ${price.toFixed(2)}
      </motion.div>
    </AnimatePresence>
  );
};

const StockSimulator = () => {
  const [mounted, setMounted] = useState(false);
  const [stockData, setStockData] = useState<StockDataPoint[]>([]);
  const [currentPrice, setCurrentPrice] = useState(200);
  const [trend, setTrend] = useState("up");
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeFrame>("1D");

  const lastPriceRef = useRef<number>(currentPrice);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Format timestamp based on timeframe
  const formatTimestamp = (date: Date, timeframe: TimeFrame) => {
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
  };

  const generateDataForTimeframe = useCallback((timeframe: TimeFrame) => {
    let basePrice = lastPriceRef.current;
    const newData: StockDataPoint[] = [];
    const now = new Date();

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

    for (let i = 0; i < config.points; i++) {
      const timestamp = config.getDate(i);
      const volatility = (Math.random() * 8 - 4) * config.volatility;
      basePrice = Math.max(0, basePrice + volatility);

      newData.push({
        timestamp,
        displayTime: formatTimestamp(timestamp, timeframe),
        price: Number(basePrice.toFixed(2)),
      });
    }

    const finalPrice = newData[newData.length - 1].price;
    lastPriceRef.current = finalPrice;

    setStockData(newData);
    setCurrentPrice(finalPrice);
    setTrend(finalPrice >= basePrice ? "up" : "down");
    setBatteryLevel((prev) =>
      Math.max(0, Math.min(100, prev + (Math.random() * 10 - 5)))
    );
  }, []);

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

    generateDataForTimeframe(selectedTimeframe);

    const intervalTime = {
      "1D": 2000,
      "1W": 5000,
      "1M": 10000,
      "1Y": 15000,
    }[selectedTimeframe];

    intervalRef.current = setInterval(() => {
      generateDataForTimeframe(selectedTimeframe);
    }, intervalTime);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [mounted, selectedTimeframe, generateDataForTimeframe]);

  const CustomTooltip = ({
    active,
    payload,
  }: TooltipProps<ValueType, NameType>) => {
    if (active && payload?.[0]?.value) {
      return (
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
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
  };

  if (!mounted) return null;

  return (
    <div className="w-full min-h-screen bg-black p-2 sm:p-4 lg:p-8 text-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header section - Made responsive */}
        <div className="flex items-center justify-between mb-6 sm:mb-10 px-2 sm:px-4">
          <motion.h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            TSLA
          </motion.h1>
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

        {/* Chart section - Made responsive */}
        <motion.div
          className="bg-gray-900 rounded-xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-10"
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl lg:text-3xl">Current Price</h2>
            <motion.div
              className="flex items-center"
              animate={{ color: trend === "up" ? "#10B981" : "#EF4444" }}
            >
              {trend === "up" ? (
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3" />
              ) : (
                <TrendingDown className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3" />
              )}
              <AnimatedPrice price={currentPrice} trend={trend} />
            </motion.div>
          </div>

          {/* Timeframe selector - Made responsive */}
          <div className="flex space-x-2 sm:space-x-4 mb-4 sm:mb-6">
            {(["1D", "1W", "1M", "1Y"] as TimeFrame[]).map((timeframe) => (
              <Button
                key={timeframe}
                variant={
                  selectedTimeframe === timeframe ? "default" : "secondary"
                }
                className={`px-3 py-2 sm:px-6 sm:py-3 text-sm sm:text-lg rounded-lg ${
                  selectedTimeframe === timeframe
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
                onClick={() => setSelectedTimeframe(timeframe)}
              >
                {timeframe}
              </Button>
            ))}
          </div>

          {/* Chart - Made responsive height */}
          <div className="h-64 sm:h-80 lg:h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stockData}>
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
                  stroke="#374151"
                  opacity={0.2}
                  strokeDasharray="3 3"
                />
                <XAxis
                  dataKey="displayTime"
                  tick={{ fill: "#9CA3AF", fontSize: 12 }}
                  axisLine={{ stroke: "#374151" }}
                  tickLine={{ stroke: "#374151" }}
                  padding={{ left: 10, right: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={["auto", "auto"]}
                  tick={{ fill: "#9CA3AF", fontSize: 12 }}
                  axisLine={{ stroke: "#374151" }}
                  tickLine={{ stroke: "#374151" }}
                  tickFormatter={(value) => `$${value}`}
                  width={60}
                />
                <Tooltip content={CustomTooltip} />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={trend === "up" ? "#10B981" : "#EF4444"}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorPrice)"
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke={trend === "up" ? "#10B981" : "#EF4444"}
                  strokeWidth={3}
                  dot={false}
                  animateNewValues={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Metrics section - Made responsive */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {["Efficiency", "Innovation", "Sustainability"].map((metric) => (
            <motion.div
              key={metric}
              className="bg-gray-900 rounded-xl p-4 sm:p-6 lg:p-8 text-center backdrop-blur-sm bg-opacity-90"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <h3 className="text-lg sm:text-xl mb-2 sm:mb-4">{metric}</h3>
              <motion.div
                className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-500"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [1, 0.8, 1],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {Math.floor(Math.random() * 100)}%
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default StockSimulator;
