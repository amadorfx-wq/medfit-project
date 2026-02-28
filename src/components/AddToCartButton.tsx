"use client";

import { Button } from "@/components/ui/button";
import { useAppContext } from "@/lib/store";
import { toast } from "sonner";
import { ShoppingCart } from "lucide-react";

interface AddToCartButtonProps {
    item: { name: string; price: string };
    className?: string;
    variant?: "default" | "outline" | "secondary" | "ghost";
    label?: string;
}

export function AddToCartButton({ item, className, variant = "default", label = "Add to Request" }: AddToCartButtonProps) {
    const { addToCart } = useAppContext();

    return (
        <Button
            variant={variant}
            className={className || "bg-[#1A1A1A] hover:bg-[#2D2D2D] text-white font-medium shadow-xl transition-all hover:scale-105"}
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
