"use client";

import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import { ShoppingCart } from "lucide-react";

interface AddToCartButtonProps {
    item: { name: string; price: string };
    className?: string;
    variant?: "default" | "outline" | "secondary" | "ghost";
    label?: string;
}

export function AddToCartButton({ item, className, variant = "default", label = "Add to Request" }: AddToCartButtonProps) {
    const { addToCart } = useCart();

    return (
        <Button
            variant={variant}
            className={className || "bg-[#102A52] hover:bg-[#102A52] text-white font-medium shadow-xl transition-all hover:scale-105"}
            onClick={() => {
                addToCart(item);
                toast.success(`${item.name} added to your request list!`);
            }}
        >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {label}
        </Button>
    );
}
