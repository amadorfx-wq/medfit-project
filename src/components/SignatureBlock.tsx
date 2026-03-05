"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, PenLine, RotateCcw, CheckCircle2, Lock, Calendar } from "lucide-react";
import { tenant } from "@/lib/theme.config";

export interface SignatureData {
    fullName: string;
    signatureDataUrl: string;
    timestamp: string;
    ipHash?: string; // future: server-side IP
}

interface SignatureBlockProps {
    formTitle: string;
    onSign: (data: SignatureData) => void;
    signed?: SignatureData | null;
    className?: string;
}

export function SignatureBlock({ formTitle, onSign, signed, className = "" }: SignatureBlockProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSigned, setHasSigned] = useState(false);
    const [fullName, setFullName] = useState("");
    const [step, setStep] = useState<"name" | "sign" | "done">("name");
    const lastPos = useRef<{ x: number; y: number } | null>(null);

    // ─── Canvas setup ────────────────────────────────────────────────────────
    const setupCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        ctx.strokeStyle = "#102A52";
        ctx.lineWidth = 1.8;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, rect.width, rect.height);
    }, []);

    useEffect(() => {
        if (step === "sign") {
            setTimeout(setupCanvas, 50);
        }
    }, [step, setupCanvas]);

    // ─── Drawing helpers ──────────────────────────────────────────────────────
    const getPos = (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } => {
        const canvas = canvasRef.current!;
        const rect = canvas.getBoundingClientRect();
        if ("touches" in e) {
            const t = e.touches[0];
            return { x: t.clientX - rect.left, y: t.clientY - rect.top };
        }
        return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
    };

    const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        setIsDrawing(true);
        setHasSigned(true);
        const pos = getPos(e);
        lastPos.current = pos;
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx) { ctx.beginPath(); ctx.moveTo(pos.x, pos.y); }
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        if (!isDrawing) return;
        const pos = getPos(e);
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx && lastPos.current) {
            ctx.beginPath();
            ctx.moveTo(lastPos.current.x, lastPos.current.y);
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
        }
        lastPos.current = pos;
    };

    const endDraw = () => { setIsDrawing(false); lastPos.current = null; };

    const clearCanvas = () => {
        setHasSigned(false);
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (ctx) {
            const rect = canvas.getBoundingClientRect();
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, rect.width, rect.height);
        }
    };

    // ─── Finalize signature ────────────────────────────────────────────────────
    const handleConfirmSign = () => {
        if (!hasSigned || !canvasRef.current) return;
        const dataUrl = canvasRef.current.toDataURL("image/png");
        const data: SignatureData = {
            fullName,
            signatureDataUrl: dataUrl,
            timestamp: new Date().toISOString(),
        };
        onSign(data);
        setStep("done");
    };

    // ─── If already signed externally ─────────────────────────────────────────
    const displayData = signed ?? null;
    if (displayData || step === "done") {
        const sigData = signed || { fullName, timestamp: new Date().toISOString(), signatureDataUrl: "" };
        return (
            <div className={`bg-[#a10c22]/10 border border-[#a10c22]/30 rounded-2xl p-6 ${className}`}>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-[#a10c22]/20 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-[#a10c22]" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-[#102A52]">Document Electronically Signed</p>
                        <p className="text-xs text-[#102A52]/60">{formTitle}</p>
                    </div>
                    <Lock className="w-4 h-4 text-[#a10c22] ml-auto" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-[#102A52]/70">
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-[#102A52]/40 mb-1">Signed by</p>
                        <p className="font-serif italic text-base text-[#102A52]">{sigData.fullName}</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-[#102A52]/40 mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Signed at</p>
                        <p className="font-mono">{new Date(sigData.timestamp).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</p>
                    </div>
                </div>
                <p className="text-[10px] text-[#102A52]/40 mt-4 border-t border-[#E5E7EB] pt-3">
                    {tenant.legal.eSignDisclaimer}
                </p>
            </div>
        );
    }

    return (
        <div className={`border border-[#E5E7EB] rounded-2xl overflow-hidden ${className}`}>
            {/* Header */}
            <div className="bg-[white] border-b border-[#E5E7EB] px-5 py-4 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-[#a10c22]" />
                <div>
                    <p className="text-sm font-semibold text-[#102A52]">Electronic Signature Required</p>
                    <p className="text-xs text-[#102A52]/60">Legally binding under E-SIGN Act & UETA</p>
                </div>
            </div>

            <div className="p-5 bg-white space-y-5">
                {/* Step 1: Full Name */}
                {step === "name" && (
                    <div className="space-y-4 animate-in fade-in">
                        <div>
                            <Label className="text-xs font-semibold text-[#102A52]/60 uppercase tracking-wider mb-2 block">
                                Full Legal Name *
                            </Label>
                            <Input
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Type your full legal name exactly as it appears on your ID"
                                className="border-0 border-b border-[#E5E7EB] bg-transparent rounded-none focus-visible:ring-0 focus-visible:border-[#a10c22] px-0 h-10 text-[#102A52] font-serif italic text-lg"
                            />
                            <p className="text-xs text-[#102A52]/40 mt-2">
                                This name will be permanently attached to the signed document.
                            </p>
                        </div>
                        <Button
                            type="button"
                            disabled={fullName.trim().length < 3}
                            onClick={() => setStep("sign")}
                            className="w-full h-11 rounded-xl bg-[#a10c22] hover:bg-[#7D9365] text-white font-medium gap-2"
                        >
                            <PenLine className="w-4 h-4" />
                            Continue to Draw Signature
                        </Button>
                    </div>
                )}

                {/* Step 2: Draw signature */}
                {step === "sign" && (
                    <div className="space-y-4 animate-in fade-in">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold text-[#102A52]/60 uppercase tracking-wider">Draw Your Signature</p>
                                <p className="text-xs text-[#102A52]/40 mt-0.5">Signing for: <span className="font-serif italic text-[#102A52]">{fullName}</span></p>
                            </div>
                            <button type="button" onClick={clearCanvas} className="flex items-center gap-1 text-xs text-[#102A52]/40 hover:text-[#102A52] transition-colors">
                                <RotateCcw className="w-3 h-3" /> Clear
                            </button>
                        </div>

                        <div className="relative border-2 border-dashed border-[#E5E7EB] rounded-xl overflow-hidden bg-white">
                            <canvas
                                ref={canvasRef}
                                className="w-full touch-none cursor-crosshair"
                                style={{ height: "160px", display: "block" }}
                                onMouseDown={startDraw}
                                onMouseMove={draw}
                                onMouseUp={endDraw}
                                onMouseLeave={endDraw}
                                onTouchStart={startDraw}
                                onTouchMove={draw}
                                onTouchEnd={endDraw}
                            />
                            {!hasSigned && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <p className="text-sm text-[#102A52]/20 font-light select-none">Sign here with finger or mouse</p>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <Button type="button" variant="outline" onClick={() => setStep("name")} className="flex-1 h-11 rounded-xl border-[#E5E7EB] text-[#102A52]">
                                Back
                            </Button>
                            <Button
                                type="button"
                                disabled={!hasSigned}
                                onClick={handleConfirmSign}
                                className="flex-[2] h-11 rounded-xl bg-[#102A52] hover:bg-[#333] text-white font-medium gap-2"
                            >
                                <Lock className="w-4 h-4" />
                                Confirm & Seal Signature
                            </Button>
                        </div>
                        <p className="text-[10px] text-center text-[#102A52]/30">
                            Once sealed, this signature cannot be modified. Today: {new Date().toLocaleDateString()} · {new Date().toLocaleTimeString()}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
