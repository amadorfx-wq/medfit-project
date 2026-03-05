"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePatients } from "@/hooks/usePatients";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Mail, Phone, MapPin, Shield } from "lucide-react";

export default function ProfilePage() {
    const { currentUser } = useAuth();
    const { patients } = usePatients();
    const [address, setAddress] = useState("123 Luxury Ave, Atlanta, GA 30305");
    const addressInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!addressInputRef.current || typeof window === "undefined") return;
        const init = () => {
            if (!window.google?.maps?.places) { setTimeout(init, 500); return; }
            const ac = new window.google.maps.places.Autocomplete(addressInputRef.current!, {
                types: ["address"],
                componentRestrictions: { country: "us" },
                fields: ["formatted_address"],
            });
            ac.addListener("place_changed", () => {
                const place = ac.getPlace();
                if (place?.formatted_address) setAddress(place.formatted_address);
            });
        };
        init();
    }, []);

    if (!currentUser) return null;

    const patientData = patients.find(p => p.id === currentUser.id);

    return (
        <div className="p-6 md:p-12 max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mb-10 border-b border-border/50 pb-6">
                <h1 className="text-3xl md:text-4xl font-serif mb-2">My Profile</h1>
                <p className="text-muted-foreground">Manage your personal information and account settings.</p>
            </header>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Left Col: Avatar & Status */}
                <div className="space-y-6">
                    <Card className="bg-card border-border/50 text-center flex flex-col items-center pt-8 pb-6">
                        <Avatar className="w-24 h-24 border-2 border-primary mb-4">
                            <AvatarFallback className="bg-primary/20 text-primary text-3xl font-serif">{currentUser.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <CardTitle className="font-serif text-xl">{currentUser.name}</CardTitle>
                        <CardDescription className="mt-1">Active Patient Member</CardDescription>

                        <div className="w-full px-6 mt-6">
                            <Button variant="outline" className="w-full border-white/10 hover:bg-white/5">Change Photo</Button>
                        </div>
                    </Card>

                    <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
                        <CardContent className="p-5 flex items-start gap-4">
                            <Shield className="w-8 h-8 text-primary shrink-0" />
                            <div>
                                <h4 className="font-medium text-primary mb-1">HIPAA Verified</h4>
                                <p className="text-xs text-muted-foreground">Your account and medical data are protected by bank-level 256-bit encryption.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Col: Forms */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="bg-card border-border/50">
                        <CardHeader>
                            <CardTitle className="font-serif flex items-center gap-2">
                                <User className="w-5 h-5 text-muted-foreground" />
                                Personal Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input id="firstName" defaultValue={currentUser.name.split(' ')[0]} disabled className="bg-white/5 border-white/10 text-muted-foreground" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input id="lastName" defaultValue={currentUser.name.split(' ')[1] || ""} disabled className="bg-white/5 border-white/10 text-muted-foreground" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="flex items-center gap-2"><Mail className="w-3 h-3" /> Email Address</Label>
                                <Input id="email" defaultValue={patientData?.email} className="bg-white/5 border-white/10" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="flex items-center gap-2"><Phone className="w-3 h-3" /> Phone Number</Label>
                                <Input id="phone" defaultValue="(555) 123-4567" className="bg-white/5 border-white/10" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address" className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> Shipping Address</Label>
                                <input
                                    id="address"
                                    ref={addressInputRef}
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="flex h-10 w-full rounded-md border text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-white/10 bg-white/5 text-white px-3"
                                    placeholder="Search your real shipping address..."
                                />
                            </div>
                            <Button className="mt-4 bg-[#8FA677] hover:bg-[#8FA677]/90 text-black font-medium">Save Changes</Button>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border/50">
                        <CardHeader>
                            <CardTitle className="font-serif text-destructive">Danger Zone</CardTitle>
                            <CardDescription>Actions related to your account security.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                                <div>
                                    <p className="font-medium">Password Reset</p>
                                    <p className="text-xs text-muted-foreground">Request a secure link to reset your account password.</p>
                                </div>
                                <Button variant="outline" className="border-border hover:bg-white/10">Reset</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
