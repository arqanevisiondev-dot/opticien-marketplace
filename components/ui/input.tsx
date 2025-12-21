import * as React from "react"

import { cn } from "@/lib/utils"

type NativeInputProps = React.ComponentProps<"input"> & { className?: string }

function Input({ className, type, value, ...props }: NativeInputProps) {
  // Normalize numeric values to strings and convert NaN to empty string
  // This avoids React warning: "Received NaN for the `value` attribute"
  let normalizedValue: string | undefined = undefined

  if (type !== "file") {
    if (typeof value === "number") {
      normalizedValue = Number.isNaN(value) ? "" : String(value)
    } else if (value !== undefined) {
      // keep string/boolean values as-is (React will validate them)
      normalizedValue = (value as unknown) as string
    }
  }

  const finalProps: any = { ...props }
  if (normalizedValue !== undefined) finalProps.value = normalizedValue

  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...finalProps}
    />
  )
}

export { Input }
