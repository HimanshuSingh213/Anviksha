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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema, LoginInput } from "@/validations/login.validation";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

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
                toast.success("Logged In Successfully!");
                router.push("/dashboard");
            }
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Login failed. Please try again.");
            handleRefreshCaptcha();
        }
    };

    return (
        <>
            <Suspense fallback={null}>
                <SessionTimeoutToast />
            </Suspense>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" suppressHydrationWarning>

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
                            suppressHydrationWarning
                            className="w-full rounded-lg border border-border-strong bg-background py-2.5 pl-10 pr-10 font-mono text-sm text-foreground outline-none transition focus:border-gold focus:ring-1 focus:ring-gold"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPass(!showPass)}
                            suppressHydrationWarning
                            className="absolute right-3 text-foreground-muted hover:text-foreground"
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
                        <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-foreground-secondary">
                            <Fingerprint size={14} />
                            CAPTCHA
                        </label>
                        <button
                            type="button"
                            suppressHydrationWarning
                            className="flex items-center gap-1 text-xs text-foreground-muted hover:text-gold transition duration-200 ease-in-out cursor-pointer"
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