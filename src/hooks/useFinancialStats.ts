import { useState, useEffect } from 'react';
import { getUserTransactions, Transaction as FirestoreTransaction } from '../services/firebase/firestore';
import { formatCurrency } from '../utils';

interface FinancialStats {
  income: number;
  expenses: number;
  netIncome: number;
  incomePercentage: number;
  expensesPercentage: number;
  formattedIncome: string;
  formattedExpenses: string;
  formattedNetIncome: string;
  incomeChange: string;
  expensesChange: string;
}

export const useFinancialStats = (userId: string | undefined) => {
  const [stats, setStats] = useState<FinancialStats>({
    income: 0,
    expenses: 0,
    netIncome: 0,
    incomePercentage: 0,
    expensesPercentage: 0,
    formattedIncome: formatCurrency(0),
    formattedExpenses: formatCurrency(0),
    formattedNetIncome: formatCurrency(0),
    incomeChange: '+0%',
    expensesChange: '+0%',
  });
  const [isLoading, setIsLoading] = useState(true);

  const calculateStats = (transactions: FirestoreTransaction[]) => {
    const income = transactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const netIncome = income - expenses;

    const total = income + expenses;
    const incomePercentage = total > 0 ? (income / total) * 100 : 0;
    const expensesPercentage = total > 0 ? (expenses / total) * 100 : 0;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const currentMonthTransactions = transactions.filter(t => {
      const transactionDate = t.createdAt?.toDate ? t.createdAt.toDate() : new Date();
      return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
    });

    const previousMonthTransactions = transactions.filter(t => {
      const transactionDate = t.createdAt?.toDate ? t.createdAt.toDate() : new Date();
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      return transactionDate.getMonth() === prevMonth && transactionDate.getFullYear() === prevYear;
    });

    const currentMonthIncome = currentMonthTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    const previousMonthIncome = previousMonthTransactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    const currentMonthExpenses = currentMonthTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const previousMonthExpenses = previousMonthTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const incomeChange = previousMonthIncome > 0 
      ? ((currentMonthIncome - previousMonthIncome) / previousMonthIncome) * 100
      : currentMonthIncome > 0 ? 100 : 0;

    const expensesChange = previousMonthExpenses > 0
      ? ((currentMonthExpenses - previousMonthExpenses) / previousMonthExpenses) * 100
      : currentMonthExpenses > 0 ? 100 : 0;

    const safeIncomeChange = isNaN(incomeChange) ? 0 : incomeChange;
    const safeExpensesChange = isNaN(expensesChange) ? 0 : expensesChange;

    const calculatedStats = {
      income,
      expenses,
      netIncome,
      incomePercentage,
      expensesPercentage,
      formattedIncome: formatCurrency(income),
      formattedExpenses: formatCurrency(expenses),
      formattedNetIncome: formatCurrency(netIncome),
      incomeChange: `${safeIncomeChange >= 0 ? '+' : ''}${safeIncomeChange.toFixed(1)}%`,
      expensesChange: `${safeExpensesChange >= 0 ? '+' : ''}${safeExpensesChange.toFixed(1)}%`,
    };

    return calculatedStats;
  };

  const loadStats = async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      const transactions = await getUserTransactions(userId);
      
      const calculatedStats = calculateStats(transactions);
      setStats(calculatedStats);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [userId]);

  return {
    stats,
    isLoading,
    refreshStats: loadStats,
  };
}; 