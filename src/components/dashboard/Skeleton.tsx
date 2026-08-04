"use client";

export default function Skeleton() {
    return (
        <div className="min-h-screen bg-background text-foreground p-6">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header Skeleton */}
                <div className="flex justify-between items-center animate-pulse">
                    <div className="h-8 bg-surface-elevated rounded-lg w-48"></div>
                    <div className="h-10 bg-surface-elevated rounded-lg w-24"></div>
                </div>

                {/* Profile Card Skeleton */}
                <div className="bg-surface border border-border-strong rounded-2xl p-6 space-y-4 animate-pulse">
                    <div className="h-6 bg-surface-elevated rounded w-1/3"></div>
                    <div className="h-4 bg-surface-elevated rounded w-2/3"></div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-16 bg-surface-elevated rounded-xl"></div>
                        ))}
                    </div>
                </div>

                {/* Table Skeleton */}
                <div className="bg-surface border border-border-strong rounded-2xl overflow-hidden animate-pulse">
                    <div className="h-12 bg-surface-elevated border-b border-border"></div>
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-14 bg-surface-elevated/50 border-b border-border"></div>
                    ))}
                </div>
            </div>
        </div>
    )
}
