"use client";

import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import ImagePlaceholder from "@/assets/images/placeholder.webp";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InputPassword } from "@/components/ui/input-password";
import { useLogin } from "./_hooks/use-login";
import { LoginSchema } from "./_schema/loginSchema";

export default function LoginPage() {
  const { onLogin, isLoading } = useLogin();

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Left side - Image */}
      <div className="relative hidden w-1/2 overflow-hidden lg:block">
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent z-10"></div>
        <Image
          src={ImagePlaceholder || "/placeholder.svg"}
          alt="Hotel Prototype"
          layout="fill"
          objectFit="cover"
          className="transition-transform duration-500 ease-in-out hover:scale-105"
        />
        <div className="absolute bottom-0 left-0 z-20 p-10">
          <h1 className="text-4xl font-bold text-white drop-shadow-lg">Hotel Prototype</h1>
          <p className="mt-2 text-lg text-white/90 drop-shadow-md max-w-md">Sistema de administración exclusivo</p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex w-full items-center justify-center lg:w-1/2">
        <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-8 shadow-2xl dark:bg-gray-800 dark:shadow-gray-900/30">
          <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/10 blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-primary/10 blur-3xl"></div>

          <div className="relative">
            <h2 className="mb-2 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
              Panel Administrativo
            </h2>
            <p className="mb-8 text-center text-sm text-gray-600 dark:text-gray-400">
              Acceso exclusivo para personal autorizado
            </p>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onLogin)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300">Correo Electrónico</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 dark:text-gray-400" />
                          <Input
                            type="email"
                            placeholder="nombre@hotelprototype.com"
                            className="pl-10 border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-gray-700 dark:text-gray-300">Contraseña</FormLabel>
                      </div>
                      <FormControl>
                        <InputPassword
                          placeholder="********"
                          autoComplete="current-password"
                          icon={<Lock className="h-4 w-4 text-neutral-500 dark:text-gray-400" />}
                          className="border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="group relative flex w-full justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white dark:text-black hover:bg-primary/90 transition-colors"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Iniciando sesión...
                    </>
                  ) : (
                    "Ingresar al Sistema"
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-8 text-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Hotel Prototype © {new Date().getFullYear()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
