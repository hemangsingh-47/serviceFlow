import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "../../lib/utils.js"

const buttonVariants = {
  default: "bg-primary-600 text-white hover:bg-primary-600/90 shadow-sm",
  destructive: "bg-danger text-white hover:bg-danger/90 shadow-sm",
  outline: "border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-900",
  secondary: "bg-neutral-100 text-neutral-900 hover:bg-neutral-100/80",
  ghost: "hover:bg-neutral-100 hover:text-neutral-900",
  link: "text-primary-600 underline-offset-4 hover:underline",
}

const buttonSizes = {
  default: "h-10 px-4 py-2",
  sm: "h-9 rounded-md px-3",
  lg: "h-11 rounded-md px-8",
  icon: "h-10 w-10",
}

const Button = React.forwardRef(({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }
