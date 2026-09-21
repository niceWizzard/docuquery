import FileDropzone from '@/Components/Uploads/FileDropzone';
import UploadedFileList from '@/Components/Uploads/UploadedFileList';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps, Upload } from '@/types';
import { Head, router, useForm, usePage, usePoll } from '@inertiajs/react';
import { useState } from 'react';

interface UploadsIndexProps extends PageProps {
    data?: Upload[];
    uploadedFiles?: Upload[];
}

export default function Index() {
    const { props } = usePage<UploadsIndexProps>();
    usePoll(5000, {
        only: ['uploadedFiles'],
    });
    const [deletingId, setDeletingId] = useState<number | null>(null);

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

    const handleUploadSubmit = () => {
        if (formData.files.length === 0) return;

        post(route('uploads.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                reset();
            },
        });
    };

    const handleDeleteUpload = (id: number) => {
        setDeletingId(id);
        router.delete(route('uploads.destroy', id), {
            preserveScroll: true,
            onFinish: () => {
                setDeletingId(null);
            },
        });
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
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    {/* Upload Dropzone */}
                    <FileDropzone
                        files={formData.files}
                        onFilesChange={(files) => setData('files', files)}
                        onSubmit={handleUploadSubmit}
                        isUploading={processing}
                        errors={errors}
                        acceptedFormats=".png,.jpg,.jpeg,.pdf"
                        acceptedExtensionsText="PNG, JPG, PDF up to 10MB"
                        maxSizeMB={10}
                    />
                    {/* Uploaded Files */}
                    <UploadedFileList
                        files={props.uploadedFiles ?? []}
                        onDelete={handleDeleteUpload}
                        deletingId={deletingId}
                        title="Your Uploads"
                        description="View and manage all your uploaded documents."
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
