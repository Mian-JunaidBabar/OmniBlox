import { useAuthenticatedApi } from "./use-authenticated-api";

export interface ExpenseCategory {
  id: string;
  name: string;
  description?: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseCategoryDto {
  name: string;
  description?: string;
}

export interface UpdateExpenseCategoryDto {
  name?: string;
  description?: string;
}

export function useExpenseCategoriesApi() {
  const { get, post, put, delete: del } = useAuthenticatedApi();

  const getExpenseCategories = async (): Promise<ExpenseCategory[]> => {
    const response = (await get("/expense-categories")) as {
      data: ExpenseCategory[];
    };
    return response.data;
  };

  const getExpenseCategory = async (id: string): Promise<ExpenseCategory> => {
    const response = (await get(`/expense-categories/${id}`)) as {
      data: ExpenseCategory;
    };
    return response.data;
  };

  const createExpenseCategory = async (
    data: CreateExpenseCategoryDto
  ): Promise<ExpenseCategory> => {
    const response = (await post("/expense-categories", data)) as {
      data: ExpenseCategory;
    };
    return response.data;
  };

  const updateExpenseCategory = async (
    id: string,
    data: UpdateExpenseCategoryDto
  ): Promise<ExpenseCategory> => {
    const response = (await put(`/expense-categories/${id}`, data)) as {
      data: ExpenseCategory;
    };
    return response.data;
  };

  const deleteExpenseCategory = async (id: string): Promise<void> => {
    await del(`/expense-categories/${id}`);
  };

  return {
    getExpenseCategories,
    getExpenseCategory,
    createExpenseCategory,
    updateExpenseCategory,
    deleteExpenseCategory,
  };
}
