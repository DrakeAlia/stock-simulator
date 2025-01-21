// components/TradingTutorial.tsx
import React, { useMemo, useState } from "react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import useMeasure from "react-use-measure";
import { themeStyles } from "./StockSimulator";
import { Settings, Zap, ChartLine, ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";

interface TradingTutorialProps {
  onComplete: () => void;
  theme: "dark" | "light";
}

const TutorialVariants = {
  initial: (direction: number) => ({
    x: `${110 * direction}%`,
    opacity: 0,
  }),
  active: {
    x: "0%",
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: `${-110 * direction}%`,
    opacity: 0,
  }),
};

const TradingTutorial: React.FC<TradingTutorialProps> = ({
  onComplete,
  theme,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [ref, bounds] = useMeasure();

  const content = useMemo(() => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">
              Welcome to TSLA Stock Simulator
            </h2>
            <p className="text-gray-400">
              Experience real-time stock tracking and analysis with our advanced
              tools.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className={`${themeStyles[theme].card} p-4 rounded-lg`}>
                <ChartLine className="w-8 h-8 mb-2 text-green-500" />
                <h3 className="text-lg font-semibold">Live Charts</h3>
                <p className="text-sm text-gray-400">
                  Track price movements in real-time
                </p>
              </div>
              <div className={`${themeStyles[theme].card} p-4 rounded-lg`}>
                <Zap className="w-8 h-8 mb-2 text-yellow-400" />
                <h3 className="text-lg font-semibold">Market Stats</h3>
                <p className="text-sm text-gray-400">
                  View key performance metrics
                </p>
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Powerful Chart Controls</h2>
            <p className="text-gray-400">
              Customize your analysis with advanced indicators.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className={`${themeStyles[theme].card} p-4 rounded-lg`}>
                <h3 className="text-lg font-semibold">Volume Indicator</h3>
                <p className="text-sm text-gray-400">
                  Track trading volume patterns
                </p>
              </div>
              <div className={`${themeStyles[theme].card} p-4 rounded-lg`}>
                <h3 className="text-lg font-semibold">Moving Averages</h3>
                <p className="text-sm text-gray-400">Identify price trends</p>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Chart Settings</h2>
            <p className="text-gray-400">
              Customize your chart view with our settings panel.
            </p>
            <div className="flex items-center space-x-4">
              <Settings className="w-8 h-8 text-blue-500" />
              <div>
                <h3 className="text-lg font-semibold">Advanced Controls</h3>
                <p className="text-sm text-gray-400">
                  Access time zones, chart styles, and more
                </p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  }, [currentStep, theme]);

  return (
    <MotionConfig transition={{ duration: 0.5, type: "spring", bounce: 0 }}>
      <motion.div
        animate={{ height: bounds.height }}
        className={`${themeStyles[theme].card} rounded-xl p-6 mx-auto max-w-2xl relative`}
      >
        <div ref={ref}>
          <AnimatePresence mode="popLayout" initial={false} custom={direction}>
            <motion.div
              key={currentStep}
              variants={TutorialVariants}
              initial="initial"
              animate="active"
              exit="exit"
              custom={direction}
            >
              {content}
            </motion.div>
          </AnimatePresence>

          <motion.div layout className="flex justify-between mt-8 items-center">
            <Button
              variant="secondary"
              size="lg"
              disabled={currentStep === 0}
              onClick={() => {
                setDirection(-1);
                setCurrentStep((prev) => prev - 1);
              }}
              className={`flex items-center space-x-2 ${
                currentStep === 0
                  ? "opacity-50"
                  : "opacity-100 hover:bg-gray-700"
              } bg-gray-800 text-white border border-gray-600`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
            <Button
              size="lg"
              onClick={() => {
                if (currentStep === 2) {
                  onComplete();
                  return;
                }
                setDirection(1);
                setCurrentStep((prev) => prev + 1);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
            >
              {currentStep === 2 ? "Get Started" : "Continue"}
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </MotionConfig>
  );
};

export default TradingTutorial;
