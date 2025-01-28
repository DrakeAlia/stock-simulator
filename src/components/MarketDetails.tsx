import React from "react";
import { themeStyles } from "@/lib/theme";

interface MarketDetailsProps {
  theme: "dark" | "light";
}

const MarketDetails: React.FC<MarketDetailsProps> = ({ theme }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
    <div className={`${themeStyles[theme].card} p-4 rounded-lg`}>
      <span className="text-gray-400 block">24h Volume</span>
      <span className="font-bold block mt-1">
        $
        {(Math.random() * 1000000000).toLocaleString(undefined, {
          maximumFractionDigits: 0,
        })}
      </span>
    </div>

    <div className={`${themeStyles[theme].card} p-4 rounded-lg`}>
      <span className="text-gray-400 block">Market Cap</span>
      <span className="font-bold block mt-1">$724.5B</span>
    </div>
    <div className={`${themeStyles[theme].card} p-4 rounded-lg`}>
      <span className="text-gray-400 block">P/E Ratio</span>
      <span className="font-bold block mt-1">70.5</span>
    </div>
    <div className={`${themeStyles[theme].card} p-4 rounded-lg`}>
      <span className="text-gray-400 block">52W Range</span>
      <span className="font-bold block mt-1">$101.81 - $299.29</span>
    </div>
  </div>
);

export default MarketDetails;
