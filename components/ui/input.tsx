import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  suffix?: string;
  prefixText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, suffix, prefixText, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {prefixText && (
          <span className="absolute left-3 text-xs font-semibold text-neutral-500 select-none">
            {prefixText}
          </span>
        )}
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-lg border border-neutral-700 bg-[#2b3139] px-3 py-2 text-sm text-white placeholder-neutral-500 transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:cursor-not-allowed disabled:opacity-50",
            prefixText && "pl-14",
            suffix && "pr-12",
            className
          )}
          ref={ref}
          {...props}
        />
        {suffix && (
          <span className="absolute right-3 text-xs font-semibold text-neutral-400 select-none">
            {suffix}
          </span>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
