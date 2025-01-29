"use client";

import dynamic from "next/dynamic";

const StockSimulator = dynamic(() => import("@/components/StockSimulator"), {
  ssr: false,
});

export default function Home() {
  return (
    <div>
      <StockSimulator
        symbol="ECFM"
        companyName="EcoFuture Motors"
        description="Electric vehicles and sustainable transportation solutions"
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
