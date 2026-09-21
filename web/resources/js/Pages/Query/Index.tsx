import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import StatusBadge from '@/Components/Uploads/StatusBadge';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps, Upload } from '@/types';
import { formatBytes, formatDate } from '@/Utils/format';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

interface QueryResultData {
    message?: string;
    file?: Upload | null;
}

interface QueryPageProps {
    result?: {
        queryResult?: QueryResultData;
    };
}

export default function Index({ result }: PageProps<QueryPageProps>) {
    const pageProps = usePage<PageProps<QueryPageProps>>().props;
    const queryResult: QueryResultData | undefined =
        pageProps.result?.queryResult ?? result?.queryResult;

    const [copied, setCopied] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        query: '',
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!data.query.trim()) return;

        post(route('query'), {
            preserveScroll: true,
        });
    };

    const handleCopy = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // fallback if clipboard api fails
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                            Query Assistant
                        </h2>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Ask questions and get instant AI-synthesized answers
                            from your documents.
                        </p>
                    </div>
                    <div className="self-start sm:self-auto">
                        <Link
                            href={route('uploads.index')}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <svg
                                className="h-4 w-4 text-gray-500 dark:text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                                />
                            </svg>
                            Upload Documents
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Query Documents" />

            <div className="py-6 sm:py-10">
                <div className="mx-auto max-w-4xl space-y-4 px-4 sm:space-y-6 sm:px-6 lg:px-8">
                    {/* Search & Query Box */}
                    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <div className="border-b border-gray-100 pb-4 dark:border-gray-700">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                Ask anything about your documents
                            </h3>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                AI-powered semantic search will locate context across your uploaded knowledge base.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="mt-4">
                            {/* Responsive Search Input Layout */}
                            <div className="flex flex-col gap-2.5 sm:relative sm:block">
                                <div className="relative w-full">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <svg
                                            className="h-4 w-4 text-gray-400 sm:h-5 sm:w-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                            />
                                        </svg>
                                    </div>
                                    <TextInput
                                        disabled={processing}
                                        className="w-full !py-2.5 !pl-9 !pr-10 text-sm placeholder:text-gray-400 focus:border-indigo-500 focus:ring-indigo-500 sm:!py-3 sm:!pl-11 sm:!pr-36 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                                        placeholder="Ask a question (e.g. What was the net revenue in Q3?)"
                                        value={data.query}
                                        onChange={(e) =>
                                            setData('query', e.target.value)
                                        }
                                        autoFocus
                                    />
                                    {data.query && !processing && (
                                        <button
                                            type="button"
                                            onClick={() => setData('query', '')}
                                            aria-label="Clear search"
                                            className="absolute inset-y-0 right-2 flex items-center p-1.5 text-gray-400 hover:text-gray-600 focus:outline-none sm:right-28 dark:hover:text-gray-200"
                                        >
                                            <svg
                                                className="h-4 w-4"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M6 18L18 6M6 6l12 12"
                                                />
                                            </svg>
                                        </button>
                                    )}
                                </div>

                                {/* Submit Button: full width on mobile, inline on desktop */}
                                <div className="sm:absolute sm:inset-y-1.5 sm:right-1.5 sm:flex sm:items-center">
                                    <PrimaryButton
                                        disabled={
                                            processing || !data.query.trim()
                                        }
                                        className="w-full justify-center !px-4 !py-2.5 text-xs font-semibold shadow-sm sm:w-auto sm:!py-2"
                                    >
                                        {processing ? (
                                            <span className="flex items-center gap-2">
                                                <svg
                                                    className="h-3.5 w-3.5 animate-spin"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
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
                                                Searching...
                                            </span>
                                        ) : (
                                            'Search'
                                        )}
                                    </PrimaryButton>
                                </div>
                            </div>

                            <InputError
                                message={errors.query}
                                className="mt-2"
                            />
                        </form>
                    </div>

                    {/* Searching / Processing Skeleton */}
                    {processing && (
                        <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <div className="flex items-center gap-3">
                                <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700" />
                                <div className="h-4 w-36 rounded bg-gray-200 dark:bg-gray-700" />
                            </div>
                            <div className="mt-4 space-y-2.5">
                                <div className="h-3.5 w-full rounded bg-gray-200 dark:bg-gray-700" />
                                <div className="h-3.5 w-5/6 rounded bg-gray-200 dark:bg-gray-700" />
                                <div className="h-3.5 w-4/6 rounded bg-gray-200 dark:bg-gray-700" />
                            </div>
                            <div className="mt-6 border-t border-gray-100 pt-4 dark:border-gray-700">
                                <div className="h-12 w-full rounded-lg bg-gray-100 dark:bg-gray-700/50" />
                            </div>
                        </div>
                    )}

                    {/* Query Result Section */}
                    {!processing && queryResult && (
                        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            {/* Answer Header */}
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-4 dark:border-gray-700">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                        Answer & Explanation
                                    </h3>
                                </div>

                                {queryResult.message && (
                                    <SecondaryButton
                                        type="button"
                                        onClick={() =>
                                            handleCopy(
                                                queryResult.message || '',
                                            )
                                        }
                                        className="!px-2.5 !py-1 !text-xs"
                                    >
                                        {copied ? (
                                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                                <svg
                                                    className="h-3.5 w-3.5"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M5 13l4 4L19 7"
                                                    />
                                                </svg>
                                                Copied
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1">
                                                <svg
                                                    className="h-3.5 w-3.5"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                                    />
                                                </svg>
                                                Copy
                                            </span>
                                        )}
                                    </SecondaryButton>
                                )}
                            </div>

                            {/* Response Content */}
                            <div className="pt-4">
                                <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">
                                    {queryResult.message ||
                                        'No answer generated.'}
                                </p>

                                {/* Matched Reference Document */}
                                {queryResult.file && (
                                    <div className="mt-5 border-t border-gray-100 pt-4 sm:mt-6 sm:pt-5 dark:border-gray-700">
                                        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Top Reference Document
                                        </h4>
                                        <div className="mt-3 flex flex-col justify-between gap-3 rounded-lg border border-gray-200 bg-white p-4 transition duration-150 ease-in-out hover:border-gray-300 sm:flex-row sm:items-center dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600">
                                            <div className="flex min-w-0 items-start gap-3.5 sm:items-center">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-900/60 dark:text-gray-300">
                                                    <svg
                                                        className="h-5 w-5"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={1.8}
                                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                        />
                                                    </svg>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p
                                                        className="truncate text-sm font-medium text-gray-900 dark:text-gray-100"
                                                        title={
                                                            queryResult.file
                                                                .file_name
                                                        }
                                                    >
                                                        {
                                                            queryResult.file
                                                                .file_name
                                                        }
                                                    </p>
                                                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                                        <span>
                                                            {formatBytes(
                                                                queryResult.file
                                                                    .file_size,
                                                            )}
                                                        </span>
                                                        {queryResult.file
                                                            .created_at && (
                                                            <>
                                                                <span>•</span>
                                                                <span>
                                                                    {formatDate(
                                                                        queryResult
                                                                            .file
                                                                            .created_at,
                                                                    )}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between gap-2 border-t border-gray-100 pt-3 sm:justify-end sm:border-t-0 sm:pt-0 dark:border-gray-700/80">
                                                <StatusBadge
                                                    status={
                                                        queryResult.file.status
                                                    }
                                                />
                                                {queryResult.file.file_url && (
                                                    <a
                                                        href={
                                                            queryResult.file
                                                                .file_url
                                                        }
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 transition duration-150 ease-in-out hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-500"
                                                    >
                                                        <svg
                                                            className="h-3.5 w-3.5"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                                            />
                                                        </svg>
                                                        Open
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Empty State / Getting Started Help */}
                    {!processing && !queryResult && (
                        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">
                            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                                <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.8}
                                        d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <h4 className="mt-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                                No query submitted yet
                            </h4>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Type a question above to query your uploaded knowledge base.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
