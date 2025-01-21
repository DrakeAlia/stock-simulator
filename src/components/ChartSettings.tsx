"use client";

import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ChartSettingsProps {
  showVolume: boolean;
  showMA: boolean;
  setShowVolume: (show: boolean) => void;
  setShowMA: (show: boolean) => void;
  chartStyle: string;
  setChartStyle: (style: string) => void;
}

const ChartSettings: React.FC<ChartSettingsProps> = ({
  showVolume,
  showMA,
  setShowVolume,
  setShowMA,
  chartStyle,
  setChartStyle,
}) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm">
          <Settings className="w-4 h-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="backdrop-blur-2xl bg-gray-900/70 border-gray-800">
        <SheetHeader>
          <SheetTitle className="text-white">Chart Settings</SheetTitle>
        </SheetHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-200">Indicators</h4>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Show Volume</span>
              <Switch checked={showVolume} onCheckedChange={setShowVolume} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Show Moving Average</span>
              <Switch checked={showMA} onCheckedChange={setShowMA} />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-200">Chart Style</h4>
            <Select value={chartStyle} onValueChange={setChartStyle}>
              <SelectTrigger className="bg-gray-800/50 border-gray-700 text-gray-200">
                <SelectValue placeholder="Select chart style" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="line" className="text-gray-200">
                  Line
                </SelectItem>
                <SelectItem value="candle" className="text-gray-200">
                  Candlestick
                </SelectItem>
                <SelectItem value="area" className="text-gray-200">
                  Area
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-200">Time Zone</h4>
            <Select defaultValue="local">
              <SelectTrigger className="bg-gray-800/50 border-gray-700 text-gray-200">
                <SelectValue placeholder="Select time zone" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="local" className="text-gray-200">
                  Local Time
                </SelectItem>
                <SelectItem value="et" className="text-gray-200">
                  Eastern Time
                </SelectItem>
                <SelectItem value="utc" className="text-gray-200">
                  UTC
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ChartSettings;