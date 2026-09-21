import { Head, Link } from '@inertiajs/react';

interface Props {
    status: number;
}

export default function ErrorPage({ status }: Props) {
    const title =
        {
            503: '503: Service Unavailable',
            500: '500: Server Error',
            404: '404: Page Not Found',
            403: '403: Forbidden',
        }[status] || 'An Error Occurred';

    const description =
        {
            503: 'Sorry, we are doing some maintenance. Please check back soon.',
            500: 'Whoops, something went wrong on our servers.',
            404: 'Sorry, the page you are looking for could not be found.',
            403: 'Sorry, you are forbidden from accessing this page.',
        }[status] || 'An unexpected error has occurred.';

    return (
        <div className="bg-background text-foreground flex min-h-screen flex-col items-center justify-center p-6 text-center">
            <Head title={title} />
            <div className="max-w-md space-y-4">
                <h1 className="text-primary text-6xl font-extrabold tracking-tight">
                    {status}
                </h1>
                <h2 className="text-2xl font-semibold tracking-tight">
                    {title}
                </h2>
                <p className="text-muted-foreground">{description}</p>
                <div className="pt-4">
                    <Link
                        href="/"
                        className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow transition-colors focus-visible:outline-none focus-visible:ring-1"
                    >
                        Return Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
