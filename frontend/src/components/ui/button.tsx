import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-[12px] text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/20 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-[var(--shadow-btn-blue)] hover:shadow-[var(--shadow-btn-blue-hover)] hover:bg-primary/90 rounded-full",
        secondary: "bg-secondary text-secondary-foreground shadow-elevation-1 hover:bg-secondary/80 hover:shadow-[0_16px_30px_-18px_hsl(var(--foreground)/0.18)]",
        outline: "border border-border/70 bg-background/85 shadow-elevation-1 hover:border-primary/35 hover:bg-primary/5 hover:text-foreground",
        ghost: "hover:bg-secondary hover:text-secondary-foreground hover:shadow-[0_12px_24px_-18px_hsl(var(--foreground)/0.18)]",
        heroOutline: "border-2 border-primary/50 bg-background text-primary font-semibold hover:border-primary hover:bg-primary/10",
        accent: "bg-accent text-accent-foreground font-semibold hover:opacity-95 hover:shadow-[0_18px_34px_-18px_hsl(var(--accent)/0.45)]",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-11 rounded-xl px-7 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-10 w-10 rounded-lg",
        pill: "h-11 px-[18px] py-[9px] rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
