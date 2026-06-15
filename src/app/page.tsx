'use client'

import dynamic from 'next/dynamic'

const PropertyMap = dynamic(() => import('../components/PropertyMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-gray-400 text-sm">
      Loading map...
    </div>
  ),
})

export default function Home() {
  return (
    <main className="w-full h-screen">
      <PropertyMap />
    </main>
  )
}
