"use client";

import { useState, useCallback, createContext, useContext, ReactNode } from "react";
import { CartItem } from "@/types/cart";
import { AuditService } from "@/services/audit.service";
import { useAuth } from "@/hooks/useAuth";
import { getTenantIdFromBrowser } from "@/lib/supabase";

interface CartContextType {
    cart: CartItem[];
    addToCart: (item: Omit<CartItem, "id">) => void;
    removeFromCart: (id: string) => void;
    clearCart: () => void;
    submitCartRequest: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const { currentUser } = useAuth();
    const [cart, setCart] = useState<CartItem[]>([]);

    const addToCart = useCallback((item: Omit<CartItem, "id">) => {
        setCart(prev => [...prev, { ...item, id: `cart_item_${Date.now()}_${Math.random().toString(36).substring(2, 9)}` }]);
    }, []);

    const removeFromCart = useCallback((id: string) => {
        setCart(prev => prev.filter(c => c.id !== id));
    }, []);

    const clearCart = useCallback(() => setCart([]), []);

    const submitCartRequest = useCallback(async () => {
        if (cart.length === 0) return;

        const pId = currentUser?.id || "guest";
        const pName = currentUser?.role === "PATIENT" ? currentUser.name : "New Lead (Guest)";
        const content = `Requested ${cart.length} item(s): ` + cart.map(c => c.name).join(", ");

        const tenantId = getTenantIdFromBrowser() || undefined;

        // Dispatch Firebase/DB notification asíncrona
        AuditService.sendAdminNotification({
            patientId: pId,
            patientName: pName,
            type: "CART_REQUEST",
            content: content,
            data: { items: [...cart] }
        }, tenantId);

        AuditService.logEvent({
            action: "CART_REQUEST_SUBMITTED",
            category: "BILLING",
            details: `Submitted request for ${cart.length} item(s).`,
            userId: pId,
            userName: pName,
            userRole: currentUser?.role || ("PATIENT" as any),
        }, tenantId);

        // Simulate network delay
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                setCart([]);
                resolve();
            }, 1000);
        });
    }, [cart, currentUser]);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, submitCartRequest }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
