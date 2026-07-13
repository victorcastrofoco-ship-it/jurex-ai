export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  theme: "light" | "dark";
  pushNotificationsEnabled: boolean;
  createdAt: string;
}

export interface Client {
  id: string;
  userId: string;
  name: string;
  cpfCnpj: string;
  phone: string;
  email: string;
  notes?: string;
  createdAt: string;
}

export type LoanFrequency = "diaria" | "semanal" | "quinzenal" | "mensal";
export type LoanStatus = "active" | "paid" | "late";

export interface Loan {
  id: string;
  userId: string;
  clientId: string;
  amount: number;
  interestType: "fixed" | "interest";
  interestRate: number; // monthly interest rate %
  installmentsCount: number;
  frequency: LoanFrequency;
  status: LoanStatus;
  firstDueDate: string;
  chargeLateInterest: boolean;
  lateInterestType?: "percent" | "fixed";
  lateInterestValue?: number;
  notes?: string;
  createdAt: string;
  code?: string;
  // AI predictions (optional)
  delayProbability?: number; // 0 to 100
  suggestedRate?: number;
  riskAlerts?: string[];
  aiRecommendation?: string;
}

export interface PaymentInstallment {
  id: string;
  loanId: string;
  number: number;
  amount: number;
  originalAmount?: number;
  dueDate: string;
  status: "pending" | "paid" | "late";
  paymentDate?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "risk";
  isRead: boolean;
  createdAt: string;
}

export interface AIAnalysisResult {
  delayProbability: number; // e.g. 15 for 15%
  suggestedRate: number; // e.g. 4.5 for 4.5%
  riskAlerts: string[];
  recommendation: string;
}
