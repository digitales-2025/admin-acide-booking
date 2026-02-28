import { format, parse } from "date-fns";
import { BriefcaseBusiness, Building2, Home, IdCard, Mail, MapPin, MapPinned, User } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import flags from "react-phone-number-input/flags";

import DniLookup from "@/app/(admin)/customers/_components/search-dni/LookupDni";
import RucLookup from "@/app/(admin)/customers/_components/search-ruc/LookupRuc";
import { CreateCustomersSchema } from "@/app/(admin)/customers/_schema/createCustomersSchema";
import { CustomerDocumentType, CustomerMaritalStatus } from "@/app/(admin)/customers/_types/customer";
import {
  CustomerDocumentTypeLabels,
  CustomerMaritalStatusLabels,
} from "@/app/(admin)/customers/_utils/customers.utils";
import { CountryAutocomplete, CountryOption } from "@/components/country-autocomplete";
import { InputWithIcon } from "@/components/input-with-icon";
import { AutoComplete, Option } from "@/components/ui/autocomplete";
import DatePicker from "@/components/ui/date-time-picker";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PhoneInput } from "@/components/ui/phone-input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { City } from "@/types/city";

interface CreateCustomersReservationsFormProps
  extends Omit<React.ComponentPropsWithRef<typeof Sheet>, "open" | "onOpenChange"> {
  children: React.ReactNode;
  form: UseFormReturn<CreateCustomersSchema>;
  onSubmit: (data: CreateCustomersSchema) => void;
  countryOptions: CountryOption[];
  departmentOptions: Option[];
  handleDepartmentChange: (departmentName: string) => void;
  cities: City[];
  isDepartmentSelected: boolean;
}
export default function CreateCustomersReservationsForm({
  children,
  form,
  onSubmit,
  countryOptions,
  departmentOptions,
  handleDepartmentChange,
  cities,
  isDepartmentSelected,
}: CreateCustomersReservationsFormProps) {
  // Observar el tipo de documento seleccionado
  const selectedDocumentType = form.watch("documentType");
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 px-6">
        <FormField
          control={form.control}
          name="documentType"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="documentType">Tipo de Documento</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ""}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona un tipo de documento" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                    {Object.values(CustomerDocumentType).map((documentType) => {
                      const documentTypeConfig = CustomerDocumentTypeLabels[documentType];
                      const Icon = documentTypeConfig.icon;

                      return (
                        <SelectItem key={documentType} value={documentType} className="flex items-center gap-2">
                          <Icon className={`size-4 ${documentTypeConfig.className}`} />
                          <span>{documentTypeConfig.label}</span>
                        </SelectItem>
                      );
                    })}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedDocumentType === CustomerDocumentType.DNI ? (
          <FormField
            control={form.control}
            name="documentNumber"
            render={() => (
              <FormItem className="sm:col-span-2">
                <FormLabel className="text-sm font-medium">Número de DNI</FormLabel>
                <FormControl>
                  <DniLookup form={form} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <FormField
            control={form.control}
            name="documentNumber"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel className="text-sm font-medium">Número de Documento</FormLabel>
                <FormControl>
                  <InputWithIcon Icon={IdCard} placeholder="Ingrese el número de documento" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre Completo</FormLabel>
              <FormControl>
                <InputWithIcon Icon={User} placeholder="Ejm: Juan Perez" {...field} className="capitalize" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dirección</FormLabel>
              <FormControl>
                <InputWithIcon Icon={Home} placeholder="Ejm: Jr. Los Pinos 123" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>País</FormLabel>
              <FormControl>
                <CountryAutocomplete
                  options={countryOptions}
                  flags={flags}
                  emptyMessage="No se encontró el país."
                  placeholder="Seleccione un país"
                  onValueChange={(selectedOption) => {
                    field.onChange(selectedOption?.value || "");
                  }}
                  value={countryOptions.find((option) => option.value === field.value) || undefined}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.watch("country") === "Perú" && (
          <>
            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Departamento</FormLabel>
                  <FormControl>
                    <AutoComplete
                      options={departmentOptions}
                      emptyMessage="No se encontró el departamento."
                      placeholder="Seleccione un departamento"
                      onValueChange={(selectedOption) => {
                        field.onChange(selectedOption?.value || "");
                        handleDepartmentChange(selectedOption?.value || "");
                      }}
                      value={departmentOptions.find((option) => option.value === field.value) || undefined}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="province"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="city">Provincia</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={!isDepartmentSelected}>
                    <FormControl>
                      <SelectTrigger className="w-full border border-input">
                        <SelectValue placeholder="Seleccione una provincia" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        {cities.map((city) => (
                          <SelectItem key={city.id.toString()} value={city.name}>
                            {city.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <FormField
          control={form.control}
          name="birthPlace"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lugar de nacimiento</FormLabel>
              <FormControl>
                <InputWithIcon Icon={MapPin} placeholder="Ejm: Lima" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="birthDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="birthDate">Fecha de Nacimiento</FormLabel>

              <FormControl>
                <DatePicker
                  value={field.value ? parse(field.value, "yyyy-MM-dd", new Date()) : undefined}
                  isBirthday={true}
                  onChange={(date) => {
                    if (date) {
                      const formattedDate = format(date, "yyyy-MM-dd");
                      field.onChange(formattedDate);
                    } else {
                      field.onChange("");
                    }
                  }}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="occupation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ocupación</FormLabel>
              <FormControl>
                <InputWithIcon Icon={BriefcaseBusiness} placeholder="Ejm: Ingeniero" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono</FormLabel>
              <FormControl>
                <PhoneInput
                  defaultCountry="PE"
                  placeholder="Ingrese el número de teléfono"
                  value={field.value}
                  onChange={(value) => field.onChange(value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo electrónico</FormLabel>
              <FormControl>
                <InputWithIcon Icon={Mail} placeholder="usuario@hotelprototype.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="maritalStatus"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="documentType">Estado Civil</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ""}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona un estado civil" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                    {Object.values(CustomerMaritalStatus).map((maritalStatus) => {
                      const maritalStatusConfig = CustomerMaritalStatusLabels[maritalStatus];
                      const Icon = maritalStatusConfig.icon;

                      return (
                        <SelectItem key={maritalStatus} value={maritalStatus} className="flex items-center gap-2">
                          <Icon className={`size-4 ${maritalStatusConfig.className}`} />
                          <span>{maritalStatusConfig.label}</span>
                        </SelectItem>
                      );
                    })}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="hasCompany"
          render={({ field }) => (
            <FormItem className="relative sm:col-span-2">
              <div
                className={`
                  p-5 rounded-xl border dark:border-slate-700 border-slate-200
                  transition-all duration-300 ease-in-out
                  ${field.value ? "shadow-md dark:bg-slate-800/40 bg-slate-50/50" : "dark:bg-slate-900/60 bg-white"}
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`
                        relative overflow-hidden rounded-lg w-10 h-10 flex items-center justify-center
                        ${field.value ? "dark:bg-slate-700 bg-slate-100" : "dark:bg-slate-800 bg-slate-50"}
                      `}
                    >
                      <Building2
                        className={`size-5 ${field.value ? "dark:text-slate-200 text-slate-700" : "dark:text-slate-400 text-slate-500"}`}
                      />
                      {field.value && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-slate-600 dark:bg-slate-400"></div>
                      )}
                    </div>
                    <div>
                      <FormLabel htmlFor="hasCompany" className="text-base font-medium tracking-tight block">
                        Información Empresarial
                      </FormLabel>
                      <FormDescription className="text-xs dark:text-slate-400">
                        {field.value ? "Datos empresariales habilitados" : "Datos personales solamente"}
                      </FormDescription>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <span
                      className={`text-xs font-medium rounded-full px-2 py-0.5 ${
                        field.value
                          ? "dark:bg-slate-700 bg-slate-100 dark:text-slate-200 text-slate-700"
                          : "dark:bg-slate-800 bg-slate-100 dark:text-slate-400 text-slate-500"
                      }`}
                    >
                      {field.value ? "Empresa" : "Individual"}
                    </span>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        id="hasCompany"
                        aria-label="Alternar si cuenta con empresa"
                        className="data-[state=checked]:dark:bg-slate-500 data-[state=checked]:bg-slate-700"
                      />
                    </FormControl>
                  </div>
                </div>
              </div>
            </FormItem>
          )}
        />

        {form.watch("hasCompany") && (
          <>
            <FormField
              control={form.control}
              name="ruc"
              render={() => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">RUC</FormLabel>
                  <FormControl>
                    <RucLookup form={form} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la empresa</FormLabel>
                  <FormControl>
                    <InputWithIcon Icon={Building2} placeholder="Ejm: Hotel Prototype" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="companyAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección de la empresa</FormLabel>
                  <FormControl>
                    <InputWithIcon Icon={MapPinned} placeholder="Ejm: Jr. Los Pinos 123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
        {children}
      </form>
    </Form>
  );
}
