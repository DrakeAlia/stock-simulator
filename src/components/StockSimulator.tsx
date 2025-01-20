"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, Battery, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StockDataPoint {
  time: number;
  price: number;
  volume?: number;
  timestamp?: Date;
}

type TimeFrame = "1D" | "1W" | "1M" | "1Y";

const StockSimulator = () => {
  const [mounted, setMounted] = useState(false);
  const [stockData, setStockData] = useState<StockDataPoint[]>([]);
  const [currentPrice, setCurrentPrice] = useState(200);
  const [trend, setTrend] = useState("up");
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeFrame>("1D");

  const lastPriceRef = useRef<number>(currentPrice);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Function to generate data based on timeframe
  const generateDataForTimeframe = (timeframe: TimeFrame) => {
    let basePrice = lastPriceRef.current;
    const newData: StockDataPoint[] = [];

    // Configure data points based on timeframe
    const dataPoints = {
      "1D": 24, // Hourly for a day
      "1W": 7, // Daily for a week
      "1M": 30, // Daily for a month
      "1Y": 12, // Monthly for a year
    }[timeframe];

    // Adjust volatility based on timeframe
    const volatilityFactor = {
      "1D": 1,
      "1W": 2,
      "1M": 3,
      "1Y": 5,
    }[timeframe];

    for (let i = 0; i < dataPoints; i++) {
      const volatility = (Math.random() * 8 - 4) * volatilityFactor;
      basePrice = Math.max(0, basePrice + volatility);
      newData.push({
        time: i,
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

    // Initial data generation
    generateDataForTimeframe(selectedTimeframe);

    // Update interval based on timeframe
    const intervalTime = {
      "1D": 2000, // Update every 2 seconds for day view
      "1W": 5000, // Update every 5 seconds for week view
      "1M": 10000, // Update every 10 seconds for month view
      "1Y": 15000, // Update every 15 seconds for year view
    }[selectedTimeframe];

    intervalRef.current = setInterval(() => {
      generateDataForTimeframe(selectedTimeframe);
    }, intervalTime);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [mounted, selectedTimeframe]);

  if (!mounted) return null;

  return (
    <div className="w-full h-screen bg-black p-8 text-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="flex items-center justify-between mb-8">
          <motion.h1
            className="text-4xl font-bold"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            TSLA
          </motion.h1>
          <div className="flex items-center space-x-4">
            <motion.div
              className="flex items-center"
              animate={{ opacity: batteryLevel > 20 ? 1 : 0.5 }}
            >
              <Battery className="w-6 h-6 mr-2" />
              <span>{batteryLevel.toFixed(1)}%</span>
            </motion.div>
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Zap className="w-6 h-6 text-yellow-400" />
            </motion.div>
          </div>
        </div>

        <motion.div
          className="bg-gray-900 rounded-xl p-6 mb-8"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl">Current Price</h2>
            <motion.div
              className="flex items-center"
              animate={{ color: trend === "up" ? "#10B981" : "#EF4444" }}
            >
              {trend === "up" ? (
                <TrendingUp className="w-6 h-6 mr-2" />
              ) : (
                <TrendingDown className="w-6 h-6 mr-2" />
              )}
              <span className="text-3xl font-bold">
                ${currentPrice.toFixed(2)}
              </span>
            </motion.div>
          </div>

          {/* Timeframe selector */}
          <div className="flex space-x-2 mb-4">
            {(["1D", "1W", "1M", "1Y"] as TimeFrame[]).map((timeframe) => (
              <Button
                key={timeframe}
                variant={
                  selectedTimeframe === timeframe ? "default" : "secondary"
                }
                className={`px-4 py-2 rounded-lg ${
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

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stockData}>
                <XAxis dataKey="time" hide />
                <YAxis domain={["auto", "auto"]} hide />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1F2937", border: "none" }}
                  labelStyle={{ color: "#9CA3AF" }}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke={trend === "up" ? "#10B981" : "#EF4444"}
                  strokeWidth={2}
                  dot={false}
                  animateNewValues={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          className="grid grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {["Efficiency", "Innovation", "Sustainability"].map((metric) => (
            <motion.div
              key={metric}
              className="bg-gray-900 rounded-xl p-6 text-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <h3 className="text-lg mb-2">{metric}</h3>
              <motion.div
                className="text-3xl font-bold text-green-500"
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