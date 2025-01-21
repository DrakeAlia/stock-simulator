"use client";

import React from "react";
import { AlertCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface MarketAlertProps {
  show: boolean;
  onDismiss: () => void;
  title: string;
  message: string;
  type: "info" | "warning" | "error";
}

const MarketAlert: React.FC<MarketAlertProps> = ({
  show,
  onDismiss,
  title,
  message,
  type,
}) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="fixed top-4 right-4 z-50 max-w-md"
      >
        <Alert
          className={`
            ${type === "warning" ? "border-yellow-500 bg-yellow-500/10" : ""}
            ${type === "error" ? "border-red-500 bg-red-500/10" : ""}
            ${type === "info" ? "border-blue-500 bg-blue-500/10" : ""}
          `}
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="ml-2">{title}</AlertTitle>
          <AlertDescription className="ml-2">{message}</AlertDescription>
          <button
            onClick={onDismiss}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </Alert>
      </motion.div>
    )}
  </AnimatePresence>
);

export default MarketAlert;