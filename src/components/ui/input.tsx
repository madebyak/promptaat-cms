import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

function Input({ className, type, error, ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm",
        "transition-colors duration-200",
        "placeholder:text-muted-foreground",
        "focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        error ? "border-destructive focus:ring-destructive focus:border-destructive" : "",
        className
      )}
      {...props}
    />
  )
}

export { Input }