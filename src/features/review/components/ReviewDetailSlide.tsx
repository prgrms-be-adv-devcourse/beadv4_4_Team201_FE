import Image from 'next/image';
import { Star, ThumbsUp } from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Review {
    id: string;
    imageUrl: string;
    userName: string;
    rating: number;
    content: string;
    productName: string;
    productBrand: string;
    productImage: string;
    date: string;
}

interface ReviewDetailSlideProps {
    review: Review | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ReviewDetailSlide({ review, open, onOpenChange }: ReviewDetailSlideProps) {
    if (!review) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-md p-0 overflow-y-auto">
                <SheetHeader className="p-4 border-b sr-only">
                    <SheetTitle>Review Detail</SheetTitle>
                    <SheetDescription>{review.userName}님의 {review.productName} 리뷰</SheetDescription>
                </SheetHeader>

                {/* Image Section */}
                <div className="relative aspect-square w-full bg-secondary">
                    <Image
                        src={review.imageUrl}
                        alt="Review Image"
                        fill
                        className="object-cover"
                    />
                </div>

                <div className="p-6 space-y-8 pb-24">
                    {/* User Info & Rating */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src="" />
                                <AvatarFallback>{review.userName[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm font-medium">{review.userName}</p>
                                <p className="text-xs text-muted-foreground">{review.date}</p>
                            </div>
                        </div>
                        <div className="flex text-yellow-500">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Review Content */}
                    <div>
                        <p className="text-base leading-relaxed whitespace-pre-wrap">
                            {review.content}
                        </p>
                    </div>

                    {/* Product Link Card */}
                    <div className="flex gap-4 p-4 border rounded-sm bg-gray-50">
                        <div className="relative w-16 h-16 bg-white shrink-0">
                            <Image
                                src={review.productImage}
                                alt={review.productName}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <p className="text-xs text-muted-foreground font-bold">{review.productBrand}</p>
                            <p className="text-sm truncate">{review.productName}</p>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t flex items-center justify-between">
                    <Button variant="outline" size="sm" className="gap-2">
                        <ThumbsUp className="w-4 h-4" />
                        도움이 돼요
                    </Button>
                    <Button variant="default" size="sm">
                        상품 보러가기
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
