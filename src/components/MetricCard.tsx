"use client";

import React from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Info } from "lucide-react";
import { motion } from "framer-motion";
import Sparkline from "./Sparkline";

interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
  theme: "dark" | "light";
  sparklineData?: number[];
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  description,
  theme,
  sparklineData = [],
}) => (
  <HoverCard>
    <HoverCardTrigger asChild>
      <motion.div
        className="relative cursor-help"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <div className="absolute top-2 right-2">
          <Info className="w-4 h-4 text-gray-400" />
        </div>
        <div
          className={`p-4 rounded-lg ${
            theme === "dark" ? "bg-gray-800" : "bg-gray-100"
          }`}
        >
          <h3 className="text-sm text-gray-400">{title}</h3>
          <div className="flex items-center justify-between mt-1">
            <p className="text-lg font-bold">{value}</p>
            {sparklineData.length > 0 && (
              <Sparkline
                data={sparklineData}
                color={theme === "dark" ? "#60A5FA" : "#3B82F6"}
              />
            )}
          </div>
        </div>
      </motion.div>
    </HoverCardTrigger>
    <HoverCardContent
      className={`w-80 ${
        theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white"
      }`}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">{title}</h4>
          {sparklineData.length > 0 && (
            <span
              className={`text-xs ${
                sparklineData[sparklineData.length - 1] > sparklineData[0]
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {sparklineData[sparklineData.length - 1] > sparklineData[0]
                ? "↑"
                : "↓"}
              {Math.abs(
                ((sparklineData[sparklineData.length - 1] - sparklineData[0]) /
                  sparklineData[0]) *
                  100
              ).toFixed(2)}
              %
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </HoverCardContent>
  </HoverCard>
);

export default MetricCard;
