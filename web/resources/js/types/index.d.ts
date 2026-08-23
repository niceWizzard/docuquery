export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
}

export type UploadStatus =
    | 'pending'
    | 'processing'
    | 'completed'
    | 'cancelled'
    | 'failed';

export interface Upload {
    id: number;
    file_name: string;
    file_url: string;
    mime_type: string;
    file_size: number;
    status: UploadStatus | string;
    created_at?: string;
    updated_at?: string;
    uploader_id?: number;
}

export type PageProps<
    T extends object = object,
> = T & {
    auth: {
        user: User;
    };
};


