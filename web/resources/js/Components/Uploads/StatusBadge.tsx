import { UploadStatus } from '@/types';

interface StatusBadgeProps {
    status: UploadStatus | string;
    className?: string;
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
    const normalized = (status || '').toLowerCase();

    switch (normalized) {
        case 'completed':
            return (
                <span
                    className={`inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-950/50 dark:text-emerald-400 dark:ring-emerald-500/30 ${className}`}
                >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                    Completed
                </span>
            );
        case 'processing':
            return (
                <span
                    className={`inline-flex items-center gap-1.5 rounded-md bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700 ring-1 ring-inset ring-sky-600/20 dark:bg-sky-950/50 dark:text-sky-400 dark:ring-sky-500/30 ${className}`}
                >
                    <svg
                        className="h-3 w-3 animate-spin text-sky-600 dark:text-sky-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                    Processing
                </span>
            );
        case 'pending':
            return (
                <span
                    className={`inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-950/50 dark:text-amber-400 dark:ring-amber-500/30 ${className}`}
                >
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />
                    Pending
                </span>
            );
        case 'failed':
            return (
                <span
                    className={`inline-flex items-center gap-1.5 rounded-md bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700 ring-1 ring-inset ring-rose-600/20 dark:bg-rose-950/50 dark:text-rose-400 dark:ring-rose-500/30 ${className}`}
                >
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500 dark:bg-rose-400" />
                    Failed
                </span>
            );
        case 'cancelled':
            return (
                <span
                    className={`inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/20 dark:bg-gray-700 dark:text-gray-300 dark:ring-gray-600 ${className}`}
                >
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                    Cancelled
                </span>
            );
        default:
            return (
                <span
                    className={`inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium capitalize text-gray-700 dark:bg-gray-700 dark:text-gray-300 ${className}`}
                >
                    {status}
                </span>
            );
    }
}
