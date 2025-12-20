import React from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost"
  size?: "sm" | "md" | "lg" | "icon-sm"
  children: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const baseStyles = "font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-md"

    const variants = {
      primary: "bg-[#2C3B4D] text-white hover:bg-[#1B2632] active:bg-[#151d26]",
      secondary: "bg-[#f56a24] text-white hover:bg-[#d85a1f] active:bg-[#c04a1a]",
      outline: "border-2 border-[#f56a24] text-[#f56a24] hover:bg-[#f56a24] hover:text-white transition-all",
      ghost: "bg-transparent text-gray-600 hover:text-blue-600 hover:bg-transparent",
      danger: "bg-[#A35139] text-white hover:bg-[#8b4530] active:bg-[#733828]",
    }

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg",
      "icon-sm": "p-1.5 text-sm",
    }

    return (
      <button ref={ref} className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
        {children}
      </button>
    )
  },
)

Button.displayName = "Button"

export default Button
