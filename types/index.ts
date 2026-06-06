export type PositionType = "LONG" | "SHORT";

export interface CalculatorInputs {
  position: PositionType;
  accountBalance: number;
  riskPercentage: number;
  entryPrice: number;
  stopLoss: number;
  leverage: number;
  rrTargets: number[];
}

export interface TakeProfitTarget {
  rr: number;
  price: number;
  profit: number;
  rating: "Poor" | "Good" | "Excellent";
}

export interface CalculatorResults {
  riskMoney: number;
  stopLossPercentage: number;
  positionSize: number;
  requiredMargin: number;
  riskDistance: number;
  takeProfits: TakeProfitTarget[];
}
