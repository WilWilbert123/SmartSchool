"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  QrCode,
  Camera,
  CheckCircle2,
  XCircle,
  GraduationCap,
  Building2,
  Calendar,
  User,
  Clock,
  ArrowLeft,
  Printer,
  RefreshCw,
  Lock,
  Phone,
  X
} from "lucide-react";
import { verifyIDCard } from "@/features/ids/id.actions";
import type { IDVerificationResult } from "@/features/ids/id.types";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/utils/cn";

export default function VerifyIdClient() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<IDVerificationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const executeVerification = (searchVal: string) => {
    if (!searchVal || !searchVal.trim()) return;
    setErrorMsg(null);
    setHasSearched(true);
    
    startTransition(async () => {
      const res = await verifyIDCard(searchVal);
      if (res.error) {
        setErrorMsg(res.error);
        setResult(null);
      } else {
        setResult(res.data);
      }
    });
  };

  // Handle URL param ?id=... or ?query=...
  useEffect(() => {
    const urlId = searchParams.get("id") || searchParams.get("query");
    if (urlId) {
      setQuery(urlId);
      executeVerification(urlId);
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeVerification(query);
  };

  const handleQuickLookup = (sampleId: string) => {
    setQuery(sampleId);
    executeVerification(sampleId);
  };

  // Camera scanner logic
  const startCamera = async () => {
    setIsCameraOpen(true);
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError("Camera access denied or unavailable. Please enter the ID number manually.");
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-white selection:text-black">
      {/* Header */}
      <header className="relative z-10 border-b border-zinc-800 bg-black/90 px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-xl bg-white text-black font-bold group-hover:scale-105 transition-transform">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                SmartSchool
                <span className="text-[10px] uppercase tracking-wider font-extrabold bg-zinc-900 text-zinc-300 border border-zinc-700 px-2 py-0.5 rounded-full">
                  Verified Portal
                </span>
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-xs sm:text-sm font-medium text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Main
          </Link>
          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800 font-semibold"
            )}
          >
            Portal Sign In
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col items-center">
        {/* Title Banner */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-white" />
            Cryptographic Registry Verification
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Official Credential & ID Verification
          </h1>
          <p className="text-sm sm:text-base text-zinc-400">
            Instantly authenticate student cards, faculty badges, and official SmartSchool credentials in real-time.
          </p>
        </div>

        {/* Search & Scan Box */}
        <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-2xl mb-8">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter Student ID / Employee No. (e.g. STU-2024-001)..."
                className="w-full bg-black border border-zinc-800 rounded-xl pl-11 pr-10 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-white focus:border-white transition-all"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={startCamera}
                title="Scan QR Code via Camera"
                className="px-3.5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 flex items-center justify-center transition-colors"
              >
                <Camera className="h-5 w-5 text-white" />
              </button>

              <button
                type="submit"
                disabled={isPending || !query.trim()}
                className="flex-1 sm:flex-initial px-6 py-3 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-sm flex items-center justify-center gap-2 border border-white disabled:opacity-50 transition-all"
              >
                {isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin text-black" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4 text-black" />
                    Verify ID
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Badges */}
          <div className="mt-4 pt-4 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-zinc-500 font-medium">Quick Demo Samples:</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleQuickLookup("STU-2024-001")}
                className="px-2.5 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 font-mono transition-colors"
              >
                STU-2024-001
              </button>
              <button
                type="button"
                onClick={() => handleQuickLookup("EMP-2024-101")}
                className="px-2.5 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 font-mono transition-colors"
              >
                EMP-2024-101
              </button>
            </div>
          </div>
        </div>

        {/* Camera Modal */}
        {isCameraOpen && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 max-w-md w-full relative shadow-2xl">
              <button
                onClick={stopCamera}
                className="absolute top-4 right-4 p-1 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <QrCode className="h-5 w-5 text-white" />
                <h3 className="text-lg font-bold text-white">Scan ID Card QR Code</h3>
              </div>

              {cameraError ? (
                <div className="p-4 bg-zinc-900 border border-zinc-700 rounded-xl text-zinc-300 text-xs">
                  {cameraError}
                </div>
              ) : (
                <div className="relative aspect-square bg-black rounded-xl overflow-hidden border border-zinc-800 flex items-center justify-center">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    playsInline
                    muted
                  />
                  <div className="absolute inset-8 border-2 border-dashed border-white/80 rounded-xl pointer-events-none flex items-center justify-center">
                    <span className="text-[11px] text-white font-mono bg-black/90 px-2 py-1 rounded border border-zinc-700">
                      Align QR inside frame
                    </span>
                  </div>
                </div>
              )}

              <div className="mt-4 flex justify-end">
                <button
                  onClick={stopCamera}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 text-xs font-semibold rounded-lg"
                >
                  Close Camera
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errorMsg && (
          <div className="w-full max-w-2xl p-4 bg-zinc-900 border border-zinc-700 rounded-2xl text-zinc-200 text-sm flex items-center gap-3 mb-8">
            <XCircle className="h-5 w-5 text-white flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Verification Result Display */}
        {hasSearched && result && (
          <div className="w-full max-w-2xl print:shadow-none">
            {result.isValid ? (
              /* VALID CARD RESULT - MONOCHROME */
              <div className="bg-zinc-950 border-2 border-white rounded-3xl overflow-hidden shadow-2xl">
                {/* Status Top Bar */}
                <div className="bg-white px-6 py-4 flex items-center justify-between text-black">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-6 w-6 font-bold" />
                    <div>
                      <h2 className="font-extrabold text-base sm:text-lg tracking-tight uppercase">
                        AUTHENTIC & VALID CREDENTIAL
                      </h2>
                      <p className="text-xs text-zinc-700 font-medium">
                        SmartSchool Official Registry Match
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-black text-white font-extrabold text-xs tracking-wider uppercase border border-black">
                    {result.status}
                  </span>
                </div>

                <div className="p-6 sm:p-8 space-y-6">
                  {/* Holder Profile Header */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-zinc-800">
                    <div className="relative">
                      {result.photoUrl ? (
                        <img
                          src={result.photoUrl}
                          alt={result.holderName}
                          className="w-28 h-28 rounded-2xl object-cover border-2 border-white shadow-xl"
                        />
                      ) : (
                        <div className="w-28 h-28 rounded-2xl bg-zinc-900 border-2 border-zinc-700 flex items-center justify-center text-zinc-400">
                          <User className="h-12 w-12 text-zinc-400" />
                        </div>
                      )}
                      <div className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-white text-black shadow-md border border-black">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                    </div>

                    <div className="flex-1 text-center sm:text-left space-y-1">
                      <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-zinc-900 text-white border border-zinc-800 font-mono text-xs font-semibold">
                        ID: {result.idNumber}
                      </div>
                      <h3 className="text-2xl font-bold text-white tracking-tight">
                        {result.holderName}
                      </h3>
                      <p className="text-sm font-medium text-zinc-300 flex items-center justify-center sm:justify-start gap-2">
                        <GraduationCap className="h-4 w-4 text-white" />
                        {result.role === "STUDENT" ? "Registered Student" : "Faculty Member"}
                        {result.gradeOrDept && ` • ${result.gradeOrDept}`}
                      </p>
                      <p className="text-xs text-zinc-400 flex items-center justify-center sm:justify-start gap-1.5 pt-1">
                        <Building2 className="h-3.5 w-3.5 text-zinc-500" />
                        {result.schoolName}
                      </p>
                    </div>
                  </div>

                  {/* Key Metadata Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                        Issue / Admission Date
                      </span>
                      <p className="text-sm font-semibold text-white">
                        {result.issuedDate || "N/A"}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-zinc-400" />
                        Validity Expiration
                      </span>
                      <p className="text-sm font-semibold text-white">
                        {result.expiryDate || "Active Enrollment"}
                      </p>
                    </div>

                    {result.guardianName && (
                      <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1 sm:col-span-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-zinc-400" />
                          Emergency Contact / Guardian
                        </span>
                        <p className="text-sm font-medium text-white">
                          {result.guardianName} {result.guardianContact && `(${result.guardianContact})`}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Cryptographic Proof Footer */}
                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <span className="text-zinc-500 font-mono text-[10px] block uppercase">
                        Verification Hash Reference
                      </span>
                      <span className="font-mono font-bold text-white text-xs">
                        {result.verificationHash}
                      </span>
                      <span className="text-zinc-500 text-[10px] block">
                        Verified at: {new Date(result.verifiedAt).toLocaleString()}
                      </span>
                    </div>

                    <button
                      onClick={handlePrint}
                      className="print:hidden px-3.5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black border border-white flex items-center gap-2 font-semibold text-xs transition-colors self-end sm:self-auto"
                    >
                      <Printer className="h-3.5 w-3.5 text-black" />
                      Print Certificate
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* UNVERIFIED CARD RESULT - MONOCHROME */
              <div className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-6 w-6 font-bold" />
                    <div>
                      <h2 className="font-extrabold text-base sm:text-lg tracking-tight uppercase">
                        UNVERIFIED / RECORD NOT FOUND
                      </h2>
                      <p className="text-xs text-zinc-400 font-medium">
                        SmartSchool Official Registry Check
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-black text-white font-mono font-bold text-xs tracking-wider border border-zinc-700 uppercase">
                    {result.status}
                  </span>
                </div>

                <div className="p-6 sm:p-8 space-y-6">
                  <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm space-y-2">
                    <p className="font-medium text-white">{result.message}</p>
                    <p className="text-xs text-zinc-400">
                      Query searched: <code className="bg-black px-2 py-0.5 rounded font-mono text-white border border-zinc-800">{result.idNumber}</code>
                    </p>
                  </div>

                  <div className="space-y-3 text-xs text-zinc-400">
                    <h4 className="font-semibold text-white text-sm">Verification Guidelines:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Double check the Student Number or Employee ID printed on the physical card.</li>
                      <li>Ensure proper formatting (e.g. STU-2024-001 or standard numeric student ID).</li>
                      <li>If you believe this is an error, please contact the school administration office.</li>
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-zinc-800 flex justify-end">
                    <Link
                      href="/"
                      className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 text-xs font-semibold"
                    >
                      Return to Home
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Security Badge Footer Notice */}
        <div className="mt-12 text-center text-xs text-zinc-500 space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Lock className="h-3.5 w-3.5 text-zinc-400" />
            <span>256-bit Encrypted Official SmartSchool Identity Portal</span>
          </div>
          <p>© {new Date().getFullYear()} SmartSchool Platform. Authorized Public Verification System.</p>
        </div>
      </main>
    </div>
  );
}
