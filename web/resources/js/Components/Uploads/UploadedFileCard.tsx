import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import StatusBadge from '@/Components/Uploads/StatusBadge';
import { Upload } from '@/types';
import { formatBytes, formatDate } from '@/Utils/format';
import { useState } from 'react';

interface UploadedFileCardProps {
    file: Upload;
    onDelete: (id: number) => Promise<void> | void;
    isDeleting?: boolean;
}

export default function UploadedFileCard({
    file,
    onDelete,
    isDeleting = false,
}: UploadedFileCardProps) {
    const [imageError, setImageError] = useState(false);
    const [confirmingDeletion, setConfirmingDeletion] = useState(false);

    const isImage =
        !imageError &&
        (file.mime_type?.startsWith('image/') ||
            /\.(png|jpe?g|webp|gif|svg)$/i.test(file.file_name));
    const isPdf =
        file.mime_type === 'application/pdf' ||
        /\.pdf$/i.test(file.file_name);

    const handleDelete = async () => {
        setConfirmingDeletion(false);
        await onDelete(file.id);
    };

    return (
        <>
            <div className="flex flex-col justify-between rounded-lg border border-gray-200 bg-white p-4 transition duration-150 ease-in-out hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600">
                <div className="flex items-start space-x-3.5">
                    {/* Thumbnail / Neutral File Icon */}
                    <div className="relative shrink-0">
                        {isImage && file.file_url ? (
                            <img
                                src={file.file_url}
                                alt={file.file_name}
                                className="h-11 w-11 rounded-md border border-gray-200 object-cover dark:border-gray-700"
                                onError={() => setImageError(true)}
                                loading="lazy"
                            />
                        ) : isPdf ? (
                            <div className="flex h-11 w-11 flex-col items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-900/60 dark:text-gray-300">
                                <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.8}
                                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                    />
                                </svg>
                                <span className="text-[9px] font-bold tracking-tight">PDF</span>
                            </div>
                        ) : (
                            <div className="flex h-11 w-11 items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-700 dark:bg-gray-900/60 dark:text-gray-400">
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
                        )}
                    </div>

                    {/* File Info */}
                    <div className="min-w-0 flex-1">
                        <p
                            className="truncate text-sm font-medium text-gray-900 dark:text-gray-100"
                            title={file.file_name}
                        >
                            {file.file_name}
                        </p>

                        <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                            <span>{formatBytes(file.file_size)}</span>
                            {file.mime_type && (
                                <>
                                    <span>•</span>
                                    <span className="truncate max-w-[130px]">{file.mime_type}</span>
                                </>
                            )}
                        </div>

                        <div className="mt-2.5 flex items-center gap-2">
                            <StatusBadge status={file.status} />
                            {file.created_at && (
                                <span className="text-[11px] text-gray-400 dark:text-gray-500">
                                    {formatDate(file.created_at)}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions Bar */}
                <div className="mt-4 flex items-center justify-end gap-2 border-t border-gray-100 pt-3 dark:border-gray-700/80">
                    {file.file_url ? (
                        <a
                            href={file.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            tabIndex={0}
                            className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 transition duration-150 ease-in-out hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:border-gray-600 dark:bg-gray-850 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-500"
                        >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            View
                        </a>
                    ) : (
                        <button
                            type="button"
                            disabled
                            tabIndex={-1}
                            className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-400 opacity-60 cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500"
                        >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            View
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => setConfirmingDeletion(true)}
                        disabled={isDeleting}
                        tabIndex={0}
                        className="inline-flex items-center gap-1 rounded-md border border-transparent px-2.5 py-1 text-xs font-medium text-red-600 transition duration-150 ease-in-out hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:text-red-300"
                        title="Delete file"
                    >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                    </button>
                </div>

            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                show={confirmingDeletion}
                onClose={() => setConfirmingDeletion(false)}
                maxWidth="md"
            >
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Delete File
                    </h3>

                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Are you sure you want to delete{' '}
                        <span className="font-semibold text-gray-900 dark:text-gray-200">
                            {file.file_name}
                        </span>
                        ? This action cannot be undone.
                    </p>

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton
                            onClick={() => setConfirmingDeletion(false)}
                        >
                            Cancel
                        </SecondaryButton>
                        <DangerButton
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </>
    );
}
