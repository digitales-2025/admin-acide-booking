import { createApi } from "@reduxjs/toolkit/query/react";

import { PaginatedResponse } from "@/types/api/paginated-response";
import { BaseApiResponse } from "@/types/api/types";
import { AdvancedPaginationParams } from "@/types/query-filters/advanced-pagination";
import { PaginatedQueryParams } from "@/types/query-filters/generic-paginated-query-params";
import baseQueryWithReauth from "@/utils/baseQuery";
import { CreateHotelExpenseDto, DeleteHotelExpenseDto, HotelExpense, UpdateHotelExpenseDto } from "../_types/expenses";

// Tipos de respuesta base
type ExpenseResponse = BaseApiResponse<HotelExpense>;
type ExpensesResponse = BaseApiResponse<HotelExpense[]>;
export type PaginatedExpenseParams = PaginatedQueryParams<HotelExpense> & {
  year?: string;
  month?: string;
};

// Tipos para importación
interface ImportExpensesResponse {
  statusCode: number;
  message: string;
  data: {
    total: number;
    successful: number;
    failed: number;
    errors: Array<{
      row: number;
      data: Record<string, unknown>;
      error: string;
    }>;
  };
}

interface ImportExpensesRequest {
  file: File;
  continueOnError?: boolean;
}

export const expensesApi = createApi({
  reducerPath: "expensesApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Expense"],
  endpoints: (build) => ({
    // Obtener todos los gastos
    getAllExpenses: build.query<HotelExpense[], void>({
      query: () => ({
        url: "/expenses",
        method: "GET",
        credentials: "include",
      }),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: "Expense" as const, id })), { type: "Expense", id: "LIST" }]
          : [{ type: "Expense", id: "LIST" }],
    }),

    // Obtener gasto por ID
    getExpenseById: build.query<HotelExpense, string>({
      query: (id) => ({
        url: `/expenses/${id}`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: (result, error, id) => [{ type: "Expense", id }],
    }),

    // Obtener gastos por fecha (mejorado con paginación avanzada)
    getExpensesByDate: build.query<
      PaginatedResponse<HotelExpense>,
      PaginatedExpenseParams | (AdvancedPaginationParams & { year?: string; month?: string })
    >({
      query: (params) => {
        // Detectar si es el formato nuevo (AdvancedPaginationParams) o el formato viejo (PaginatedExpenseParams)
        const isAdvancedFormat = "filters" in params && "sort" in params;

        if (isAdvancedFormat) {
          // Formato avanzado
          const { pagination, filters, sort, year, month } = params as AdvancedPaginationParams & {
            year?: string;
            month?: string;
          };
          return {
            url: "/expenses/filter/date",
            method: "GET",
            params: {
              page: pagination.page,
              pageSize: pagination.pageSize,
              ...(year && { year }),
              ...(month && { month }),
              ...(filters?.search && { search: filters.search }),
              ...(filters?.category && {
                category: Array.isArray(filters.category) ? filters.category.join(",") : filters.category,
              }),
              ...(filters?.paymentMethod && {
                paymentMethod: Array.isArray(filters.paymentMethod)
                  ? filters.paymentMethod.join(",")
                  : filters.paymentMethod,
              }),
              ...(filters?.documentType && {
                documentType: Array.isArray(filters.documentType)
                  ? filters.documentType.join(",")
                  : filters.documentType,
              }),
              ...(sort?.sortBy && { sortBy: sort.sortBy }),
              ...(sort?.sortOrder && { sortOrder: sort.sortOrder }),
            },
            credentials: "include",
          };
        } else {
          // Formato original (compatibilidad hacia atrás)
          const {
            pagination: { page = 1, pageSize = 10 },
            year,
            month,
          } = params as PaginatedExpenseParams;
          return {
            url: "/expenses/filter/date",
            method: "GET",
            params: {
              page,
              pageSize,
              ...(year ? { year } : {}),
              ...(month ? { month } : {}),
            },
            credentials: "include",
          };
        }
      },
      providesTags: (result) => [
        { type: "Expense", id: result?.meta?.page },
        ...(result?.data?.map(({ id }) => ({ type: "Expense" as const, id })) ?? []),
      ],
    }),

    // Crear gasto
    createExpense: build.mutation<ExpenseResponse, CreateHotelExpenseDto>({
      query: (body) => ({
        url: "/expenses",
        method: "POST",
        body,
        credentials: "include",
      }),
      invalidatesTags: ["Expense"],
    }),

    // Actualizar gasto
    updateExpense: build.mutation<ExpenseResponse, { id: string; body: UpdateHotelExpenseDto }>({
      query: ({ id, body }) => ({
        url: `/expenses/${id}`,
        method: "PATCH",
        body,
        credentials: "include",
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Expense", id },
        { type: "Expense", id: "LIST" },
      ],
    }),

    // Eliminar múltiples gastos
    deleteExpenses: build.mutation<ExpensesResponse, DeleteHotelExpenseDto>({
      query: (body) => ({
        url: `/expenses/remove/all`,
        method: "DELETE",
        body,
        credentials: "include",
      }),
      invalidatesTags: ["Expense"],
    }),

    // Importar gastos desde archivo Excel
    importExpenses: build.mutation<ImportExpensesResponse, ImportExpensesRequest>({
      query: ({ file, continueOnError = false }) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("continueOnError", String(continueOnError));

        return {
          url: "/expenses/import",
          method: "POST",
          body: formData,
          credentials: "include",
          // Importante: no establecer Content-Type, lo hará automáticamente para FormData
        };
      },
      invalidatesTags: ["Expense"],
    }),

    // Descargar plantilla para importar gastos
    downloadExpenseTemplate: build.query<Blob, void>({
      query: () => ({
        url: "/expenses/import/template",
        method: "GET",
        responseHandler: async (response: Response) => await response.blob(),
        credentials: "include",
      }),
    }),
  }),
});

export const {
  useGetAllExpensesQuery,
  useGetExpenseByIdQuery,
  useGetExpensesByDateQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpensesMutation,
  useImportExpensesMutation,
  useLazyDownloadExpenseTemplateQuery,
} = expensesApi;
