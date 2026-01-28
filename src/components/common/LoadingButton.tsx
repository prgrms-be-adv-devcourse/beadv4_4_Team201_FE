'use client';

import { forwardRef } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VariantProps } from 'class-variance-authority';

interface LoadingButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    loading?: boolean;
    loadingText?: string;
    asChild?: boolean;
}

/**
 * Button component with built-in loading state
 *
 * Usage:
 * <LoadingButton loading={isPending}>Submit</LoadingButton>
 * <LoadingButton loading={isPending} loadingText="Saving...">Save</LoadingButton>
 */
const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
    (
        {
            children,
            loading = false,
            loadingText,
            disabled,
            className,
            variant,
            size,
            ...props
        },
        ref
    ) => {
        return (
            <Button
                ref={ref}
                variant={variant}
                size={size}
                disabled={disabled || loading}
                className={cn(className)}
                {...props}
            >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading && loadingText ? loadingText : children}
            </Button>
        );
    }
);

LoadingButton.displayName = 'LoadingButton';

export { LoadingButton };
