"use client";

import {
    Hash,
    KeyRound,
    Eye,
    EyeOff,
    Fingerprint,
    RefreshCcw,
    MoveRight,
    Loader2,
} from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema, LoginInput } from "@/validations/login.validation";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { track } from "@vercel/analytics";

function SessionTimeoutToast() {
    const searchParams = useSearchParams();

    useEffect(() => {
        if (searchParams.get("expired") === "true") {
            toast.error("Session timed out. Please log in again.", {
                id: "session-timeout-toast",
            });
            window.history.replaceState(null, "", "/login");
        }
    }, [searchParams]);

    return null;
}

export const LoginForm = () => {
    const router = useRouter();

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginInput>({
        resolver: zodResolver(LoginSchema),
    });

    const [showPass, setShowPass] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Captcha States
    const [captchaSrc, setCaptchaSrc] = useState("");
    const [captchaLoading, setCaptchaLoading] = useState(true);
    const [captchaError, setCaptchaError] = useState(false);

    const handleRefreshCaptcha = () => {
        setIsRefreshing(true);
        setTimeout(() => setIsRefreshing(false), 600);
        setCaptchaLoading(true);
        setCaptchaError(false);
        setCaptchaSrc(`/api/captcha?t=${Date.now()}`);
    };

    useEffect(() => {
        setCaptchaSrc(`/api/captcha?t=${Date.now()}`);
    }, []);

    const onSubmit = async (data: LoginInput) => {
        try {
            const res = await axios.post(`/api/login`, data);

            if (res.data.success) {
                track("user_login_success");
                toast.success("Logged In Successfully!");
                router.push("/dashboard");
            }
        } catch (err: any) {
            if (err.response?.status === 429) {
                toast.error("Too many attempts. Please wait a minute and try again.");
            } else {
                toast.error(err.response?.data?.error || "Login failed. Please try again.");
            }
            handleRefreshCaptcha();
        }
    };

    return (
        <>
            <Suspense fallback={null}>
                <SessionTimeoutToast />
            </Suspense>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" suppressHydrationWarning>

                {/* GGSIPU Unreachable Warning Banner */}
                <AnimatePresence>
                    {captchaError && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                            animate={{ opacity: 1, height: "auto", marginBottom: 4 }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="p-3 bg-grade-fail-surface border border-grade-fail-border rounded-lg flex items-start gap-2.5 shadow-sm">
                                <div className="text-grade-fail mt-0.5 shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="text-xs font-bold text-grade-fail uppercase tracking-wider font-mono">GGSIPU Portal Unreachable</h3>
                                    <p className="text-[11px] text-foreground-secondary leading-snug">
                                        The official university servers are currently not responding. You may not be able to log in. Please try refreshing the CAPTCHA or try again later.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Enrollment Number (Username) */}
                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="enrollment"
                        className="text-xs font-semibold uppercase tracking-wider text-foreground-secondary"
                    >
                        Enrollment Number
                    </label>
                    <div className="relative flex items-center">
                        <span className="absolute left-3 text-foreground-muted">
                            <Hash size={16} />
                        </span>
                        <input
                            id="enrollment"
                            {...register("enrollment")}
                            type="text"
                            placeholder="09414802721"
                            autoComplete="username"
                            suppressHydrationWarning
                            className="w-full rounded-lg border border-border-strong bg-background py-2.5 pl-10 pr-3 font-mono text-sm text-foreground outline-none transition focus:border-gold focus:ring-1 focus:ring-gold"
                        />
                    </div>
                    {errors.enrollment && (
                        <p className="text-xs text-grade-fail">{errors.enrollment.message}</p>
                    )}
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="password"
                        className="text-xs font-semibold uppercase tracking-wider text-foreground-secondary"
                    >
                        Password
                    </label>
                    <div className="relative flex items-center">
                        <span className="absolute left-3 text-foreground-muted">
                            <KeyRound size={16} />
                        </span>
                        <input
                            id="password"
                            {...register("password")}
                            type={showPass ? "text" : "password"}
                            placeholder="••••••••"
                            autoComplete="current-password"
                            suppressHydrationWarning
                            className="w-full rounded-lg border border-border-strong bg-background py-2.5 pl-10 pr-10 font-mono text-sm text-foreground outline-none transition focus:border-gold focus:ring-1 focus:ring-gold"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPass(!showPass)}
                            aria-label={showPass ? "Hide password" : "Show password"}
                            suppressHydrationWarning
                            className="absolute right-3 text-foreground-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-gold rounded p-0.5"
                        >
                            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="text-xs text-grade-fail">{errors.password.message}</p>
                    )}
                </div>

                {/* CAPTCHA Section */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <label htmlFor="captcha" className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-foreground-secondary cursor-pointer">
                            <Fingerprint size={14} />
                            CAPTCHA
                        </label>
                        <button
                            type="button"
                            aria-label="Refresh CAPTCHA image"
                            suppressHydrationWarning
                            className="flex items-center gap-1 text-xs text-foreground-muted hover:text-gold transition duration-200 ease-in-out cursor-pointer focus-visible:ring-2 focus-visible:ring-gold rounded px-1"
                            onClick={handleRefreshCaptcha}
                        >
                            <RefreshCcw size={12} className={`transition-transform duration-500 ${isRefreshing ? "rotate-180" : ""}`} /> Refresh
                        </button>
                    </div>

                    {/* CAPTCHA Image Container */}
                    <div className="relative flex h-14 w-full items-center justify-center overflow-hidden rounded-lg border border-border-strong bg-background p-1">
                        {captchaError ? (
                            <div className="flex items-center justify-center w-full h-full">
                                <p className="text-xs text-grade-fail font-mono">Failed to Load Captcha!</p>
                            </div>
                        ) : (
                            <>
                                {captchaLoading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
                                        <Loader2 className="animate-spin text-foreground-secondary" size={18} />
                                    </div>
                                )}

                                <div className="w-full h-full flex items-center justify-center">
                                    {captchaSrc && (
                                        /* eslint-disable-next-line @next/next/no-img-element */
                                        <img
                                            src={captchaSrc}
                                            alt="CAPTCHA Code"
                                            onLoad={() => setCaptchaLoading(false)}
                                            onError={() => {
                                                setCaptchaLoading(false);
                                                setCaptchaError(true);
                                            }}
                                            className={`h-full w-auto max-w-full object-contain mx-auto transition-opacity duration-200 ${captchaLoading ? "opacity-0" : "opacity-100"}`}
                                        />
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* CAPTCHA Input */}
                    <input
                        id="captcha"
                        {...register("captcha")}
                        type="text"
                        placeholder="Enter CAPTCHA"
                        suppressHydrationWarning
                        className="w-full rounded-lg border border-border-strong bg-background py-2.5 px-3 font-mono text-sm tracking-wider text-foreground outline-none transition focus:border-gold focus:ring-1 focus:ring-gold"
                    />
                    {errors.captcha && (
                        <p className="text-xs text-grade-fail">{errors.captcha.message}</p>
                    )}
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    suppressHydrationWarning
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-gold-border bg-gold-surface py-3 text-sm font-semibold text-gold transition hover:bg-gold-border active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 size={16} className="animate-spin" /> Verifying...
                        </>
                    ) : (
                        <>
                            Sign In <MoveRight size={16} />
                        </>
                    )}
                </button>

                <p className="text-center text-xs text-foreground-muted">
                    Your credentials are passed directly to the GGSIPU exam portal.
                </p>
            </form>
        </>
    );
};