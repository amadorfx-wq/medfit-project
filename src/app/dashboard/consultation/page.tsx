"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Settings, AlertCircle, ShieldCheck, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function PatientConsultationRoom() {
    const router = useRouter();
    const { currentUser } = useAuth();

    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [isInWaitingRoom, setIsInWaitingRoom] = useState(true);

    // Mock Connection Sequence
    useEffect(() => {
        const timer1 = setTimeout(() => {
            setIsConnected(true);
            toast("Hardware Connected", {
                description: "Camera and Microphone successfully initialized.",
                icon: <Settings className="w-4 h-4 text-white/50" />
            });
        }, 1500);

        return () => {
            clearTimeout(timer1);
        };
    }, []);

    if (!currentUser) return null;

    const handleLeaveCall = () => {
        toast("Consultation Ended", {
            description: "You have securely disconnected from the room."
        });
        router.push("/dashboard");
    };

    return (
        <div className="flex-1 flex flex-col h-[calc(100vh-theme(spacing.16))] sm:h-screen bg-black overflow-hidden relative">

            {/* Header / Top Bar */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-20 pointer-events-none">
                <div className="pointer-events-auto flex items-center gap-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-4 py-2">
                    <ShieldCheck className="w-5 h-5 text-[#a10c22]" />
                    <div>
                        <h2 className="text-white text-sm font-medium leading-none">Secure MedFit Room</h2>
                        <span className="text-white/50 text-xs">End-to-End Encrypted (HIPAA)</span>
                    </div>
                </div>

                <div className="pointer-events-auto">
                    <Badge variant="outline" className={`bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1.5 flex items-center gap-2 ${isInWaitingRoom ? 'text-[#a10c22]' : 'text-[#a10c22]'}`}>
                        <div className={`w-2 h-2 rounded-full animate-pulse ${isInWaitingRoom ? 'bg-[#a10c22]' : 'bg-[#a10c22]'}`} />
                        {isInWaitingRoom ? 'Waiting for Provider...' : 'Call Active'}
                    </Badge>
                </div>
            </div>

            {/* Main Video Area */}
            <div className="flex-1 relative flex items-center justify-center p-4 sm:p-8">
                {/* Simulated Remote Feed (The Doctor) */}
                <div className="w-full h-full max-w-7xl mx-auto rounded-2xl overflow-hidden relative bg-[#0C1420] border border-white/5 shadow-2xl flex items-center justify-center group">

                    {isInWaitingRoom ? (
                        <div className="text-center animate-in fade-in zoom-in duration-500 delay-300">
                            <div className="w-24 h-24 rounded-full bg-white/5 mx-auto mb-6 flex items-center justify-center border border-white/10 relative">
                                <UserCircle2 className="w-12 h-12 text-white/20" />
                                <div className="absolute inset-0 rounded-full border border-[#a10c22]/30 animate-ping" />
                            </div>
                            <h3 className="font-serif text-3xl text-white mb-3">Your Provider will join shortly.</h3>
                            <p className="text-white/50 max-w-md mx-auto">
                                Please ensure you are in a quiet, well-lit environment. Your consultative review for <strong>Treatment</strong> will begin momentarily.
                            </p>
                        </div>
                    ) : (
                        // Placeholder for Actual Video Feed
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10">
                            <div className="absolute bottom-6 left-6">
                                <span className="bg-black/60 backdrop-blur-xl border border-white/10 text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-2xl">
                                    Dr. Jonathan Smith, MD
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Self View (PiP) */}
                    <div className="absolute bottom-6 right-6 w-32 sm:w-48 aspect-[3/4] sm:aspect-video bg-[#1A2332] rounded-xl border-2 border-white/10 shadow-2xl overflow-hidden z-20 flex items-center justify-center transition-transform hover:scale-105 cursor-move">
                        <UserCircle2 className="w-12 h-12 text-white/10 absolute" />

                        {/* Status overlays in PiP */}
                        {(isMuted || isVideoOff) && (
                            <div className="absolute bottom-2 left-2 flex gap-1 bg-black/60 backdrop-blur-md rounded-md p-1 border border-white/5">
                                {isMuted && <MicOff className="w-3 h-3 text-red-400" />}
                                {isVideoOff && <VideoOff className="w-3 h-3 text-red-400" />}
                            </div>
                        )}
                        <span className="absolute bottom-2 right-2 text-[10px] text-white/50 bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-md">You</span>
                    </div>

                </div>
            </div>

            {/* Controls Bar (Bottom) */}
            <div className="h-24 bg-gradient-to-t from-black to-transparent flex items-end justify-center pb-6 gap-3 z-30">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsMuted(!isMuted)}
                    className={`h-14 w-14 rounded-full border-white/10 backdrop-blur-xl transition-all ${isMuted ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/30' : 'bg-black/40 text-white hover:bg-white/10'}`}
                >
                    {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </Button>

                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsVideoOff(!isVideoOff)}
                    className={`h-14 w-14 rounded-full border-white/10 backdrop-blur-xl transition-all ${isVideoOff ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/30' : 'bg-black/40 text-white hover:bg-white/10'}`}
                >
                    {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                </Button>

                <Button
                    variant="default"
                    size="icon"
                    onClick={handleLeaveCall}
                    className="h-14 w-14 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-900/20 ml-4 transition-transform hover:scale-105"
                >
                    <PhoneOff className="w-6 h-6" />
                </Button>
            </div>
        </div>
    );
}
