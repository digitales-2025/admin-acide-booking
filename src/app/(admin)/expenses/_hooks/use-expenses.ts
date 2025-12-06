import { toast } from "sonner";

import { runAndHandleError } from "@/utils/baseQuery";
import {
  useCreateExpenseMutation,
  useDeleteExpensesMutation,
  useGetAllExpensesQuery,
  useGetExpenseByIdQuery,
  useImportExpensesMutation,
  useLazyDownloadExpenseTemplateQuery,
  useUpdateExpenseMutation,
} from "../_services/expensesApi";
import { CreateHotelExpenseDto, DeleteHotelExpenseDto, UpdateHotelExpenseDto } from "../_types/expenses";

// Hook personalizado para gastos
export const useExpenses = () => {
  // CONSULTAS

  // Consulta todos los gastos
  const {
    data: expensesList,
    error: expensesError,
    isLoading: isLoadingExpenses,
    isSuccess: isSuccessExpenses,
    refetch: refetchExpenses,
  } = useGetAllExpensesQuery();

  // Consulta un gasto por su ID
  const useGetExpenseById = (id: string) => {
    const { data, isLoading, error } = useGetExpenseByIdQuery(id);
    return { expense: data, isLoading, error };
  };

  // Consulta los gastos por una fecha específica
  /*   const useGetExpensesByDate = (date: string) => {
    const { data, isLoading, error } = useGetExpensesByDateQuery(date);
    return { expenses: data, isLoading, error };
  }; */

  // MUTACIONES

  // Mutación para crear un gasto
  const [createExpense, { isSuccess: isSuccessCreateExpense, isLoading: isLoadingCreateExpense }] =
    useCreateExpenseMutation();

  // Mutación para actualizar un gasto
  const [updateExpense, { isSuccess: isSuccessUpdateExpense, isLoading: isLoadingUpdateExpense }] =
    useUpdateExpenseMutation();

  // Mutación para eliminar múltiples gastos
  const [deleteExpenses, { isSuccess: isSuccessDeleteExpenses, isLoading: isLoadingDeleteExpenses }] =
    useDeleteExpensesMutation();

  // Mutación para importar gastos
  const [importExpenses, { isSuccess: isSuccessImportExpenses, isLoading: isLoadingImportExpenses }] =
    useImportExpensesMutation();

  // Query para descargar plantilla
  const [downloadTemplate, { isLoading: isLoadingDownloadTemplate }] = useLazyDownloadExpenseTemplateQuery();

  // FUNCIONES DE ACCIÓN

  /**
   * Crea un nuevo gasto usando la mutación y muestra notificaciones.
   * @param data - Datos del gasto a crear
   */
  async function onCreateExpense(data: CreateHotelExpenseDto) {
    const promise = runAndHandleError(async () => {
      const response = await createExpense(data).unwrap();
      return response.data;
    });

    toast.promise(promise, {
      loading: "Creando gasto...",
      success: "Gasto creado con éxito",
      error: (err) => err.message,
    });

    return await promise;
  }

  /**
   * Actualiza un gasto existente por ID y muestra notificaciones.
   * @param id - ID del gasto a actualizar
   * @param data - Datos a actualizar
   */
  async function onUpdateExpense(id: string, data: UpdateHotelExpenseDto) {
    const promise = runAndHandleError(async () => {
      const response = await updateExpense({ id, body: data }).unwrap();
      return response.data;
    });

    toast.promise(promise, {
      loading: "Actualizando gasto...",
      success: "Gasto actualizado exitosamente",
      error: (err) => err.message,
    });

    return await promise;
  }

  /**
   * Elimina múltiples gastos por sus IDs y muestra notificaciones.
   * @param ids - Array de IDs de los gastos a eliminar
   */
  async function onDeleteExpenses(ids: string[]) {
    const deleteDto: DeleteHotelExpenseDto = { ids };
    const promise = runAndHandleError(async () => {
      const response = await deleteExpenses(deleteDto).unwrap();
      return response.data;
    });

    toast.promise(promise, {
      loading: "Eliminando gastos...",
      success: "Gastos eliminados con éxito",
      error: (err) => err.message,
    });

    return await promise;
  }

  /**
   * Importa gastos desde un archivo Excel
   * @param file - Archivo Excel a importar
   * @param continueOnError - Continuar con la importación si hay errores
   */
  async function onImportExpenses(file: File, continueOnError: boolean = false) {
    const promise = runAndHandleError(async () => {
      const response = await importExpenses({ file, continueOnError }).unwrap();
      return response;
    });

    toast.promise(promise, {
      loading: "Importando gastos...",
      success: (data) => data.message || "Importación completada con éxito",
      error: (err) => err.message,
    });

    return await promise;
  }

  /**
   * Descarga la plantilla Excel para importar gastos
   */
  async function onDownloadTemplate() {
    const toastId = toast.loading("Descargando plantilla...");

    try {
      const blob = await downloadTemplate().unwrap();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "plantilla_gastos.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      toast.success("Plantilla descargada con éxito", { id: toastId });
      return true;
    } catch (error: any) {
      toast.error(`Error al descargar: ${error.message}`, { id: toastId });
      return false;
    }
  }

  return {
    // Consultas
    expensesList,
    expensesError,
    isLoadingExpenses,
    isSuccessExpenses,
    refetchExpenses,
    useGetExpenseById,
    /*   useGetExpensesByDate, */

    // Acciones
    onCreateExpense, // Crear gasto
    onUpdateExpense, // Actualizar gasto
    onDeleteExpenses, // Eliminar gastos
    onImportExpenses, // Importar gastos
    onDownloadTemplate, // Descargar plantilla

    // Estados de mutaciones
    isSuccessCreateExpense,
    isLoadingCreateExpense,
    isSuccessUpdateExpense,
    isLoadingUpdateExpense,
    isSuccessDeleteExpenses,
    isLoadingDeleteExpenses,
    isSuccessImportExpenses,
    isLoadingImportExpenses,
    isLoadingDownloadTemplate,
  };
};
