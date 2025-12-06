"use client";

import type React from "react";
import { useState } from "react";
import { Download, Import, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useExpenses } from "../../_hooks/use-expenses";

interface ImportExpensesDialogProps {
  onSuccess?: () => void;
}

export function ImportExpensesDialog({ onSuccess }: ImportExpensesDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 630px)");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [open, setOpen] = useState(false);

  // Utilizamos el hook useExpenses para acceder a las funcionalidades de importación y descarga
  const { onImportExpenses, isLoadingImportExpenses, onDownloadTemplate, isLoadingDownloadTemplate } = useExpenses();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
      setFile(selectedFile);
    } else {
      toast.error("Por favor selecciona un archivo Excel (.xlsx)");
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
      setFile(droppedFile);
    } else {
      toast.error("Por favor suelta un archivo Excel (.xlsx)");
    }
  };

  const handleDownloadTemplate = async () => {
    await onDownloadTemplate();
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  const handleImport = async () => {
    if (!file) return;

    try {
      // Llamamos a la función para importar gastos (continueOnError=false)
      const result = await onImportExpenses(file, false);

      // Éxito completo: todos se importaron sin errores
      if (result.data.successful === result.data.total) {
        setOpen(false); // Cerrar el diálogo
        setFile(null); // Limpiar el archivo

        // Llamar al callback de éxito si existe
        if (onSuccess) {
          onSuccess();
        }
        return;
      }

      // Éxito parcial: algunos se importaron, otros fallaron
      if (result.data.successful > 0 && result.data.failed > 0) {
        setOpen(false); // Cerrar el diálogo
        setFile(null); // Limpiar el archivo

        if (onSuccess) {
          onSuccess();
        }
        return;
      }

      // Si hubo errores críticos (failed > 0)
      if (result.data.failed > 0) {
        toast.warning(
          `Importación con errores: ${result.data.successful} de ${result.data.total} gastos importados. ${result.data.failed} fallidos.`
        );
      }
    } catch {
      // El error ya está manejado por el hook con toast
    }
  };

  const handleClose = () => {
    setFile(null);
  };

  // Componente del contenido del formulario para reutilizar en Dialog y Drawer
  const ImportContent = () => (
    <div className="grid gap-4 py-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {!file ? (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div className="flex flex-col items-center">
              <p className="text-sm font-medium">Arrastra y suelta tu archivo Excel aquí o</p>
              <Label
                htmlFor="file-upload"
                className="relative cursor-pointer text-sm font-medium text-primary underline"
              >
                selecciona un archivo
                <Input id="file-upload" type="file" accept=".xlsx" className="sr-only" onChange={handleFileChange} />
              </Label>
            </div>
            <p className="text-xs text-muted-foreground">Solo se permite un archivo Excel (.xlsx)</p>
          </div>
        ) : (
          <div className="flex items-center justify-between bg-muted/50 p-3 rounded-md">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded">
                <Upload className="h-4 w-4 text-primary" />
              </div>
              <div className="text-sm text-left">
                <p className="font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleRemoveFile} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={handleDownloadTemplate}
          disabled={isLoadingDownloadTemplate}
        >
          <Download className="h-4 w-4" />
          {isLoadingDownloadTemplate ? "Descargando..." : "Descargar Plantilla"}
        </Button>
        <p className="text-xs text-muted-foreground">Máximo 1 archivo</p>
      </div>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Import className="mr-2 size-4" aria-hidden="true" />
            Importar Gastos
          </Button>
        </DialogTrigger>
        <DialogContent tabIndex={undefined} className="px-0 sm:max-w-[500px]">
          <DialogHeader className="px-4">
            <DialogTitle>Importar Gastos</DialogTitle>
            <DialogDescription>
              Sube un archivo Excel con la información de los gastos que deseas importar.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-full max-h-[40vh] px-0">
            <div className="px-6">
              <ImportContent />
              <DialogFooter className="pt-4">
                <div className="grid grid-cols-2 gap-2 w-full">
                  <DialogClose asChild>
                    <Button onClick={handleClose} type="button" variant="outline" className="w-full">
                      Cancelar
                    </Button>
                  </DialogClose>
                  <Button onClick={handleImport} disabled={!file || isLoadingImportExpenses} className="w-full">
                    {isLoadingImportExpenses ? "Importando..." : "Importar"}
                  </Button>
                </div>
              </DialogFooter>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" size="sm">
          <Import className="mr-2 size-4" aria-hidden="true" />
          Importar Gastos
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="pb-2">
          <DrawerTitle>Importar Gastos</DrawerTitle>
          <DrawerDescription>
            Sube un archivo Excel con la información de los gastos que deseas importar.
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-[40vh] px-0">
            <div className="px-4">
              <ImportContent />
              <DrawerFooter className="px-0 pt-4 flex flex-col-reverse">
                <Button onClick={handleImport} disabled={!file || isLoadingImportExpenses} className="w-full">
                  {isLoadingImportExpenses ? "Importando..." : "Importar"}
                </Button>
                <DrawerClose asChild>
                  <Button variant="outline" className="w-full" onClick={handleClose}>
                    Cancelar
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </div>
          </ScrollArea>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
