import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';

interface WelcomeProps extends PageProps {
    canLogin?: boolean;
    canRegister?: boolean;
    laravelVersion?: string;
    phpVersion?: string;
}

export default function Welcome({
    auth,
    canLogin = true,
    canRegister = true,
}: WelcomeProps) {
    const features = [
        {
            title: 'Upload PDFs & Images',
            description:
                'Upload any PDF or image and DocuQuery reads the content automatically — including scanned documents that contain no selectable text.',
            badge: 'PDF · PNG · JPG',
            icon: (
                <svg
                    className="h-6 w-6 text-indigo-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.75}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                </svg>
            ),
        },
        {
            title: 'Ask Questions in Plain Language',
            description:
                'Type a question the way you would ask a colleague. DocuQuery finds the most relevant passages across all your documents and returns a direct answer.',
            badge: 'Natural language',
            icon: (
                <svg
                    className="h-6 w-6 text-indigo-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.75}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                </svg>
            ),
        },
        {
            title: 'Find the Right Document',
            description:
                'Each answer links back to the exact document and page it came from, so you can verify the source and read the full context instantly.',
            badge: 'Page citations',
            icon: (
                <svg
                    className="h-6 w-6 text-indigo-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.75}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                </svg>
            ),
        },
        {
            title: 'Answers Grounded in Your Files',
            description:
                'The AI only answers based on what is actually in your documents. It will not guess or make things up — if the answer is not there, it says so.',
            badge: 'No hallucinations',
            icon: (
                <svg
                    className="h-6 w-6 text-indigo-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.75}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                </svg>
            ),
        },
        {
            title: 'Search Across All Your Documents',
            description:
                'One query searches your entire knowledge base at once. You do not need to remember which file contains the information you are looking for.',
            badge: 'Cross-document',
            icon: (
                <svg
                    className="h-6 w-6 text-indigo-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.75}
                        d="M4 6h16M4 12h16M4 18h7"
                    />
                </svg>
            ),
        },
    ];

    const pipelineSteps = [
        {
            step: '01',
            name: 'Upload a Document',
            tech: 'Laravel + MinIO',
            desc: 'Upload a PDF or image. The file is saved securely and queued for processing.',
        },
        {
            step: '02',
            name: 'Text is Extracted',
            tech: 'FastAPI + TesseractOCR',
            desc: 'The content is read from the file — including scanned pages that have no selectable text.',
        },
        {
            step: '03',
            name: 'Content is Indexed',
            tech: 'Ollama',
            desc: 'The text is broken into sections and each section is converted into a searchable index entry.',
        },
        {
            step: '04',
            name: 'Your Query is Matched',
            tech: 'PostgreSQL',
            desc: 'When you ask a question, the system finds the sections of your documents that are most relevant to it.',
        },
        {
            step: '05',
            name: 'Answer is Generated',
            tech: 'AionLabs LLM',
            desc: 'The AI reads the matching sections and writes a direct answer, with a link back to the source page.',
        },
    ];

    const techStack = [
        {
            name: 'Laravel 11 & React',
            role: 'Web application, document management, and user interface',
            category: 'Application',
        },
        {
            name: 'FastAPI + TesseractOCR',
            role: 'Reads text from PDFs and scanned images',
            category: 'Extraction',
        },
        {
            name: 'PostgreSQL',
            role: 'Stores documents and powers fast similarity search',
            category: 'Database',
        },
        {
            name: 'MinIO',
            role: 'Local file storage — your documents never leave your server',
            category: 'Storage',
        },
        {
            name: 'Ollama',
            role: 'Runs AI models locally to index document content',
            category: 'AI',
        },
        {
            name: 'AionLabs LLM',
            role: 'Generates answers from the matched document sections',
            category: 'Inference',
        },
    ];

    const constraints = [
        {
            title: 'Math & Formulas',
            desc: 'Equations, fractions, and special notation extracted from PDFs may not render correctly and could appear as garbled text.',
        },
        {
            title: 'Charts & Diagrams',
            desc: 'Images, graphs, and visual figures inside documents are not read. Questions that rely solely on a chart cannot be answered.',
        },
        {
            title: 'Tables',
            desc: 'Table data is extracted as plain text. The row-and-column structure is not preserved, which can affect answers about tabular data.',
        },
        {
            title: 'Multi-Column Layouts',
            desc: 'Documents with side-by-side columns (e.g. newspapers, research papers) may have their columns merged during extraction.',
        },
    ];

    return (
        <>
            <Head title="DocuQuery — Search your documents with AI" />

            <div className="min-h-screen bg-gray-100 text-gray-900 transition-colors duration-200 dark:bg-gray-900 dark:text-gray-100">
                {/* Navbar */}
                <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/80 backdrop-blur-md dark:border-gray-700/80 dark:bg-gray-800/80">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
                                <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                            </div>
                            <span className="text-base font-bold tracking-tight text-gray-900 dark:text-white">
                                DocuQuery
                            </span>
                        </div>

                        {/* Navigation links */}
                        <nav className="hidden items-center gap-6 text-xs font-medium text-gray-600 md:flex dark:text-gray-300">
                            <a
                                href="#features"
                                className="transition hover:text-indigo-600 dark:hover:text-indigo-400"
                            >
                                Features
                            </a>
                            <a
                                href="#architecture"
                                className="transition hover:text-indigo-600 dark:hover:text-indigo-400"
                            >
                                Architecture
                            </a>
                            <a
                                href="#tech-stack"
                                className="transition hover:text-indigo-600 dark:hover:text-indigo-400"
                            >
                                Tech Stack
                            </a>
                            <a
                                href="#limitations"
                                className="transition hover:text-indigo-600 dark:hover:text-indigo-400"
                            >
                                Constraints
                            </a>
                            <a
                                href="https://github.com/niceWizzard/docuquery"
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 text-gray-500 transition hover:text-gray-900 dark:hover:text-white"
                            >
                                <svg
                                    className="h-4 w-4"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                                    />
                                </svg>
                                <span>GitHub</span>
                            </a>
                        </nav>

                        {/* Auth actions */}
                        <div className="flex items-center gap-3">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
                                >
                                    <span>Open Dashboard</span>
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
                                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                                        />
                                    </svg>
                                </Link>
                            ) : (
                                <>
                                    {canLogin && (
                                        <Link
                                            href={route('login')}
                                            className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                                        >
                                            Log in
                                        </Link>
                                    )}
                                    {canRegister && (
                                        <Link
                                            href={route('register')}
                                            className="inline-flex items-center rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
                                        >
                                            Get Started
                                        </Link>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="relative overflow-hidden pb-16 pt-12 sm:pb-24 sm:pt-20">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
                            <div className="space-y-6 lg:col-span-6">
                                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/80 px-3 py-1 text-xs font-medium text-indigo-700 backdrop-blur-sm dark:border-indigo-800/80 dark:bg-indigo-950/60 dark:text-indigo-300">
                                    <span className="flex h-2 w-2 rounded-full bg-indigo-500" />
                                    Runs entirely on your own machine
                                </div>

                                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:leading-tight dark:text-white">
                                    Ask questions. Find answers in your
                                    documents.
                                </h1>

                                <p className="text-base leading-relaxed text-gray-600 sm:text-lg dark:text-gray-300">
                                    Upload PDFs and images, then ask anything
                                    about them in plain language. DocuQuery
                                    finds the relevant passages and returns a
                                    direct answer with a link back to the source
                                    page.
                                </p>

                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                    <Link
                                        href={
                                            auth.user
                                                ? route('dashboard')
                                                : route('register')
                                        }
                                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
                                    >
                                        <span>Get Started</span>
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
                                                d="M14 5l7 7m0 0l-7 7m7-7H3"
                                            />
                                        </svg>
                                    </Link>
                                    <a
                                        href="#features"
                                        className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                                    >
                                        See how it works
                                    </a>
                                </div>

                                <div className="grid grid-cols-3 gap-4 border-t border-gray-100 pt-6 text-center sm:text-left dark:border-gray-800">
                                    <div>
                                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                                            PDF & images
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            Supported formats
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                                            Page citations
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            Every answer sourced
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Document Retrieval Showcase Mockup */}
                            <div className="lg:col-span-6">
                                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
                                    <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/80">
                                        <div className="flex items-center gap-2">
                                            <div className="h-3 w-3 rounded-full bg-red-400" />
                                            <div className="h-3 w-3 rounded-full bg-amber-400" />
                                            <div className="h-3 w-3 rounded-full bg-green-400" />
                                            <span className="ml-2 text-xs font-medium text-gray-600 dark:text-gray-400">
                                                DocuQuery — Search & Discovery
                                            </span>
                                        </div>
                                        <span className="rounded bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                                            Document Match
                                        </span>
                                    </div>

                                    <div className="space-y-4 p-5">
                                        {/* User prompt preview */}
                                        <div className="rounded-lg bg-gray-100 p-3.5 dark:bg-gray-700/60">
                                            <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                <svg
                                                    className="h-4 w-4 text-indigo-500"
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
                                                <span>Query Context:</span>
                                            </div>
                                            <p className="mt-1 text-xs text-gray-800 dark:text-gray-200">
                                                "Q3 net revenue and enterprise
                                                subscription growth analysis"
                                            </p>
                                        </div>

                                        {/* Found Document Context Result */}
                                        <div className="rounded-lg border border-indigo-100 bg-indigo-50/50 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/20">
                                            <div className="flex items-center justify-between border-b border-indigo-100/80 pb-2.5 dark:border-indigo-900/50">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex h-6 w-6 items-center justify-center rounded bg-indigo-600 text-white">
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
                                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                            />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                                                            Annual_Report_2025.pdf
                                                        </span>
                                                        <span className="ml-2 text-[10px] text-gray-500 dark:text-gray-400">
                                                            • Page 12
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                                    Top Context Match
                                                </span>
                                            </div>

                                            <div className="mt-3 space-y-2">
                                                <div className="rounded bg-white p-2.5 text-xs text-gray-700 shadow-sm dark:bg-gray-800 dark:text-gray-300">
                                                    <p className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
                                                        Matched Context Snippet:
                                                    </p>
                                                    <p className="mt-1 leading-relaxed">
                                                        "...Net revenue reached{' '}
                                                        <strong>
                                                            $48.2 million
                                                        </strong>{' '}
                                                        in Q3, driven by a 14%
                                                        year-over-year increase
                                                        in enterprise
                                                        subscriptions across
                                                        primary markets..."
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-3 flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400">
                                                <span>
                                                    Relevant section identified
                                                    automatically
                                                </span>
                                                <span className="font-medium text-indigo-600 dark:text-indigo-400">
                                                    Open Document →
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section
                    id="features"
                    className="border-t border-gray-200 bg-white py-16 sm:py-24 dark:border-gray-700 dark:bg-gray-800/40"
                >
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                                What DocuQuery does
                            </h2>
                            <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl dark:text-white">
                                Your documents. Your questions. Direct answers.
                            </p>
                            <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-600 dark:text-gray-400">
                                Upload your files once and ask questions about
                                them anytime — with every answer linked back to
                                the exact page it came from.
                            </p>
                        </div>

                        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {features.map((feature, idx) => (
                                <div
                                    key={idx}
                                    className="relative flex flex-col justify-between rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
                                >
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/60">
                                                {feature.icon}
                                            </div>
                                            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                                {feature.badge}
                                            </span>
                                        </div>
                                        <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">
                                            {feature.title}
                                        </h3>
                                        <p className="mt-2 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Architecture & Pipeline Section */}
                <section id="architecture" className="py-16 sm:py-24">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                                How it works
                            </h2>
                            <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl dark:text-white">
                                From upload to answer in five steps
                            </p>
                            <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-600 dark:text-gray-400">
                                Upload a document, ask a question, get a direct
                                answer with the source page cited.
                            </p>
                        </div>

                        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                            {pipelineSteps.map((step, idx) => (
                                <div
                                    key={idx}
                                    className="relative flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-2xl font-black text-indigo-600/30 dark:text-indigo-400/30">
                                            {step.step}
                                        </span>
                                        <span className="rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                                            {step.tech}
                                        </span>
                                    </div>
                                    <h4 className="mt-3 text-sm font-semibold text-gray-900 dark:text-white">
                                        {step.name}
                                    </h4>
                                    <p className="mt-2 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                                        {step.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Tech Stack Matrix */}
                <section
                    id="tech-stack"
                    className="border-t border-gray-200 bg-white py-16 sm:py-24 dark:border-gray-700 dark:bg-gray-800/40"
                >
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                                Built with
                            </h2>
                            <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl dark:text-white">
                                Open-source tools running locally
                            </p>
                        </div>

                        <div className="mt-10 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <div className="grid divide-y divide-gray-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-3 dark:divide-gray-700">
                                {techStack.map((tech, idx) => (
                                    <div key={idx} className="p-6">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                                {tech.category}
                                            </span>
                                        </div>
                                        <h4 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
                                            {tech.name}
                                        </h4>
                                        <p className="mt-1.5 text-xs text-gray-600 dark:text-gray-400">
                                            {tech.role}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Limitations & Constraints Section (Transparency) */}
                <section id="limitations" className="py-16 sm:py-24">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6 sm:p-10 dark:border-amber-900/50 dark:bg-amber-950/10">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                                    <svg
                                        className="h-5 w-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                        Known limitations
                                    </h3>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                        Some document types may not be read
                                        perfectly. Here is what to expect.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                {constraints.map((c, idx) => (
                                    <div
                                        key={idx}
                                        className="rounded-lg border border-amber-200/60 bg-white/80 p-4 shadow-sm dark:border-amber-900/30 dark:bg-gray-800/80"
                                    >
                                        <h5 className="text-xs font-semibold text-amber-900 dark:text-amber-300">
                                            {c.title}
                                        </h5>
                                        <p className="mt-1 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                                            {c.desc}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer CTA */}
                <section className="border-t border-gray-200 bg-white py-12 text-center dark:border-gray-700 dark:bg-gray-800">
                    <div className="mx-auto max-w-4xl px-4 sm:px-6">
                        <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Ready to search your documents?
                        </h3>
                        <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                            Sign up for free and start querying your documents
                            in minutes.
                        </p>
                        <div className="mt-6 flex justify-center gap-3">
                            <Link
                                href={
                                    auth.user
                                        ? route('dashboard')
                                        : route('register')
                                }
                                className="rounded-lg bg-indigo-600 px-6 py-2.5 text-xs font-semibold text-white shadow transition hover:bg-indigo-500"
                            >
                                {auth.user
                                    ? 'Go to Dashboard'
                                    : 'Create Free Account'}
                            </Link>
                            <a
                                href="https://github.com/niceWizzard/docuquery"
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                            >
                                View on GitHub
                            </a>
                        </div>
                    </div>
                </section>

                {/* Bottom Bar */}
                <footer className="border-t border-gray-200 bg-gray-100 py-6 text-center text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
                    <p>
                        © {new Date().getFullYear()} DocuQuery. Ask questions,
                        find answers in your documents.
                    </p>
                </footer>
            </div>
        </>
    );
}
