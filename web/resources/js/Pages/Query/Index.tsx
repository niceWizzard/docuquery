import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Dashboard({
    result,
}: PageProps<{ result?: { [key: string]: any } }>) {
    const pageProps = usePage<PageProps<{ result?: { [key: string]: any } }>>().props;
    const queryResult = pageProps.result?.queryResult ?? result?.queryResult;

    const { data, setData, post, processing } = useForm({
        query: '',
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('query'), {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-2 bg-white p-8 shadow-sm sm:rounded-lg dark:bg-gray-800"
                    >
                        <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-200">
                            Find anything on your document
                        </h2>
                        <div className="flex flex-row gap-2">
                            <TextInput
                                disabled={processing}
                                className="w-full"
                                placeholder="What do you want to search?"
                                value={data.query}
                                onChange={(e) =>
                                    setData('query', e.target.value)
                                }
                            />
                            <PrimaryButton disabled={processing}>
                                {processing ? 'Searching...' : 'Submit'}
                            </PrimaryButton>
                        </div>
                    </form>

                    {queryResult && (
                        <div className="mt-6 bg-white p-6 shadow-sm sm:rounded-lg dark:bg-gray-800">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                                Results
                            </h3>
                            <pre className="overflow-x-auto whitespace-pre-wrap rounded bg-gray-100 p-4 text-sm text-gray-900 dark:bg-gray-900 dark:text-gray-100">
                                {JSON.stringify(queryResult, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
