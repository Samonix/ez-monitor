export type RevenueInput = { amount: number; volume: number };
export type RevenueSummary = { amount: number; volume: number; transactions: number };

export function calculateRevenueSummary(rows: RevenueInput[]): RevenueSummary {
  return rows.reduce<RevenueSummary>(
    (summary, row) => ({
      amount: Math.round((summary.amount + row.amount) * 100) / 100,
      volume: Math.round((summary.volume + row.volume) * 1000) / 1000,
      transactions: summary.transactions + 1
    }),
    { amount: 0, volume: 0, transactions: 0 }
  );
}