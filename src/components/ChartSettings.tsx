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
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Chart Settings</SheetTitle>
        </SheetHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Indicators</h4>
            <div className="flex items-center justify-between">
              <span>Show Volume</span>
              <Switch checked={showVolume} onCheckedChange={setShowVolume} />
            </div>
            <div className="flex items-center justify-between">
              <span>Show Moving Average</span>
              <Switch checked={showMA} onCheckedChange={setShowMA} />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Chart Style</h4>
            <Select value={chartStyle} onValueChange={setChartStyle}>
              <SelectTrigger>
                <SelectValue placeholder="Select chart style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">Line</SelectItem>
                <SelectItem value="candle">Candlestick</SelectItem>
                <SelectItem value="area">Area</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Time Zone</h4>
            <Select defaultValue="local">
              <SelectTrigger>
                <SelectValue placeholder="Select time zone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="local">Local Time</SelectItem>
                <SelectItem value="et">Eastern Time</SelectItem>
                <SelectItem value="utc">UTC</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ChartSettings;
