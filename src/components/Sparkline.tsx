"use client";

import React from "react";
import { Line, LineChart, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

interface SparklineProps {
  data: number[];
  color: string;
}

const Sparkline: React.FC<SparklineProps> = ({ data, color }) => {
  const sparkData = data.map((value, index) => ({ value, index }));

  return (
    <motion.div
      className="h-8 w-16"
      initial={{ opacity: 0, scaleX: 0 }}
      animate={{ opacity: 1, scaleX: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={sparkData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            dot={false}
            strokeWidth={1.5}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default Sparkline;
