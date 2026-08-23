import TextInput from '@/Components/TextInput';
import UploadedFileCard from '@/Components/Uploads/UploadedFileCard';
import { Upload } from '@/types';
import { formatBytes } from '@/Utils/format';
import { useMemo, useState } from 'react';

interface UploadedFileListProps {
    files: Upload[];
    onDelete: (id: number) => Promise<void> | void;
    deletingId?: number | null;
    title?: string;
    description?: string;
}

export default function UploadedFileList({
    files = [],
    onDelete,
    deletingId = null,
    title = 'Uploaded Documents',
    description = 'Manage and query your uploaded files.',
}: UploadedFileListProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const totalBytes = useMemo(() => {
        return files.reduce((acc, curr) => acc + (curr.file_size || 0), 0);
    }, [files]);

    const statusCounts = useMemo(() => {
        const counts: Record<string, number> = { all: files.length };
        files.forEach((f) => {
            const st = (f.status || 'unknown').toLowerCase();
            counts[st] = (counts[st] || 0) + 1;
        });
        return counts;
    }, [files]);

    const filteredFiles = useMemo(() => {
        return files.filter((file) => {
            const matchesSearch = file.file_name
                .toLowerCase()
                .includes(searchQuery.toLowerCase().trim());
            const matchesStatus =
                statusFilter === 'all' ||
                (file.status || '').toLowerCase() === statusFilter.toLowerCase();
            return matchesSearch && matchesStatus;
        });
    }, [files, searchQuery, statusFilter]);

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                        {title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {description}
                    </p>
                </div>

                {files.length > 0 && (
                    <div>
                        <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                            {files.length} {files.length === 1 ? 'file' : 'files'} ({formatBytes(totalBytes)})
                        </span>
                    </div>
                )}
            </div>

            {/* Filter & Search */}
            {files.length > 0 && (
                <div className="mt-4 flex flex-col gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-700">
                    <div className="relative flex-1 max-w-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <TextInput
                            type="text"
                            placeholder="Search documents..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full !py-1.5 !pl-9 text-xs"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    {/* Status Filter Buttons */}
                    <div className="flex flex-wrap items-center gap-1.5">
                        {['all', 'completed', 'processing', 'pending', 'failed'].map((st) => {
                            const count = statusCounts[st] || 0;
                            if (st !== 'all' && count === 0) return null;
                            const isActive = statusFilter === st;

                            return (
                                <button
                                    key={st}
                                    type="button"
                                    onClick={() => setStatusFilter(st)}
                                    className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition duration-150 ease-in-out ${
                                        isActive
                                            ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    {st} ({count})
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* List / Grid Content */}
            <div className="mt-4">
                {files.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 py-12 text-center dark:border-gray-700">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-400">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                        </div>
                        <h4 className="mt-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                            No files uploaded yet
                        </h4>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Upload documents above to get started.
                        </p>
                    </div>
                ) : filteredFiles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 py-10 text-center dark:border-gray-700">
                        <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h4 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                            No matching files found
                        </h4>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Try searching for something else or clearing filters.
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                setSearchQuery('');
                                setStatusFilter('all');
                            }}
                            className="mt-3 text-xs font-medium text-gray-700 underline hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                        >
                            Reset filters
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredFiles.map((file) => (
                            <UploadedFileCard
                                key={`upload-${file.id}`}
                                file={file}
                                onDelete={onDelete}
                                isDeleting={deletingId === file.id}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
