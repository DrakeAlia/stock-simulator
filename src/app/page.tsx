"use client";

import dynamic from "next/dynamic";

const StockSimulator = dynamic(() => import("@/components/StockSimulator"), {
  ssr: false,
});

export default function Home() {
  return (
    <div>
      <StockSimulator
        symbol="TSLA"
        companyName="Tesla, Inc."
        description="Electric vehicles and clean energy company"
        initialPrice={250.5}
        theme="dark"
        defaultShowTutorial={true}
        customMetrics={[
          {
            title: "Market Cap",
            value: 857.4,
            description: "Market Capitalization in Billions",
            formatter: (value: number) => `$${value}B`,
          },
        ]}
      />
    </div>
  );
}
