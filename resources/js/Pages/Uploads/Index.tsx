import React from 'react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index() {
  return (
    <AuthenticatedLayout>
      <div className="text-gray-900 dark:text-gray-100 p-8">
        <span>Index</span>
      </div>
    </AuthenticatedLayout>
  )
}
