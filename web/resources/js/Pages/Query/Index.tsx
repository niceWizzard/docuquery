import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { ChangeEvent } from 'react';

export default function Dashboard({
    result,
}: PageProps<{ result?: { [key: string]: any } }>) {
    const { data, setData, post,processing } = useForm({
        query: '',
    });

    const handleSubmit = (e: ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(route('query'));
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
                        <h2 className="text-xl font-bold tracking-tight text-gray-200">
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
                                Submit
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>

            <pre>{JSON.stringify(result?.queryResult, null, 2)}</pre>
        </AuthenticatedLayout>
    );
}
