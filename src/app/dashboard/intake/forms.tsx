"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, AlertCircle, MapPin } from "lucide-react";
import { SignatureBlock, SignatureData } from "@/components/SignatureBlock";

// Tell TypeScript about window.google (loaded via <Script> in layout.tsx)
declare global { interface Window { google: any; } }

// Native Google Maps Places Autocomplete — no library, direct API
interface AddressDetails { street: string; city: string; state: string; zip: string; }
function AddressAutocompleteSection({
    addressDetails,
    setAddressDetails,
    inputClasses,
    labelClasses,
}: {
    addressDetails: AddressDetails;
    setAddressDetails: (d: AddressDetails) => void;
    inputClasses: string;
    labelClasses: string;
}) {
    // useCallback ref = fires exactly when the DOM element mounts (works inside Dialog portals too)
    const inputCallbackRef = useCallback((inputEl: HTMLInputElement | null) => {
        if (!inputEl) return; // element unmounted

        const attachAutocomplete = () => {
            if (!window.google?.maps?.places) {
                setTimeout(attachAutocomplete, 300);
                return;
            }
            const ac = new window.google.maps.places.Autocomplete(inputEl, {
                types: ["address"],
                componentRestrictions: { country: "us" },
                fields: ["address_components", "formatted_address"],
            });

            ac.addListener("place_changed", () => {
                const place = ac.getPlace();
                if (!place?.address_components) return;

                let streetNumber = "", route = "", city = "", state = "", zip = "";
                for (const component of place.address_components) {
                    const types = component.types;
                    if (types.includes("street_number")) streetNumber = component.long_name;
                    if (types.includes("route")) route = component.long_name;
                    if (types.includes("locality") || types.includes("sublocality")) city = component.long_name;
                    if (types.includes("administrative_area_level_1")) state = component.short_name;
                    if (types.includes("postal_code")) zip = component.long_name;
                }

                setAddressDetails({
                    street: `${streetNumber} ${route}`.trim(),
                    city, state, zip,
                });
            });
        };

        attachAutocomplete();
    }, []);


    return (
        <div className="md:col-span-2 bg-white/50 p-6 rounded-2xl border border-[#E5E5E5]/60 shadow-sm">
            <Label className="text-xs font-semibold text-[#a10c22] uppercase tracking-wider mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Intelligent Address Search
            </Label>
            <input
                ref={inputCallbackRef}
                className="w-full h-12 px-4 rounded-xl border border-[#E5E5E5] bg-white text-[#1A1A1A] focus:outline-none focus:border-[#a10c22] focus:ring-1 focus:ring-[#a10c22] transition-all mb-4 placeholder:text-[#2D2D2D]/40"
                placeholder="Start typing your home address..."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <Label className={labelClasses}>Street Address</Label>
                    <Input required className={inputClasses} value={addressDetails.street} onChange={(e) => setAddressDetails({ ...addressDetails, street: e.target.value })} />
                </div>
                <div>
                    <Label className={labelClasses}>City</Label>
                    <Input required className={inputClasses} value={addressDetails.city} onChange={(e) => setAddressDetails({ ...addressDetails, city: e.target.value })} />
                </div>
                <div className="flex gap-4">
                    <div className="flex-1">
                        <Label className={labelClasses}>State</Label>
                        <Input required className={inputClasses} value={addressDetails.state} onChange={(e) => setAddressDetails({ ...addressDetails, state: e.target.value })} />
                    </div>
                    <div className="flex-1">
                        <Label className={labelClasses}>Zip</Label>
                        <Input required className={inputClasses} value={addressDetails.zip} onChange={(e) => setAddressDetails({ ...addressDetails, zip: e.target.value })} />
                    </div>
                </div>
            </div>
        </div>
    );
}


interface FormProps {
    onSubmit: () => void;
    isSubmitting: boolean;
}

// Light Luxury Theme Wrapper
interface FormLayoutProps {
    title: string;
    subtitle: string;
    step: number;
    totalSteps: number;
    children: React.ReactNode;
    icon?: React.ElementType;
}
const FormLayout = ({ title, subtitle, step, totalSteps, children }: FormLayoutProps) => (
    <div className="bg-[#F9F7F2] text-[#2D2D2D] p-6 md:p-12 rounded-[2rem] shadow-sm border border-[#E5E5E5]/50 w-full max-w-3xl mx-auto animate-in fade-in zoom-in-95 duration-500 relative overflow-hidden">
        {/* Subtle premium accent glow */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#a10c22]/50 to-transparent opacity-50"></div>

        <header className="mb-10 text-center">
            <div className="flex items-center justify-center gap-2 text-[#a10c22] mb-6">
                <ShieldCheck className="w-5 h-5" />
                <span className="text-[10px] font-semibold tracking-[0.2em] uppercase">Secure Clinical Form</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-serif text-[#1A1A1A] mb-3 leading-tight">{title}</h1>
            <p className="text-[#2D2D2D]/70 text-sm md:text-base max-w-lg mx-auto leading-relaxed">{subtitle}</p>
        </header>

        {totalSteps > 1 && (
            <div className="flex gap-2 mb-10 px-4 md:px-12">
                {Array.from({ length: totalSteps }).map((_, i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-700 ${i < step ? 'bg-[#a10c22] shadow-[0_0_10px_rgba(143,166,119,0.3)]' : 'bg-[#E5E5E5]'}`} />
                ))}
            </div>
        )}

        {children}
    </div>
);

// Form 1: Wellness Intake (Global)
export function WellnessIntakeForm({ onSubmit, isSubmitting }: FormProps) {
    const [step, setStep] = useState(1);
    const [signatureData, setSignatureData] = useState<SignatureData | null>(null);
    const [addressDetails, setAddressDetails] = useState({ street: "", city: "", state: "", zip: "" });

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        setStep(step + 1);
    };

    const handleFinalSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit();
    };


    const inputClasses = "border-0 border-b border-[#E5E5E5] bg-transparent rounded-none focus-visible:ring-0 focus-visible:border-[#a10c22] px-0 h-10 text-[#1A1A1A]";
    const labelClasses = "text-xs font-semibold text-[#2D2D2D]/60 uppercase tracking-wider mb-2 block";
    const textareaClasses = "w-full min-h-[60px] p-3 rounded-xl bg-white border border-[#E5E5E5] text-sm focus:outline-none focus:border-[#a10c22] resize-none text-[#1A1A1A]";

    if (step === 1) {
        return (
            <FormLayout title="Patient Form" subtitle="Personal Information & Chief Complaint" step={1} totalSteps={3}>
                <form onSubmit={handleNext} className="space-y-8 animate-in slide-in-from-right-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><Label className={labelClasses}>Name</Label><Input required className={inputClasses} /></div>
                        <div><Label className={labelClasses}>DOB</Label><Input type="date" required className={inputClasses} /></div>

                        <AddressAutocompleteSection
                            addressDetails={addressDetails}
                            setAddressDetails={setAddressDetails}
                            inputClasses={inputClasses}
                            labelClasses={labelClasses}
                        />

                        <div><Label className={labelClasses}>Phone</Label><Input type="tel" required className={inputClasses} /></div>
                        <div><Label className={labelClasses}>Email</Label><Input type="email" required className={inputClasses} /></div>
                        <div><Label className={labelClasses}>Emergency Contact Name</Label><Input required className={inputClasses} /></div>
                        <div><Label className={labelClasses}>Relationship</Label><Input required className={inputClasses} /></div>
                        <div className="md:col-span-2"><Label className={labelClasses}>Emergency Contact Phone Number</Label><Input required className={inputClasses} /></div>
                        <div className="md:col-span-2"><Label className={labelClasses}>How did you hear about us? (if referral please list name)</Label><Input className={inputClasses} /></div>
                    </div>

                    <div className="space-y-4">
                        <div><Label className={labelClasses}>What brings you to the office today?</Label><textarea required className={textareaClasses} /></div>
                        <div><Label className={labelClasses}>How does this concern/issue affect your daily life?</Label><textarea required className={textareaClasses} /></div>
                        <div><Label className={labelClasses}>What makes these symptoms better or worse?</Label><textarea required className={textareaClasses} /></div>
                    </div>

                    <Button type="submit" className="w-full h-14 rounded-2xl bg-[#a10c22] hover:bg-[#7D9365] text-white font-medium shadow-md">
                        Continue to Medical History
                    </Button>
                </form>
            </FormLayout>
        );
    }

    if (step === 2) {
        return (
            <FormLayout title="Medical History" subtitle="Conditions, Medications & Family History" step={2} totalSteps={3}>
                <form onSubmit={handleNext} className="space-y-8 animate-in slide-in-from-right-8">
                    <div className="space-y-6">
                        <div>
                            <Label className={labelClasses}>Please list any Conditions/Disease below as well as medications used for treatment.</Label>
                            <textarea className={textareaClasses} placeholder="Condition/Disease - Medication/Treatment" />
                        </div>
                        <div>
                            <Label className={labelClasses}>Please list any other medication/supplements you are taking:</Label>
                            <textarea className={textareaClasses} />
                        </div>
                        <div>
                            <Label className={labelClasses}>Please list any drug or food allergies:</Label>
                            <Input className={inputClasses} />
                        </div>
                        <div>
                            <Label className={labelClasses}>Do you tolerate B12 well?</Label>
                            <Input className={inputClasses} placeholder="Yes/No" />
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5]">
                            <Label className={labelClasses}>Have you ever had any of the following conditions (Check ALL that apply):</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-sm text-[#2D2D2D]">
                                {["Cancer of any kind", "Thyroid Disease", "HIV/AIDS", "Hepatitis/Liver Disease", "Heart Disease/Heart Attack/Myocardial Infarction", "High/Low Blood Pressure", "Hysterectomy", "Severe Headaches", "Hx of Depression/Anxiety", "Hx of Suicidality"].map(condition => (
                                    <label key={condition} className="flex items-center gap-2 cursor-pointer group">
                                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#a10c22] focus:ring-[#a10c22]" />
                                        <span className="group-hover:text-[#1A1A1A]">{condition}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <Label className={labelClasses}>Please list any significant FAMILY medical history including FAMILY HISTORY OF THYROID CANCER:</Label>
                            <textarea className={textareaClasses} />
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5]">
                            <Label className={labelClasses}>Please rate each of the following from 1 - 10 (1 being the worst/bad and 10 being the highest/excellent)</Label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                                {["Fatigue", "Stress", "Body aches", "Sexual Health", "Overall Well Being", "Confidence", "Sleep Quality", "Energy Level", "Digestive Health"].map(rating => (
                                    <div key={rating}>
                                        <span className="text-xs text-[#2D2D2D]/80 block mb-1">{rating}</span>
                                        <Input type="number" min="1" max="10" className={`${inputClasses} h-8`} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1 h-14 rounded-full border border-[#E5E5E5] text-[#2D2D2D] hover:bg-white hover:text-[#1A1A1A] font-medium tracking-wide transition-all">Back</Button>
                        <Button type="submit" className="flex-[2] h-14 rounded-full bg-[#a10c22] hover:bg-[#7D9365] text-white font-medium shadow-[0_0_15px_rgba(143,166,119,0.3)] transition-all duration-300 tracking-wide">Continue to Lifestyle</Button>
                    </div>
                </form>
            </FormLayout>
        );
    }

    return (
        <FormLayout title="Lifestyle & Consent" subtitle="System Review and Final Acknowledgment" step={3} totalSteps={3}>
            <form onSubmit={handleFinalSubmit} className="space-y-8 animate-in slide-in-from-right-8">
                <div className="grid grid-cols-2 gap-6">
                    <div><Label className={labelClasses}>Tobacco Use (Packs/Day)</Label><Input className={inputClasses} /></div>
                    <div><Label className={labelClasses}>Alcohol Use (Drinks/Day/Week)</Label><Input className={inputClasses} /></div>
                    <div><Label className={labelClasses}>Caffeine Use</Label><Input className={inputClasses} /></div>
                    <div><Label className={labelClasses}>Hours of sleep/night?</Label><Input className={inputClasses} /></div>
                </div>

                <div>
                    <Label className={labelClasses}>Briefly describe your exercise habits (Sedentary/Moderate/Daily/Heavy):</Label>
                    <textarea className={textareaClasses} />
                </div>
                <div>
                    <Label className={labelClasses}>Briefly describe your diet:</Label>
                    <textarea className={textareaClasses} />
                </div>
                <div>
                    <Label className={labelClasses}>List your personal health and wellness goals:</Label>
                    <textarea className={textareaClasses} />
                </div>

                <div className="bg-white p-6 rounded-2xl border border-[#E5E5E5]">
                    <Label className={labelClasses}>System Review (0=No Symptoms, 1=Mild, 2=Moderate, 3=Severe)</Label>
                    <div className="space-y-4 mt-4 text-sm">
                        <div className="grid grid-cols-2 gap-2"><span className="font-semibold">HEAD:</span> Headache, Dizziness, Brain Fog, Migraines</div>
                        <div className="grid grid-cols-2 gap-2"><span className="font-semibold">EENT:</span> Stuffy Nose, Congestion, Cough, Wheezing</div>
                        <div className="grid grid-cols-2 gap-2"><span className="font-semibold">EARS:</span> Ear Infections, Ringing, Hearing loss</div>
                        <div className="grid grid-cols-2 gap-2"><span className="font-semibold">HEART:</span> Elevated BP, Palpitations, Irregular Beat, Chest Pain</div>
                        <div className="grid grid-cols-2 gap-2"><span className="font-semibold">MUSCULOSKELETAL:</span> Joint/Back Pain, Balance, Tendonitis, Sprains, Strength</div>
                        <div className="grid grid-cols-2 gap-2"><span className="font-semibold">NEUROENDOCRINE:</span> Thirst, Hair Loss, Urination, Low Libido, Restlessness, Lethargy, Sleep, Hunger, Low Energy/Temp, Sweating</div>
                        <div className="grid grid-cols-2 gap-2"><span className="font-semibold">SKIN DISORDERS:</span> Itching, Wounds, Acne, Rash, Psoriasis, Eczema</div>
                        <div className="grid grid-cols-2 gap-2"><span className="font-semibold">MENTAL/EMOTIONAL:</span> Mood Swings, Irritability, Suicidal Ideation, Anxiety, Depression, Stress, Outbursts</div>
                        <div className="grid grid-cols-2 gap-2"><span className="font-semibold">WEIGHT:</span> Difficulty Losing, Excessive Hunger, Abdominal Weight</div>
                        <div className="grid grid-cols-2 gap-2"><span className="font-semibold">GI:</span> Abdominal Pain, Gas, Heartburn, Constipation, Diarrhea</div>
                        <div className="grid grid-cols-2 gap-2"><span className="font-semibold">GU:</span> Problems urinating, Blood in Urine, Irregular Cycle, Vaginal Dryness, Yeast Infections, UTIs</div>
                    </div>
                </div>

                <div className="text-sm text-[#2D2D2D]/80 leading-relaxed bg-[#a10c22]/10 p-6 rounded-2xl">
                    <p>I have read and fully completed this questionnaire truthfully. I agree that this constitutes full disclosure, and that it supersedes any previous verbal or written disclosures. I authorize the healthcare provider, nurse, medical assistants, and any other deemed medical staff to administer treatments and medications as they deem necessary and advisable including recommending/ordering laboratory and other diagnostic tests as indicated for my medical concerns. I understand that by identifying my health risk factors, Medfit of Georgia will then recommend targeted lifestyle support that, if acted upon, can help me reduce my risk of disease and increase my ability to be healthier. I understand I have the right to refuse any treatment recommendation. I understand your office does not replace my primary care provider.</p>
                    <p className="mt-2">While all treatments are recommended to achieve the best possible results, I do understand that not all treatments will have the same results on every client, therefore no guarantee can be given. I also understand that any recommendations made are up to me to choose to accept and engage in for optimal results to occur.</p>
                    <p className="mt-2">I understand that if I withhold information or provide misinformation, incomplete results or recommendations can occur from treatments received. I am aware that it is my responsibility to inform you of my current medical or health conditions and to update this history. The treatments I receive here are voluntary and I release Medfit of Georgia from liability and assume full responsibility thereof.</p>
                </div>

                <SignatureBlock
                    formTitle="MedFit Wellness Intake & Consent Form"
                    onSign={(data) => setSignatureData(data)}
                    signed={signatureData}
                />

                <div className="flex gap-4 pt-4">
                    <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1 h-14 rounded-full border border-[#E5E5E5] text-[#2D2D2D] hover:bg-white hover:text-[#1A1A1A] font-medium tracking-wide transition-all">Back</Button>
                    <Button type="submit" disabled={isSubmitting || !signatureData} className="flex-[2] h-14 rounded-full bg-[#a10c22] hover:bg-[#7D9365] text-white font-medium shadow-[0_0_15px_rgba(143,166,119,0.3)] transition-all duration-300 tracking-wide">
                        {isSubmitting ? "Finalizing..." : "Accept & Complete"}
                    </Button>
                </div>
            </form>
        </FormLayout>
    );
}

// Form 2: NFC HIPAA
export function NfcHipaaForm({ onSubmit, isSubmitting }: FormProps) {
    const [signatureData, setSignatureData] = useState<SignatureData | null>(null);
    const inputClasses = "border-0 border-b border-[#E5E5E5] bg-transparent rounded-none focus-visible:ring-0 focus-visible:border-[#a10c22] px-0 h-10 text-[#1A1A1A]";

    return (
        <FormLayout title="HEALTH CARE AUTHORIZATION FORM" subtitle="Notice of Privacy Practices for NFC Lab Services." step={1} totalSteps={1}>
            <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-8">
                <div className="prose prose-sm text-[#2D2D2D]/80 leading-relaxed max-w-none mb-8 bg-white p-6 md:p-10 rounded-2xl border border-[#E5E5E5] space-y-4">
                    <p className="font-bold text-center">2359 Windy Hill Rd STE 210<br />Marietta, GA 30067<br />404-980-9800</p>
                    <p className="font-bold">THE PATIENT IDENTIFIED ABOVE AUTHORIZES MEDFIT OF GEORGIA LLC TO USE AND OR DISCLOSE PROTECTED HEALTH IMFORMATION IN ACCORDANCE WITH THE FOLLOWING:</p>
                    <ul className="list-disc pl-5 space-y-4">
                        <li>I give permission to Medfit Of Georgia LLC, to use my address, phone number, and clinical records to contact me with appointment notification, birthday cards, holiday related cards, newsletters, information about treatment alternatives or other health related information. I also give permission allowing my name to be posted on a referral board or my picture to be posted on message board for office related events. In the future should I write a testimonial regarding my treatment in this office, I give permission for it to be posted.</li>
                        <li>I grant permission for Medfit Of Georgia LLC to share my health records and lab results with N.F.C and/or Mr. David Oblas as necessary.</li>
                        <li>If Medfit Of Georgia LLC contacts me by phone, I give them permission to leave a phone message on my answering machine or voice mail, or with the individual who answers the telephone.</li>
                        <li>I grant permission for Medfit Of Georgia LLC to treat me in an open room where other patients are also being treated. I am aware that other persons in the office may over hear some of my protected health information during the course of care. Should I need to speak with the doctor at any time in private, the doctor will provide a room for these conversations.</li>
                        <li>By signing this form you are giving Medfit Of Georgia LLC, permission to use and disclose your protected health information in accordance with the directives listed above.</li>
                    </ul>

                    <h3 className="font-serif text-lg font-bold mt-6 text-[#1A1A1A]">RIGHT TO REVOKE AUTHORIZATION</h3>
                    <p>You have the right to revoke this AUTHORIZATION, in writing, at any time. However, your written request to revoke this AUTHORIZATION is not effective to the extent that we have provided services or taken action in reliance on your authorization.</p>
                    <p>You may revoke this AUTHORIZATION by mailing or hand delivering a wrtitten notice to the Privacy Official of Medfit Of Georgia LLC. The written notice must contain the following information:</p>
                    <p>Your full name and date of birth, a clear statement of your intent to revoke this AUTHORIZATION, the date of your request, and your signature.</p>
                    <p>The revocation is not effective until it is received by the Privacy Official.</p>
                    <p>This AUTHORIZATION is requested by Medfit Of Georgia LLC, for its own use/disclosure of Protected Health Information. (Minimum standards apply.)</p>
                    <p>You have the right to refuse to sign this AUTHORIZATION. If you refuse to sign this AUTHORIZATION, Medfit Of Georgia LLC will not refuse to provide treatment.</p>
                    <p>You have the right to inspect or copy the PHI to be used/disclosed.</p>
                </div>

                <SignatureBlock
                    formTitle="NFC HIPAA Health Care Authorization Form"
                    onSign={(data) => setSignatureData(data)}
                    signed={signatureData}
                />

                <div className="pt-4">
                    <Button type="submit" disabled={isSubmitting || !signatureData} className="w-full h-14 rounded-full bg-[#a10c22] hover:bg-[#7D9365] text-white font-medium shadow-[0_0_15px_rgba(143,166,119,0.3)] transition-all duration-300 tracking-wide">
                        {isSubmitting ? "Authorizing..." : "I Agree & Authorize"}
                    </Button>
                </div>
            </form>
        </FormLayout>
    );
}

// Form 3: Medical Weight Loss
export function MedicalWeightLossForm({ onSubmit, isSubmitting }: FormProps) {
    const [signatureData, setSignatureData] = useState<SignatureData | null>(null);
    const inputClasses = "border-0 border-b border-[#E5E5E5] bg-transparent rounded-none focus-visible:ring-0 focus-visible:border-[#a10c22] px-0 h-10 text-[#1A1A1A]";

    return (
        <FormLayout title="Semaglutide/Tirzepatide: Medical Weight Loss Program Consent Form" subtitle="" step={1} totalSteps={1}>
            <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-8">
                <div className="text-sm text-[#2D2D2D]/80 leading-relaxed bg-white p-6 md:p-10 rounded-2xl border border-[#E5E5E5] space-y-4">
                    <p className="font-bold text-center">2359 Windy Hill Rd STE 210<br />Marietta, GA 30067<br />404-980-9800</p>
                    <p>I authorize Medfit of Georgia and DR/NP/PA and whomever they designate as their assistants, to help me in my weight reduction efforts.</p>
                    <p>I understand that any medical treatment may involve risks as well as the proposed benefits. I also understand that there are certain health risks associated with remaining overweight or obese. Common risks of this program may include but are not limited to nervousness, sleeplessness, headaches, hypoglycemia, syncope, dry mouth, gastrointestinal disturbances, constipation, weakness, tiredness, psychological problems, high blood pressure, rapid heartbeat, and heart irregularities. These and other possible risks could, on occasion. Serious but rare reactions include, thyroid C cell tumor (animal studies), medullary thyroid cancer risk, hypersensitivity reaction, anaphylaxis, angioedema, acute kidney injury, chronic renal failure exacerbation, pancreatitis, cholelithiasis, cholecystitis.</p>
                    <p>Risks associated with remaining overweight are tendencies to high blood pressure, diabetes, heart attack and heart disease, arthritis of the joints including hips, knees, feet and back, sleep apnea, and sudden death. I understand that these risks may be modest if I am not significantly overweight, but will increase with additional weight gain. I understand that much of the success of the program will depend on my efforts and that there are no guarantees or assurances that the program will be successful. I also understand that obesity may be a chronic, lifelong condition that may require changes in eating habits and permanent changes in behavior, including exercise, to be treated successfully.</p>
                    <p>I have read and fully understand this consent form and I realize I should not sign this form if all items have not been explained to me. My questions have been answered to my complete satisfaction. I have been urged and have been given all the time I need to read and understand this form. If you have any questions regarding the risks or hazards of the proposed treatment, or any questions whatsoever, concerning the proposed treatment or other possible treatments, ask your provider now before signing this consent form.</p>
                </div>
                <SignatureBlock
                    formTitle="Semaglutide/Tirzepatide Weight Loss Consent Form"
                    onSign={(data) => setSignatureData(data)}
                    signed={signatureData}
                />
                <div className="pt-4">
                    <Button type="submit" disabled={isSubmitting || !signatureData} className="w-full h-14 rounded-full bg-[#a10c22] hover:bg-[#7D9365] text-white font-medium shadow-[0_0_15px_rgba(143,166,119,0.3)] transition-all duration-300 tracking-wide">
                        {isSubmitting ? "Processing..." : "Sign Consent"}
                    </Button>
                </div>
            </form>
        </FormLayout>
    );
}

// Form 4: Testosterone Therapy
export function TestosteroneTherapyForm({ onSubmit, isSubmitting }: FormProps) {
    const [signatureData, setSignatureData] = useState<SignatureData | null>(null);
    const inputClasses = "border-0 border-b border-[#E5E5E5] bg-transparent rounded-none focus-visible:ring-0 focus-visible:border-[#a10c22] px-0 h-10 text-[#1A1A1A]";

    return (
        <FormLayout title="Informed Consent for Testosterone Replacement Therapy" subtitle="" step={1} totalSteps={1}>
            <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-8">
                <div className="text-sm text-[#2D2D2D]/80 leading-relaxed bg-white p-6 md:p-10 rounded-2xl border border-[#E5E5E5] space-y-4">
                    <p className="text-center font-bold">2359 Windy Hill RD STE 210<br />Marietta, GA 30067<br />404-980-9800</p>
                    <p>Although Testosterone Replacement Therapy (“TRT”) has been utilized safely and effectively, it is necessary to discuss potential risks. You should also be aware of the alternatives to TRT, including not receiving the treatment. It is important that you consider the information we have provided you. Be sure that you are doing what is right for you. If you are unsure, then perhaps you should take some time to weigh your options or consult another health care provider.</p>
                    <p>Please review the following items, which discuss informed consent. Your clinical provider will attempt to answer all of your questions to your satisfaction. By signing you agree that you have read, understand, and agree with:</p>
                    <ol className="list-decimal pl-5 space-y-2">
                        <li>This is my consent for Justin Kitchens F.N.P. (“MedFit of GA”), including any clinical provider who works with MedFit of GA, to begin treatment for TRT in pellet, injection or gel form.</li>
                        <li>It has been explained to me, and I fully understand, that occasionally there are complications with this treatment such as gynecomastia, acne, fat loss, and increased estrogens.</li>
                        <li>I understand I may retain extra fluid in the body – This can cause problems for patients with heart, kidney, or liver disease.</li>
                        <li>TRT may cause your LH and FSH levels to be severely limited, affecting your fertility. Patients should not be on TRT if attempting to father a child.</li>
                        <li>I have been informed that Testosterone may lead to liver inflammation and damage. I have been informed that I will be monitored for liver problems before starting TRT and periodically during therapy.</li>
                        <li>TRT may cause changes in cholesterol levels, red blood cell levels, PSA levels, liver function enzymes, and other hormone levels which will be monitored with periodic blood tests.</li>
                        <li>I understand it is my responsibility to be aware of the above complications and let my clinical provider know when I have a concern.</li>
                        <li>I understand that I will have periodic blood tests to monitor my blood levels.</li>
                        <li>I understand there is no guarantee as to the result and that if I stop treatment, my condition may return or get worse.</li>
                        <li>I have provided my clinical provider with my complete past medical and health history. I have had an opportunity to discuss with my clinical provider my complete past medical and health history. All of my questions concerning the risks, benefits, and alternatives have been answered. I am satisfied with the answers.</li>
                        <li>I agree that TRT works best when I change lifestyle habits such as limiting alcohol, stopping smoking, exercising, and eating correctly.</li>
                    </ol>
                    <p>All of my questions and concerns regarding treatment have been answered to my satisfaction. I further acknowledge that the risks and benefits of this treatment have been explained to me. I am of sound mind, under no undue influence and am competent to make this decision and do so of my own free will. I have no further questions. I consent to taking Testosterone as proposed by my clinical provider. I have complete understanding of and agree to follow the terms of this Informed Consent. A copy of this document has been given to me.</p>
                </div>
                <SignatureBlock
                    formTitle="Informed Consent for Testosterone Replacement Therapy"
                    onSign={(data) => setSignatureData(data)}
                    signed={signatureData}
                />
                <div className="pt-4">
                    <Button type="submit" disabled={isSubmitting || !signatureData} className="w-full h-14 rounded-full bg-[#a10c22] hover:bg-[#7D9365] text-white font-medium shadow-[0_0_15px_rgba(143,166,119,0.3)] transition-all duration-300 tracking-wide">
                        {isSubmitting ? "Processing..." : "I Acknowledge & Consent"}
                    </Button>
                </div>
            </form>
        </FormLayout>
    );
}

// Form 5: Peptide Therapy
export function PeptideTherapyForm({ onSubmit, isSubmitting }: FormProps) {
    const [signatureData, setSignatureData] = useState<SignatureData | null>(null);
    const inputClasses = "border-0 border-b border-[#E5E5E5] bg-transparent rounded-none focus-visible:ring-0 focus-visible:border-[#a10c22] px-0 h-10 text-[#1A1A1A]";

    return (
        <FormLayout title="Peptide Therapy Consent Form" subtitle="" step={1} totalSteps={1}>
            <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-8">
                <div className="text-sm text-[#2D2D2D]/80 leading-relaxed bg-white p-6 md:p-10 rounded-2xl border border-[#E5E5E5] space-y-6">
                    <div>
                        <h3 className="font-serif text-lg font-bold text-[#1A1A1A] mb-2">INTRODUCTION</h3>
                        <p>Peptide therapy is an innovative treatment approach using specific chains of amino acids (peptides) to help regulate and optimize various physiological functions. This therapy may be used to support energy, improve recovery, enhance fat loss, boost cognitive performance, regulate hormones, and more.</p>
                    </div>
                    <div>
                        <h3 className="font-serif text-lg font-bold text-[#1A1A1A] mb-2">PURPOSE</h3>
                        <p>The purpose of peptide therapy is to supplement or stimulate the body’s natural peptides and promote better cellular communication and function. Based on your medical history, lab results, and current symptoms, you have been recommended to start peptide therapy under medical supervision.</p>
                    </div>
                    <div>
                        <h3 className="font-serif text-lg font-bold text-[#1A1A1A] mb-2">TREATMENT OVERVIEW</h3>
                        <p>Some commonly used peptides may include:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>BPC-157</li>
                            <li>CJC-1295 / Ipamorelin</li>
                            <li>Thymosin Alpha-1</li>
                            <li>TB-500</li>
                            <li>Semax / Selank</li>
                            <li>MOTS-c</li>
                            <li>PT-141</li>
                            <li>Sermorelin</li>
                            <li>Others as deemed appropriate</li>
                        </ul>
                        <p className="mt-2">The choice of peptide(s) will be based on your health status and the provider’s clinical judgment.</p>
                    </div>
                    <div>
                        <h3 className="font-serif text-lg font-bold text-[#1A1A1A] mb-2">POTENTIAL BENEFITS</h3>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Improved immune function</li>
                            <li>Enhanced healing and recovery</li>
                            <li>Increased fat metabolism</li>
                            <li>Improved sleep and cognitive function</li>
                            <li>Hormone regulation</li>
                            <li>Better physical performance and endurance</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-serif text-lg font-bold text-[#1A1A1A] mb-2">POTENTIAL RISKS & SIDE EFFECTS</h3>
                        <p>As with any therapy, there are risks. Reported side effects may include but are not limited to:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Redness, irritation, or pain at injection site</li>
                            <li>Headaches, nausea, or dizziness</li>
                            <li>Water retention</li>
                            <li>Fatigue or changes in mood</li>
                            <li>Changes in blood pressure or blood sugar</li>
                            <li>Allergic reaction</li>
                        </ul>
                        <p className="mt-2">Though uncommon, serious adverse reactions can occur. You are encouraged to report any symptoms or side effects immediately.</p>
                    </div>
                    <div>
                        <h3 className="font-serif text-lg font-bold text-[#1A1A1A] mb-2">CONTRAINDICATIONS</h3>
                        <p>Peptide therapy is NOT recommended for individuals with:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Active cancer or history of hormone-sensitive cancer</li>
                            <li>Pregnancy or breastfeeding</li>
                            <li>Known allergies to components of the peptide formulation</li>
                            <li>Uncontrolled chronic medical conditions without clearance</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-serif text-lg font-bold text-[#1A1A1A] mb-2">CONSENT & ACKNOWLEDGMENT</h3>
                        <p>I understand that:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-2">
                            <li>Peptide therapy is considered investigational and not FDA-approved for all conditions it may be used for.</li>
                            <li>I have had the opportunity to ask questions and all questions were answered to my satisfaction.</li>
                            <li>I am aware that no guarantees or promises have been made to me regarding outcomes.</li>
                            <li>I agree to notify MedfitAmerica if I experience any side effects or complications.</li>
                            <li>I may stop therapy at any time and understand that continued medical monitoring is essential.</li>
                        </ul>
                    </div>
                </div>
                <SignatureBlock
                    formTitle="Peptide Therapy Consent Form"
                    onSign={(data) => setSignatureData(data)}
                    signed={signatureData}
                />
                <div className="pt-4">
                    <Button type="submit" disabled={isSubmitting || !signatureData} className="w-full h-14 rounded-full bg-[#a10c22] hover:bg-[#7D9365] text-white font-medium shadow-[0_0_15px_rgba(143,166,119,0.3)] transition-all duration-300 tracking-wide">
                        {isSubmitting ? "Processing..." : "Sign Consent"}
                    </Button>
                </div>
            </form>
        </FormLayout>
    );
}

// Form 6: Semaglutide
export function SemaglutideInstructionsForm({ onSubmit, isSubmitting }: FormProps) {
    const [signatureData, setSignatureData] = useState<SignatureData | null>(null);
    const inputClasses = "border-0 border-b border-[#E5E5E5] bg-transparent rounded-none focus-visible:ring-0 focus-visible:border-[#a10c22] px-0 h-10 text-[#1A1A1A]";

    return (
        <FormLayout title="Semaglutide/Tirzepatide Weekly Self Administration Instructions" subtitle="Self-Administration Guidelines & Acknowledgement" step={1} totalSteps={1}>
            <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-8">
                <div className="text-sm text-[#2D2D2D]/80 leading-relaxed bg-white p-6 md:p-10 rounded-2xl border border-[#E5E5E5] space-y-4">
                    <ol className="list-decimal pl-5 space-y-4">
                        <li><strong>Gather supplies.</strong>
                            <ul className="list-[lower-alpha] pl-5 mt-1 space-y-1">
                                <li>1 insulin syringe</li>
                                <li>2 alcohol swabs</li>
                                <li>Vial of Semaglutide or Tirzepatide</li>
                                <li>Gauze for any bleeding</li>
                            </ul>
                        </li>
                        <li><strong>Select clean dry workspace.</strong></li>
                        <li><strong>Wash hands before preparing medication.</strong></li>
                        <li><strong>Clean the top of the vial with an alcohol swab.</strong></li>
                        <li><strong>Draw ____ units of Semaglutide or Tirzepatide into an insulin syringe.</strong></li>
                        <li><strong>Place the insulin syringe on clean gauze until ready for use.</strong></li>
                        <li><strong>Clean area about 2 inches from navel as chosen to be injection site.</strong>
                            <ul className="list-[lower-alpha] pl-5 mt-1 space-y-1">
                                <li>Remember to rotate around the navel when performing your next injection.</li>
                                <li>One technique is to rotate around the belly button in a clockwise manner for injections.</li>
                            </ul>
                        </li>
                        <li><strong>Pinch a 2-inch fold of skin between your thumb and index finger.</strong></li>
                        <li><strong>Hold the syringe the way you would a pencil or dart. Insert the needle at a 45 to 90 degree angle to the pinched-up skin. The needle should be completely covered by skin. If you do this quickly, you will feel very little discomfort.</strong></li>
                        <li><strong>Slowly push the plunger to inject the medication. Press the plunger all the way down.</strong></li>
                        <li><strong>Remove the needle from the skin and gently hold an alcohol pad on the injection site. Do not rub. Immediately put the syringe and needle into a disposal container.</strong></li>
                    </ol>
                </div>
                <div className="space-y-4 pt-4">
                    <div className="bg-[#a10c22]/10 p-5 rounded-2xl flex gap-4">
                        <AlertCircle className="w-5 h-5 text-[#a10c22] shrink-0 mt-0.5" />
                        <div className="text-sm text-[#2D2D2D]/80 leading-relaxed">
                            <p className="font-medium text-[#1A1A1A] mb-1">Acknowledgement Statement</p>
                            By signing below, I confirm that I have read and understand the self-administration instructions provided.
                        </div>
                    </div>
                    <SignatureBlock
                        formTitle="Semaglutide/Tirzepatide Self-Administration Instructions Acknowledgement"
                        onSign={(data) => setSignatureData(data)}
                        signed={signatureData}
                    />
                    <div className="pt-2">
                        <Button type="submit" disabled={isSubmitting || !signatureData} className="w-full h-14 rounded-full bg-[#a10c22] hover:bg-[#7D9365] text-white font-medium shadow-[0_0_15px_rgba(143,166,119,0.3)] transition-all duration-300 tracking-wide">
                            {isSubmitting ? "Finalizing..." : "I Acknowledge & Sign"}
                        </Button>
                    </div>
                </div>
            </form>
        </FormLayout>
    );
}
