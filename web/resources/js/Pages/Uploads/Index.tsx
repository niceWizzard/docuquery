import DangerButton from '@/Components/DangerButton';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ChangeEvent, DragEvent, FormEventHandler, useState } from 'react';

interface Upload {
    id: number;
    file_name: string;
    file_url: string;
    mime_type: string;
    file_size: number;
    status: string;
}

function formatBytes(bytes?: number, decimals = 2) {
    if (!bytes || !+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export default function Index({
    data,
    uploadedFiles = data ?? [],
}: PageProps<{ data?: Upload[]; uploadedFiles?: Upload[] }>) {
    const {
        data: formData,
        setData,
        post,
        processing,
        errors,
        reset,
    } = useForm<{
        files: File[];
    }>({
        files: [],
    });

    const [isDragging, setIsDragging] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (formData.files.length === 0) return;

        post(route('uploads.store'), {
            forceFormData: true,
            onSuccess: () => reset(),
        });
    };

    const addFiles = (newFiles: FileList | File[]) => {
        const incoming = Array.from(newFiles);
        setData((prev) => ({
            files: [...prev.files, ...incoming],
        }));
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            addFiles(e.target.files);
            e.target.value = '';
        }
    };

    const removeFile = (indexToRemove: number) => {
        setData(
            'files',
            formData.files.filter((_, idx) => idx !== indexToRemove),
        );
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files) {
            addFiles(e.dataTransfer.files);
        }
    };
    const deleteUpload = async (id: number) => {
        if (confirm('Are you sure you want to delete this file?')) {
            router.delete(route('uploads.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    File Uploads
                </h2>
            }
        >
            <Head title="Uploads" />

            <div className="py-12">
                <div className="mx-auto max-w-5xl space-y-6 sm:px-6 lg:px-8">
                    {/* Upload Card */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <form onSubmit={submit} className="space-y-4">
                            {/* Drag & Drop Area */}
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors ${
                                    isDragging
                                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20'
                                        : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
                                }`}
                            >
                                <input
                                    type="file"
                                    name="files"
                                    id="file-upload"
                                    multiple
                                    accept=".png,.jpg,.jpeg,.pdf"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                />

                                <div className="flex flex-col items-center text-center">
                                    <div className="mb-3 rounded-full bg-indigo-50 p-3 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                                        <svg
                                            className="h-7 w-7"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                            />
                                        </svg>
                                    </div>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        <span className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
                                            Click to browse
                                        </span>{' '}
                                        or drag and drop files here
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        PNG, JPG, PDF up to 10MB
                                    </p>
                                </div>
                            </div>

                            {errors.files && (
                                <p className="text-sm font-medium text-red-500">
                                    {errors.files}
                                </p>
                            )}

                            {/* Selected Files List */}
                            {formData.files.length > 0 && (
                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Selected Files (
                                            {formData.files.length})
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setData('files', [])}
                                            className="text-xs font-medium text-red-500 hover:underline"
                                        >
                                            Clear all
                                        </button>
                                    </div>

                                    <div className="grid gap-2.5 sm:grid-cols-2">
                                        {formData.files.map((file, index) => {
                                            const isImage =
                                                file.type.startsWith('image/');
                                            const isPdf =
                                                file.type === 'application/pdf';

                                            return (
                                                <div
                                                    key={`${file.name}-${index}`}
                                                    className="group flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-2.5 transition-all hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900/50 dark:hover:bg-gray-900"
                                                >
                                                    <div className="flex min-w-0 items-center space-x-3">
                                                        {/* Thumbnail / Icon */}
                                                        {isImage ? (
                                                            <img
                                                                src={URL.createObjectURL(
                                                                    file,
                                                                )}
                                                                alt={file.name}
                                                                className="h-10 w-10 shrink-0 rounded-lg border border-gray-200 object-cover dark:border-gray-700"
                                                                onLoad={(e) =>
                                                                    URL.revokeObjectURL(
                                                                        (
                                                                            e.target as HTMLImageElement
                                                                        ).src,
                                                                    )
                                                                }
                                                            />
                                                        ) : isPdf ? (
                                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-xs font-bold text-red-600 dark:bg-red-950/60 dark:text-red-400">
                                                                PDF
                                                            </div>
                                                        ) : (
                                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                                                                <svg
                                                                    className="h-5 w-5"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    stroke="currentColor"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={
                                                                            2
                                                                        }
                                                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                                    />
                                                                </svg>
                                                            </div>
                                                        )}

                                                        <div className="min-w-0">
                                                            <p
                                                                className="truncate text-sm font-medium text-gray-800 dark:text-gray-200"
                                                                title={
                                                                    file.name
                                                                }
                                                            >
                                                                {file.name}
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                {formatBytes(
                                                                    file.size,
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Remove Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeFile(index)
                                                        }
                                                        className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-red-500 dark:hover:bg-gray-800 dark:hover:text-red-400"
                                                        title="Remove file"
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
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Submit Button */}
                            <div className="flex justify-end pt-2">
                                <PrimaryButton
                                    type="submit"
                                    disabled={
                                        processing ||
                                        formData.files.length === 0
                                    }
                                >
                                    {processing
                                        ? 'Uploading...'
                                        : 'Upload Files'}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>

                    {/* Upload History Section */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                            Your Uploads
                        </h3>

                        <div className="mt-4">
                            {uploadedFiles.length === 0 ? (
                                <p className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                                    No files uploaded yet.
                                </p>
                            ) : (
                                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                                    {uploadedFiles.map((file) => {
                                        const isImage =
                                            file.mime_type?.startsWith(
                                                'image/',
                                            );
                                        const isPdf =
                                            file.mime_type ===
                                            'application/pdf';

                                        return (
                                            <div
                                                key={`upload-${file.id}`}
                                                className="flex flex-col justify-between rounded-lg border border-gray-200 bg-gray-50 p-4 transition-all hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900/40 dark:hover:bg-gray-900"
                                            >
                                                <div className="flex items-start space-x-3">
                                                    {/* Thumbnail / Icon */}
                                                    {isImage &&
                                                    file.file_url ? (
                                                        <img
                                                            src={file.file_url}
                                                            alt={file.file_name}
                                                            className="h-10 w-10 shrink-0 rounded-lg border border-gray-200 object-cover dark:border-gray-700"
                                                            onError={(e) => {
                                                                // Fallback if image fails to load
                                                                (
                                                                    e.target as HTMLElement
                                                                ).style.display =
                                                                    'none';
                                                            }}
                                                        />
                                                    ) : isPdf ? (
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-xs font-bold text-red-600 dark:bg-red-950/60 dark:text-red-400">
                                                            PDF
                                                        </div>
                                                    ) : (
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                                            <svg
                                                                className="h-5 w-5"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={
                                                                        2
                                                                    }
                                                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                                />
                                                            </svg>
                                                        </div>
                                                    )}

                                                    <div className="min-w-0 flex-1">
                                                        <p
                                                            className="truncate text-sm font-medium text-gray-900 dark:text-gray-100"
                                                            title={
                                                                file.file_name
                                                            }
                                                        >
                                                            {file.file_name}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            {formatBytes(
                                                                file.file_size,
                                                            )}
                                                            {file.mime_type
                                                                ? ` • ${file.mime_type}`
                                                                : ''}
                                                        </p>
                                                        <p className="w-fit rounded-sm bg-gray-400 px-1 py-0.5 text-xs italic tracking-tighter text-gray-900">
                                                            {file.status}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-3 flex justify-end gap-2">
                                                    <Link
                                                        href={file.file_url}
                                                        target="_blank"
                                                        className="inline-flex items-center rounded-md border border-transparent bg-gray-600 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 active:bg-gray-700 dark:focus:ring-offset-gray-800"
                                                    >
                                                        View
                                                    </Link>
                                                    <DangerButton
                                                        className="!px-2.5 !py-1 text-xs"
                                                        onClick={() =>
                                                            deleteUpload(
                                                                file.id,
                                                            )
                                                        }
                                                    >
                                                        Delete
                                                    </DangerButton>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
