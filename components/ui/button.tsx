import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-[#f0b90b] text-[#12161a] hover:bg-[#dfa600] shadow-md shadow-amber-500/10",
        destructive:
          "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30",
        outline:
          "border border-neutral-700 bg-transparent text-neutral-200 hover:bg-neutral-800 hover:text-white",
        secondary:
          "bg-neutral-800 text-neutral-100 hover:bg-neutral-700",
        ghost: "hover:bg-neutral-800 text-neutral-300 hover:text-white",
        link: "text-amber-400 underline-offset-4 hover:underline",
        long: "bg-[#0ecb81] text-[#12161a] hover:bg-[#0cb673] shadow-md shadow-emerald-500/15",
        short: "bg-[#f6465d] text-white hover:bg-[#e03a50] shadow-md shadow-rose-500/15",
        longOutline: "border-2 border-[#0ecb81] text-[#0ecb81] bg-[#0ecb81]/5 hover:bg-[#0ecb81]/15",
        shortOutline: "border-2 border-[#f6465d] text-[#f6465d] bg-[#f6465d]/5 hover:bg-[#f6465d]/15",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-lg px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
