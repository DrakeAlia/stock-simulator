"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, Sun, Moon, Settings, X } from "lucide-react";

type ThemeType = "light" | "dark";

interface ThemeConfig {
  background: string;
  cardBg: string;
  text: string;
  subtext: string;
  border: string;
  chart: string;
}

const themes: Record<ThemeType, ThemeConfig> = {
  light: {
    background: "bg-gray-100",
    cardBg: "bg-white",
    text: "text-gray-800",
    subtext: "text-gray-600",
    border: "border-gray-200",
    chart: "#2563EB",
  },
  dark: {
    background: "bg-gray-900",
    cardBg: "bg-gray-800",
    text: "text-white",
    subtext: "text-gray-400",
    border: "border-gray-700",
    chart: "#60A5FA",
  },
};

interface StockDataPoint {
  time: number;
  price: number;
  volume: number;
}

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  theme: ThemeType;
}

interface TimeframeSelectorProps {
  timeframe: string;
  setTimeframe: (timeframe: string) => void;
  theme: ThemeType;
}

interface SettingsPanelProps {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  visible: boolean;
  onClose: () => void;
}

// Custom hook for data management
const useStockData = (initialPrice = 100) => {
  const [data, setData] = useState<StockDataPoint[]>([]);
  const [currentPrice, setCurrentPrice] = useState(initialPrice);
  const [trend, setTrend] = useState("up");
  const [timeframe, setTimeframe] = useState("1D"); // ['1H', '1D', '1W', '1M']

  useEffect(() => {
    const generateData = () => {
      const newPrice = currentPrice + (Math.random() * 10 - 5);
      const newData = [
        ...data.slice(-19),
        {
          time: Date.now(),
          price: Number(newPrice.toFixed(2)),
          volume: Math.floor(Math.random() * 10000),
        },
      ];

      setData(newData);
      setCurrentPrice(newPrice);
      setTrend(newPrice >= currentPrice ? "up" : "down");
    };

    if (data.length === 0) {
      const initialData = Array.from({ length: 20 }, (_, i) => ({
        time: Date.now() - (20 - i) * 1000,
        price: initialPrice,
        volume: Math.floor(Math.random() * 10000),
      }));
      setData(initialData);
    }

    const interval = setInterval(generateData, 2000);
    return () => clearInterval(interval);
  }, [currentPrice, data, timeframe]);

  return { data, currentPrice, trend, timeframe, setTimeframe };
};

const MetricCard = ({ title, value, change, theme }: MetricCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -5 }}
    className={`${themes[theme].cardBg} rounded-lg p-6 shadow-lg`}
  >
    <h3 className={`${themes[theme].subtext} mb-2`}>{title}</h3>
    <div className={`text-2xl font-bold ${themes[theme].text}`}>{value}</div>
    <div
      className={`text-sm ${change >= 0 ? "text-green-500" : "text-red-500"}`}
    >
      {change >= 0 ? "+" : ""}
      {change}%
    </div>
  </motion.div>
);

const TimeframeSelector = ({
  timeframe,
  setTimeframe,
  theme,
}: TimeframeSelectorProps) => {
  const options = ["1H", "1D", "1W", "1M"];
  return (
    <div className="flex space-x-2">
      {options.map((option) => (
        <motion.button
          key={option}
          whileTap={{ scale: 0.95 }}
          className={`px-3 py-1 rounded ${
            timeframe === option
              ? `${themes[theme].text} bg-blue-500`
              : `${themes[theme].text} ${themes[theme].cardBg}`
          }`}
          onClick={() => setTimeframe(option)}
        >
          {option}
        </motion.button>
      ))}
    </div>
  );
};

const SettingsPanel = ({
  theme,
  setTheme,
  visible,
  onClose,
}: SettingsPanelProps) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        className={`${themes[theme].cardBg} fixed right-0 top-0 h-full w-80 p-6 shadow-lg`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-xl font-bold ${themes[theme].text}`}>
            Settings
          </h2>
          <motion.button whileTap={{ scale: 0.95 }} onClick={onClose}>
            <X className={themes[theme].text} />
          </motion.button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className={`${themes[theme].subtext} mb-2`}>Theme</h3>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={`flex items-center space-x-2 ${themes[theme].text}`}
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
              <span>Switch to {theme === "dark" ? "Light" : "Dark"} Mode</span>
            </button>
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

const Dashboard = () => {
  const [theme, setTheme] = useState<ThemeType>("dark");
  const { data, currentPrice, trend, timeframe, setTimeframe } = useStockData();
  const [settingsVisible, setSettingsVisible] = useState(false);

  return (
    <div
      className={`min-h-screen ${themes[theme].background} ${themes[theme].text} p-8 transition-colors duration-200`}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold mb-2">Market Dashboard</h1>
            <p className={themes[theme].subtext}>
              Real-time market visualization
            </p>
          </div>

          <motion.button
            whileHover={{ rotate: 90 }}
            transition={{ type: "spring" }}
            onClick={() => setSettingsVisible(true)}
          >
            <Settings className="w-6 h-6" />
          </motion.button>
        </motion.div>

        {/* Main Chart Section */}
        <motion.div
          className={`${themes[theme].cardBg} rounded-lg p-6 mb-8 shadow-lg`}
          whileHover={{ scale: 1.01 }}
        >
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl">Market Price</h2>
              <TimeframeSelector
                timeframe={timeframe}
                setTimeframe={setTimeframe}
                theme={theme}
              />
            </div>
            <div className="flex items-center">
              {trend === "up" ? (
                <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-500 mr-2" />
              )}
              <span className="text-2xl font-bold">
                ${currentPrice.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <XAxis
                  dataKey="time"
                  tickFormatter={(time) => new Date(time).toLocaleTimeString()}
                  stroke={themes[theme].subtext}
                />
                <YAxis
                  domain={["auto", "auto"]}
                  stroke={themes[theme].subtext}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: themes[theme].cardBg }}
                  labelStyle={{ color: themes[theme].text }}
                  labelFormatter={(time) => new Date(time).toLocaleTimeString()}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke={themes[theme].chart}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="Daily Volume"
            value="127.4K"
            change={5.2}
            theme={theme}
          />
          <MetricCard
            title="Market Cap"
            value="$4.2B"
            change={-2.1}
            theme={theme}
          />
          <MetricCard
            title="Active Traders"
            value="892K"
            change={12.5}
            theme={theme}
          />
        </div>
      </div>

      <SettingsPanel
        theme={theme}
        setTheme={setTheme}
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
      />
    </div>
  );
};

export default Dashboard;
