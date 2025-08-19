import { MONTHS_IN_YEAR } from "./constants";

/**
 * Calculate SIP Future Value using the compound interest formula
 * FV = A * [((1 + r/12)^(12*n) - 1) / (r/12)] * (1 + r/12)
 */
export function calculateSipFutureValue(
  monthlyAmount: number,
  annualReturnRate: number,
  durationYears: number
): {
  futureValue: number;
  totalInvestment: number;
  capitalGains: number;
} {
  const monthlyRate = annualReturnRate / 100 / MONTHS_IN_YEAR;
  const totalMonths = durationYears * MONTHS_IN_YEAR;
  const totalInvestment = monthlyAmount * totalMonths;

  if (monthlyRate === 0) {
    // If no return rate, future value equals total investment
    return {
      futureValue: totalInvestment,
      totalInvestment,
      capitalGains: 0
    };
  }

  const futureValue = monthlyAmount * 
    (((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate));

  const capitalGains = futureValue - totalInvestment;

  return {
    futureValue,
    totalInvestment,
    capitalGains
  };
}

/**
 * Calculate lumpsum future value
 * FV = PV * (1 + r)^n
 */
export function calculateLumpsumFutureValue(
  principal: number,
  annualReturnRate: number,
  durationYears: number
): number {
  const annualRate = annualReturnRate / 100;
  return principal * Math.pow(1 + annualRate, durationYears);
}

/**
 * Calculate required SIP amount for a target corpus (goal-based planning)
 */
export function calculateRequiredSipAmount(
  targetCorpus: number,
  annualReturnRate: number,
  durationYears: number
): number {
  const monthlyRate = annualReturnRate / 100 / MONTHS_IN_YEAR;
  const totalMonths = durationYears * MONTHS_IN_YEAR;

  if (monthlyRate === 0) {
    return targetCorpus / totalMonths;
  }

  const denominator = (((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate));
  return targetCorpus / denominator;
}

/**
 * Calculate step-up SIP future value with annual increase
 */
export function calculateStepUpSipFutureValue(
  initialAmount: number,
  annualIncreasePercent: number,
  annualReturnRate: number,
  durationYears: number
): {
  futureValue: number;
  totalInvestment: number;
  capitalGains: number;
  yearlyBreakdown: Array<{
    year: number;
    monthlyAmount: number;
    yearlyInvestment: number;
    cumulativeInvestment: number;
    yearEndValue: number;
  }>;
} {
  const monthlyRate = annualReturnRate / 100 / MONTHS_IN_YEAR;
  const annualIncrease = annualIncreasePercent / 100;
  
  let totalInvestment = 0;
  let futureValue = 0;
  let currentAmount = initialAmount;
  const yearlyBreakdown = [];

  for (let year = 1; year <= durationYears; year++) {
    const yearlyInvestment = currentAmount * MONTHS_IN_YEAR;
    totalInvestment += yearlyInvestment;

    // Calculate future value for this year's contributions
    const monthsRemaining = (durationYears - year + 1) * MONTHS_IN_YEAR;
    if (monthlyRate === 0) {
      futureValue += yearlyInvestment;
    } else {
      const yearContributionFV = currentAmount * 
        (((Math.pow(1 + monthlyRate, monthsRemaining) - 1) / monthlyRate) * (1 + monthlyRate));
      futureValue += yearContributionFV;
    }

    yearlyBreakdown.push({
      year,
      monthlyAmount: currentAmount,
      yearlyInvestment,
      cumulativeInvestment: totalInvestment,
      yearEndValue: futureValue
    });

    // Increase amount for next year
    currentAmount = currentAmount * (1 + annualIncrease);
  }

  return {
    futureValue,
    totalInvestment,
    capitalGains: futureValue - totalInvestment,
    yearlyBreakdown
  };
}

/**
 * Simple XIRR approximation using Newton-Raphson method
 * This is a simplified version - production would use more sophisticated algorithms
 */
export function calculateXIRR(
  cashflows: Array<{ date: Date; amount: number }>,
  guess: number = 0.1
): number | null {
  if (cashflows.length < 2) return null;

  const sortedCashflows = [...cashflows].sort((a, b) => a.date.getTime() - b.date.getTime());
  const firstDate = sortedCashflows[0].date;

  // Convert to days from first investment
  const data = sortedCashflows.map(cf => ({
    days: Math.floor((cf.date.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)),
    amount: cf.amount
  }));

  let rate = guess;
  const maxIterations = 100;
  const tolerance = 1e-6;

  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let dnpv = 0;

    for (const point of data) {
      const factor = Math.pow(1 + rate, point.days / 365);
      npv += point.amount / factor;
      dnpv -= point.amount * point.days / 365 / Math.pow(1 + rate, point.days / 365 + 1);
    }

    if (Math.abs(npv) < tolerance) {
      return rate * 100; // Return as percentage
    }

    if (Math.abs(dnpv) < tolerance) {
      break; // Avoid division by zero
    }

    rate = rate - npv / dnpv;

    // Bound the rate to reasonable values
    if (rate < -0.99) rate = -0.99;
    if (rate > 10) rate = 10;
  }

  return null; // Convergence failed
}

/**
 * Format currency for Indian locale
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format number with Indian locale (lakhs/crores)
 */
export function formatNumber(num: number): string {
  if (num >= 10000000) { // 1 crore
    return `₹${(num / 10000000).toFixed(1)} Cr`;
  } else if (num >= 100000) { // 1 lakh
    return `₹${(num / 100000).toFixed(1)} L`;
  } else if (num >= 1000) { // 1 thousand
    return `₹${(num / 1000).toFixed(1)}k`;
  }
  return formatCurrency(num);
}

/**
 * Calculate inflation-adjusted return
 */
export function calculateRealReturn(nominalReturn: number, inflationRate: number): number {
  return ((1 + nominalReturn / 100) / (1 + inflationRate / 100) - 1) * 100;
}
