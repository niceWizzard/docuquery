import PrimaryButton from '@/Components/PrimaryButton';
import { formatBytes } from '@/Utils/format';
import { ChangeEvent, DragEvent, useEffect, useState } from 'react';

interface FileDropzoneProps {
    files: File[];
    onFilesChange: (files: File[]) => void;
    onSubmit: () => void;
    isUploading?: boolean;
    error?: string;
    errors?: Record<string, string>;
    acceptedFormats?: string;
    acceptedExtensionsText?: string;
    maxSizeMB?: number;
}

export default function FileDropzone({
    files,
    onFilesChange,
    onSubmit,
    isUploading = false,
    error,
    errors,
    acceptedFormats = '.png,.jpg,.jpeg,.pdf',
    acceptedExtensionsText = 'PNG, JPG, PDF up to 10MB',
    maxSizeMB = 10,
}: FileDropzoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [previewUrls, setPreviewUrls] = useState<{ [key: string]: string }>({});

    const hasOverSizeFile = files.some(
        (file) => file.size > maxSizeMB * 1024 * 1024,
    );

    // Collect all error messages from `error` prop and `errors` object (e.g. `files`, `files.0`, etc.)
    const errorMessages: string[] = [];
    if (error) {
        errorMessages.push(error);
    }
    if (errors) {
        Object.entries(errors).forEach(([key, msg]) => {
            if ((key === 'files' || key.startsWith('files.')) && msg && !errorMessages.includes(msg)) {
                errorMessages.push(msg);
            }
        });
    }
    if (hasOverSizeFile) {
        const msg = `One or more files exceed the maximum allowed size of ${maxSizeMB}MB.`;
        if (!errorMessages.includes(msg)) {
            errorMessages.push(msg);
        }
    }

    useEffect(() => {
        const urls: { [key: string]: string } = {};
        files.forEach((file, index) => {
            if (file.type.startsWith('image/')) {
                urls[`${file.name}-${index}`] = URL.createObjectURL(file);
            }
        });
        setPreviewUrls(urls);

        return () => {
            Object.values(urls).forEach((url) => URL.revokeObjectURL(url));
        };
    }, [files]);

    const addFiles = (newFiles: FileList | File[]) => {
        const incoming = Array.from(newFiles);
        const existingKeys = new Set(files.map((f) => `${f.name}-${f.size}`));
        const uniqueIncoming = incoming.filter(
            (f) => !existingKeys.has(`${f.name}-${f.size}`),
        );
        onFilesChange([...files, ...uniqueIncoming]);
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            addFiles(e.target.files);
            e.target.value = '';
        }
    };

    const removeFile = (indexToRemove: number) => {
        onFilesChange(files.filter((_, idx) => idx !== indexToRemove));
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
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            addFiles(e.dataTransfer.files);
        }
    };

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    if (files.length > 0 && !isUploading && !hasOverSizeFile) {
                        onSubmit();
                    }
                }}
                className="space-y-4"
            >
                {/* Drag & Drop Area */}
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
                        isDragging
                            ? 'border-gray-500 bg-gray-50 dark:border-gray-400 dark:bg-gray-700/20'
                            : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
                    }`}
                >
                    <input
                        type="file"
                        name="files"
                        id="file-upload"
                        multiple
                        accept={acceptedFormats}
                        onChange={handleFileChange}
                        disabled={isUploading}
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
                    />

                    <div className="pointer-events-none flex flex-col items-center text-center">
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
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
                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                />
                            </svg>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            <span className="font-semibold text-gray-900 underline dark:text-gray-100">
                                Click to upload
                            </span>{' '}
                            or drag and drop
                        </p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {acceptedExtensionsText}
                        </p>
                    </div>
                </div>

                {/* Validation Error Messages */}
                {errorMessages.length > 0 && (
                    <div className="space-y-1">
                        {errorMessages.map((msg, index) => (
                            <p key={index} className="text-xs font-medium text-red-600 dark:text-red-400">
                                {msg}
                            </p>
                        ))}
                    </div>
                )}

                {/* Selected Files Staging List */}
                {files.length > 0 && (
                    <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-2 dark:border-gray-700">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                Selected ({files.length})
                            </span>
                            <button
                                type="button"
                                onClick={() => onFilesChange([])}
                                disabled={isUploading}
                                className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
                            >
                                Clear all
                            </button>
                        </div>

                        <div className="grid gap-2.5 sm:grid-cols-2">
                            {files.map((file, index) => {
                                const key = `${file.name}-${index}`;
                                const isImage = file.type.startsWith('image/');
                                const isPdf =
                                    file.type === 'application/pdf' ||
                                    file.name.toLowerCase().endsWith('.pdf');
                                const previewUrl = previewUrls[key];
                                const isOverSize = file.size > maxSizeMB * 1024 * 1024;

                                return (
                                    <div
                                        key={key}
                                        className={`flex items-center justify-between rounded-lg border p-2.5 transition duration-150 ${
                                            isOverSize
                                                ? 'border-red-300 bg-red-50/40 dark:border-red-800/60 dark:bg-red-950/20'
                                                : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/40'
                                        }`}
                                    >
                                        <div className="flex min-w-0 items-center space-x-3">
                                            {/* Preview */}
                                            {isImage && previewUrl ? (
                                                <img
                                                    src={previewUrl}
                                                    alt={file.name}
                                                    className="h-10 w-10 shrink-0 rounded-md border border-gray-200 object-cover dark:border-gray-700"
                                                />
                                            ) : isPdf ? (
                                                <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                                    <span className="text-[10px] font-bold">PDF</span>
                                                </div>
                                            ) : (
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
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

                                            <div className="min-w-0">
                                                <p
                                                    className="truncate text-xs font-medium text-gray-800 dark:text-gray-200"
                                                    title={file.name}
                                                >
                                                    {file.name}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[11px] text-gray-500 dark:text-gray-400">
                                                        {formatBytes(file.size)}
                                                    </span>
                                                    {isOverSize && (
                                                        <span className="text-[11px] font-medium text-red-600 dark:text-red-400">
                                                            (Exceeds {maxSizeMB}MB)
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Remove Action */}
                                        <button
                                            type="button"
                                            onClick={() => removeFile(index)}
                                            disabled={isUploading}
                                            className="rounded p-1 text-gray-400 transition hover:text-red-600 disabled:opacity-50 dark:hover:text-red-400"
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

                {/* Submit */}
                <div className="flex items-center justify-end pt-2">
                    <PrimaryButton
                        type="submit"
                        disabled={isUploading || files.length === 0 || hasOverSizeFile}
                    >
                        {isUploading ? 'Uploading...' : 'Upload'}
                    </PrimaryButton>
                </div>
            </form>
        </div>
    );
}
