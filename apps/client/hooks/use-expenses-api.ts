import { useAuthenticatedApi } from "./use-authenticated-api";

export enum ExpenseStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  PAID = "PAID",
  REJECTED = "REJECTED",
}

export enum PaymentMethod {
  CASH = "CASH",
  CREDIT_CARD = "CREDIT_CARD",
  BANK_TRANSFER = "BANK_TRANSFER",
  CHECK = "CHECK",
}

export interface Expense {
  id: string;
  reference: string;
  amount: number;
  expenseDate: string;
  description?: string;
  vendor?: string;
  status: ExpenseStatus;
  paymentMethod?: PaymentMethod;
  categoryId?: string;
  category?: {
    id: string;
    name: string;
  };
  attachmentUrl?: string;
  companyId: string;
  createdById: string;
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseDto {
  reference: string;
  amount: number;
  expenseDate: string;
  description?: string;
  vendor?: string;
  categoryId?: string;
}

export interface UpdateExpenseDto {
  reference?: string;
  amount?: number;
  expenseDate?: string;
  description?: string;
  vendor?: string;
  status?: ExpenseStatus;
  paymentMethod?: PaymentMethod;
  categoryId?: string;
}

export interface UpdateExpenseStatusDto {
  status: ExpenseStatus;
}

export interface ExpenseStats {
  totalExpenses: number;
  pendingExpenses: number;
  approvedExpenses: number;
  paidExpenses: number;
  rejectedExpenses: number;
  totalAmount: number;
  pendingAmount: number;
  approvedAmount: number;
  paidAmount: number;
}

export function useExpensesApi() {
  const { get, post, put, patch, delete: del } = useAuthenticatedApi();

  const getExpenses = async (): Promise<Expense[]> => {
    const response = (await get("/expenses")) as { data: Expense[] };
    return response.data;
  };

  const getExpense = async (id: string): Promise<Expense> => {
    const response = (await get(`/expenses/${id}`)) as { data: Expense };
    return response.data;
  };

  const getExpenseStats = async (): Promise<ExpenseStats> => {
    const response = (await get("/expenses/stats")) as { data: ExpenseStats };
    return response.data;
  };

  const createExpense = async (data: CreateExpenseDto): Promise<Expense> => {
    const response = (await post("/expenses", data)) as { data: Expense };
    return response.data;
  };

  const updateExpense = async (
    id: string,
    data: UpdateExpenseDto
  ): Promise<Expense> => {
    const response = (await put(`/expenses/${id}`, data)) as { data: Expense };
    return response.data;
  };

  const updateExpenseStatus = async (
    id: string,
    data: UpdateExpenseStatusDto
  ): Promise<Expense> => {
    const response = (await patch(`/expenses/${id}/status`, data)) as {
      data: Expense;
    };
    return response.data;
  };

  const deleteExpense = async (id: string): Promise<void> => {
    await del(`/expenses/${id}`);
  };

  return {
    getExpenses,
    getExpense,
    getExpenseStats,
    createExpense,
    updateExpense,
    updateExpenseStatus,
    deleteExpense,
  };
}
