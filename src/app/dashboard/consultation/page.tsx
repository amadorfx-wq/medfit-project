"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import dynamic from "next/dynamic";
import {
    Mic, MicOff, Video, VideoOff, PhoneOff,
    ShieldCheck, UserCircle2, AlertCircle, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

// Daily.co React SDK — SSR disabled (browser-only WebRTC)
const DailyProvider = dynamic(
    () => import("@daily-co/daily-react").then((m) => m.DailyProvider),
    { ssr: false }
);
const DailyVideo = dynamic(
    () => import("@daily-co/daily-react").then((m) => m.DailyVideo),
    { ssr: false }
);

// Hooks must be imported at module level even though they're browser-only;
// they are only ever called from within a DailyProvider tree.
import {
    useDaily,
    useDailyEvent,
    useLocalSessionId,
    useParticipantIds,
} from "@daily-co/daily-react";

// ─── Inner component — all Daily hooks live here ──────────────────────────────
function DailyRoom({
    roomUrl,
    token,
    onLeave,
}: {
    roomUrl: string;
    token: string;
    onLeave: () => void;
}) {
    const callObject = useDaily();
    const localSessionId = useLocalSessionId();
    const remoteIds = useParticipantIds({ filter: "remote" });

    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const isInWaitingRoom = remoteIds.length === 0;

    // Join the Daily room once the call object is ready
    useEffect(() => {
        if (!callObject) return;
        callObject.join({ url: roomUrl, token }).catch((err) => {
            console.error("[Daily] join error:", err);
        });
        return () => void callObject.leave();
    }, [callObject, roomUrl, token]);

    useDailyEvent(
        "joined-meeting",
        useCallback(() => {
            toast.success("Connected", {
                description: "Camera and microphone initialized.",
            });
        }, [])
    );

    const toggleAudio = () => {
        // setLocalAudio(true) = enable (unmute); (false) = disable (mute)
        callObject?.setLocalAudio(isMuted);
        setIsMuted((m) => !m);
    };

    const toggleVideo = () => {
        callObject?.setLocalVideo(isVideoOff);
        setIsVideoOff((v) => !v);
    };

    const handleLeave = async () => {
        await callObject?.leave();
        toast("Consultation Ended", {
            description: "You have securely disconnected from the room.",
        });
        onLeave();
    };

    return (
        <div className="flex-1 flex flex-col h-[calc(100vh-theme(spacing.16))] sm:h-screen bg-black overflow-hidden relative">

            {/* Header */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-20 pointer-events-none">
                <div className="pointer-events-auto flex items-center gap-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-4 py-2">
                    <ShieldCheck className="w-5 h-5 text-[#a10c22]" />
                    <div>
                        <h2 className="text-white text-sm font-medium leading-none">Secure MedFit Room</h2>
                        <span className="text-white/50 text-xs">End-to-End Encrypted (HIPAA)</span>
                    </div>
                </div>

                <div className="pointer-events-auto">
                    <Badge
                        variant="outline"
                        className="bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1.5 flex items-center gap-2 text-[#a10c22]"
                    >
                        <div className="w-2 h-2 rounded-full bg-[#a10c22] animate-pulse" />
                        {isInWaitingRoom ? "Waiting for Provider…" : "Call Active"}
                    </Badge>
                </div>
            </div>

            {/* Main Video Area */}
            <div className="flex-1 relative flex items-center justify-center p-4 sm:p-8">
                <div className="w-full h-full max-w-7xl mx-auto rounded-2xl overflow-hidden relative bg-[#0C1420] border border-white/5 shadow-2xl flex items-center justify-center">

                    {isInWaitingRoom ? (
                        <div className="text-center animate-in fade-in zoom-in duration-500">
                            <div className="w-24 h-24 rounded-full bg-white/5 mx-auto mb-6 flex items-center justify-center border border-white/10 relative">
                                <UserCircle2 className="w-12 h-12 text-white/20" />
                                <div className="absolute inset-0 rounded-full border border-[#a10c22]/30 animate-ping" />
                            </div>
                            <h3 className="font-serif text-3xl text-white mb-3">Your Provider will join shortly.</h3>
                            <p className="text-white/50 max-w-md mx-auto">
                                Please ensure you are in a quiet, well-lit environment. Your consultative review will begin momentarily.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Remote participant (provider) */}
                            <DailyVideo
                                sessionId={remoteIds[0]}
                                type="video"
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div className="absolute bottom-6 left-6 z-10">
                                <span className="bg-black/60 backdrop-blur-xl border border-white/10 text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-2xl">
                                    Provider
                                </span>
                            </div>
                        </>
                    )}

                    {/* Self View (PiP) */}
                    {localSessionId && (
                        <div className="absolute bottom-6 right-6 w-32 sm:w-48 aspect-video bg-[#1A2332] rounded-xl border-2 border-white/10 shadow-2xl overflow-hidden z-20">
                            <DailyVideo
                                sessionId={localSessionId}
                                type="video"
                                mirror
                                className="w-full h-full object-cover"
                            />
                            {(isMuted || isVideoOff) && (
                                <div className="absolute bottom-2 left-2 flex gap-1 bg-black/60 backdrop-blur-md rounded-md p-1 border border-white/5">
                                    {isMuted && <MicOff className="w-3 h-3 text-red-400" />}
                                    {isVideoOff && <VideoOff className="w-3 h-3 text-red-400" />}
                                </div>
                            )}
                            <span className="absolute bottom-2 right-2 text-[10px] text-white/50 bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-md">
                                You
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Controls */}
            <div className="h-24 bg-gradient-to-t from-black to-transparent flex items-end justify-center pb-6 gap-3 z-30">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleAudio}
                    className={`h-14 w-14 rounded-full border-white/10 backdrop-blur-xl transition-all ${isMuted ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/30" : "bg-black/40 text-white hover:bg-white/10"}`}
                >
                    {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </Button>

                <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleVideo}
                    className={`h-14 w-14 rounded-full border-white/10 backdrop-blur-xl transition-all ${isVideoOff ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/30" : "bg-black/40 text-white hover:bg-white/10"}`}
                >
                    {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                </Button>

                <Button
                    variant="default"
                    size="icon"
                    onClick={handleLeave}
                    className="h-14 w-14 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-900/20 ml-4 transition-transform hover:scale-105"
                >
                    <PhoneOff className="w-6 h-6" />
                </Button>
            </div>
        </div>
    );
}

// ─── Outer component — fetches token, renders DailyProvider ──────────────────
export default function PatientConsultationRoom() {
    const router = useRouter();
    const { currentUser } = useAuth();

    const [roomData, setRoomData] = useState<{ roomUrl: string; token: string } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isFetching, setIsFetching] = useState(true);

    useEffect(() => {
        if (!currentUser) return;

        fetch("/api/telehealth/patient-token", { method: "POST" })
            .then((r) => r.json())
            .then((d) => {
                if (d.error) {
                    setError(d.error);
                } else {
                    setRoomData({ roomUrl: d.roomUrl, token: d.token });
                }
            })
            .catch(() => setError("Could not connect to the session service."))
            .finally(() => setIsFetching(false));
    }, [currentUser]);

    if (!currentUser) return null;

    if (isFetching) {
        return (
            <div className="flex h-screen items-center justify-center bg-black">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 text-[#a10c22] animate-spin mx-auto mb-4" />
                    <p className="text-white/50 text-sm">Connecting to your secure room…</p>
                </div>
            </div>
        );
    }

    if (error || !roomData) {
        return (
            <div className="flex h-screen items-center justify-center bg-black">
                <div className="text-center max-w-md px-6">
                    <AlertCircle className="w-12 h-12 text-[#a10c22] mx-auto mb-4" />
                    <h2 className="text-white font-serif text-2xl mb-2">Session Not Available</h2>
                    <p className="text-white/50 text-sm mb-6">
                        {error || "Your provider has not started the session yet. Please wait and try again."}
                    </p>
                    <Button
                        variant="outline"
                        className="border-white/10 text-white hover:bg-white/5"
                        onClick={() => router.push("/dashboard")}
                    >
                        Return to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <DailyProvider>
            <DailyRoom
                roomUrl={roomData.roomUrl}
                token={roomData.token}
                onLeave={() => router.push("/dashboard")}
            />
        </DailyProvider>
    );
}
