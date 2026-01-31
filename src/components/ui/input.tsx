import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * 29CM-Inspired Input
 * - Clean underline or thin border style
 * - Black focus state
 * - Minimal styling
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 bg-transparent px-0 py-2 text-base transition-colors placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-40 md:text-sm",
        "border-b border-border focus:border-foreground focus:outline-none",
        className
      )}
      {...props}
    />
  )
}

export { Input }
