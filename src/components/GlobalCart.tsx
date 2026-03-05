"use client";

import { useState } from "react";
import { ShoppingCart, ShieldCheck, X } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { usePathname } from "next/navigation";

export function GlobalCart() {
    const { cart, removeFromCart, submitCartRequest } = useCart();
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const pathname = usePathname();

    // Optionally hide on login/admin pages
    if (pathname.startsWith('/admin') || pathname === '/login') return null;

    if (cart.length === 0 && !isCartOpen) return null;

    return (
        <>
            {/* Floating Cart Button */}
            {cart.length > 0 && (
                <button
                    onClick={() => setIsCartOpen(true)}
                    className="fixed bottom-24 md:bottom-8 right-6 md:right-8 bg-[#a10c22] text-black w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-105 transition-transform z-50 animate-in fade-in zoom-in"
                >
                    <ShoppingCart className="w-6 h-6" />
                    <span className="absolute -top-1 -right-1 bg-white text-black text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border border-black">
                        {cart.length}
                    </span>
                </button>
            )}

            {/* Cart Modal (Order Request) */}
            <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
                <DialogContent className="bg-[#0C1420] border-white/10 text-white sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="font-serif text-2xl flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-[#a10c22]" />
                            Review Order Request
                        </DialogTitle>
                        <DialogDescription className="text-white/50">
                            Submit your clinical request to the medical team for approval. No payment is required until authorized by your provider.
                        </DialogDescription>
                    </DialogHeader>

                    {cart.length === 0 ? (
                        <div className="py-12 text-center text-white/50">
                            <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p>Your request list is empty.</p>
                        </div>
                    ) : (
                        <div className="space-y-4 py-4">
                            <div className="max-h-[40vh] overflow-y-auto space-y-3 custom-scrollbar pr-2">
                                {cart.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-3">
                                        <div className="flex-1 pr-4">
                                            <p className="font-medium text-sm text-white">{item.name}</p>
                                            <p className="font-serif text-[#a10c22] text-xs mt-1">{item.price}</p>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="w-8 h-8 shrink-0 rounded-full bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-red-400 flex items-center justify-center transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4 border-t border-white/10">
                                <Button
                                    className="w-full bg-[#a10c22] text-black hover:bg-[#a10c22]/90 h-12 text-base font-medium transition-all"
                                    disabled={isSubmitting}
                                    onClick={async () => {
                                        setIsSubmitting(true);
                                        await submitCartRequest();
                                        setIsSubmitting(false);
                                        setIsCartOpen(false);
                                        toast.success("Request successfully sent to the clinical team!");
                                    }}
                                >
                                    {isSubmitting ? "Sending Request..." : "Submit Approval Request"}
                                </Button>
                                <p className="text-xs text-center text-white/40 mt-4">
                                    HIPAA Compliant Secure Transfer
                                </p>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
