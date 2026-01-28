'use client';

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
    fallback?: string;
    wrapperClassName?: string;
}

/**
 * Optimized Image component with:
 * - Blur placeholder
 * - Fallback image on error
 * - Loading state handling
 * - Responsive sizing
 */
export function OptimizedImage({
    src,
    alt,
    fallback = '/placeholder-image.png',
    className,
    wrapperClassName,
    ...props
}: OptimizedImageProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    const imageSrc = error ? fallback : src;

    return (
        <div className={cn('relative overflow-hidden', wrapperClassName)}>
            <Image
                src={imageSrc}
                alt={alt}
                className={cn(
                    'transition-opacity duration-300',
                    isLoading ? 'opacity-0' : 'opacity-100',
                    className
                )}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                    setError(true);
                    setIsLoading(false);
                }}
                {...props}
            />
            {isLoading && (
                <div className="absolute inset-0 bg-muted animate-pulse" />
            )}
        </div>
    );
}

/**
 * Product image with standard sizing and optimization
 */
export function ProductImage({
    src,
    alt,
    size = 'md',
    className,
    ...props
}: Omit<OptimizedImageProps, 'width' | 'height'> & {
    size?: 'sm' | 'md' | 'lg';
}) {
    const dimensions = {
        sm: { width: 64, height: 64 },
        md: { width: 128, height: 128 },
        lg: { width: 256, height: 256 },
    };

    return (
        <OptimizedImage
            src={src}
            alt={alt}
            width={dimensions[size].width}
            height={dimensions[size].height}
            className={cn('object-cover rounded-lg', className)}
            {...props}
        />
    );
}

/**
 * Avatar image with circular styling
 */
export function AvatarImage({
    src,
    alt,
    size = 'md',
    className,
    ...props
}: Omit<OptimizedImageProps, 'width' | 'height'> & {
    size?: 'sm' | 'md' | 'lg';
}) {
    const dimensions = {
        sm: 32,
        md: 48,
        lg: 64,
    };

    return (
        <OptimizedImage
            src={src}
            alt={alt}
            width={dimensions[size]}
            height={dimensions[size]}
            fallback="/default-avatar.png"
            className={cn('object-cover rounded-full', className)}
            {...props}
        />
    );
}
