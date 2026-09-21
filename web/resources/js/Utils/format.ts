export function formatBytes(bytes?: number, decimals = 2): string {
    if (!bytes || !+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatDate(dateString?: string): string {
    if (!dateString) return '';
    try {
        let str = dateString.trim();
        // If the date string lacks a timezone offset or 'Z', treat it as UTC
        if (!str.endsWith('Z') && !/[+-]\d{2}:?\d{2}$/.test(str)) {
            str = str.replace(' ', 'T') + 'Z';
        }
        const date = new Date(str);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    } catch {
        return dateString;
    }
}
