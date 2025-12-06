"use client";

import { type Table } from "@tanstack/react-table";

import { HotelExpense } from "../../_types/expenses";
import { CreateExpensesDialog } from "../create/CreateExpensesDialog";
import { ImportExpensesDialog } from "../import/ImportExpensesDialog";
import { DeleteExpensesDialog } from "../state-management/DeleteExpensesDialog";

export interface ExpensesTableToolbarActionsProps {
  table?: Table<HotelExpense>;
}

export function ExpensesTableToolbarActions({ table }: ExpensesTableToolbarActionsProps) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {table && table.getFilteredSelectedRowModel().rows.length > 0 ? (
        <DeleteExpensesDialog
          expenses={table.getFilteredSelectedRowModel().rows.map((row) => row.original)}
          onSuccess={() => {
            table.toggleAllRowsSelected(false);
          }}
        />
      ) : null}
      <ImportExpensesDialog />
      <CreateExpensesDialog />
    </div>
  );
}
