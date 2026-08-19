import React from 'react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';

export default function Index(
  {data} : PageProps<{data : any}>
) {
  return (
    <AuthenticatedLayout>
      <div className="text-gray-900 dark:text-gray-100 p-8">
        <span>Index</span>
        <pre>DATA: {JSON.stringify(data)}</pre>
      </div>
    </AuthenticatedLayout>
  )
}
