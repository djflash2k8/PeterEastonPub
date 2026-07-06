'use client'

import Link from 'next/link'

export default function AdminPanel() {
  return (
    <div className="p-8 text-black">
      <h1 className="text-2xl font-bold mb-6 italic uppercase border-b-4 border-black pb-2">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/admin/global-styling" className="p-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all bg-white">
          <h2 className="font-black text-xl uppercase mb-2">Global Styling</h2>
          <p className="text-gray-600 font-medium text-sm">Change colors, fonts, and overall site appearance.</p>
        </Link>
        <Link href="/admin/page-layout" className="p-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all bg-white">
          <h2 className="font-black text-xl uppercase mb-2">Page Layout</h2>
          <p className="text-gray-600 font-medium text-sm">Control main page layout and element positioning.</p>
        </Link>
        <Link href="/admin/edit-events" className="p-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all bg-white">
          <h2 className="font-black text-xl uppercase mb-2">Edit Events</h2>
          <p className="text-gray-600 font-medium text-sm">Add, remove, or modify live events schedule.</p>
        </Link>
        <Link href="/admin/edit-hours" className="p-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all bg-white">
          <h2 className="font-black text-xl uppercase mb-2">Edit Hours</h2>
          <p className="text-gray-600 font-medium text-sm">Update your business opening and closing times.</p>
        </Link>
        <Link href="/admin/edit-banner" className="p-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all bg-white">
          <h2 className="font-black text-xl uppercase mb-2">Edit Banner</h2>
          <p className="text-gray-600 font-medium text-sm">Change image displayed on home page.</p>
        </Link>
        <Link href="/admin/edit-contact" className="p-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all bg-white">
          <h2 className="font-black text-xl uppercase mb-2">Edit Contact</h2>
          <p className="text-gray-600 font-medium text-sm">Update phone, email, and location details.</p>
        </Link>
        <Link href="/admin/edit-home" className="p-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all bg-white">
          <h2 className="font-black text-xl uppercase mb-2">Edit Home Page</h2>
          <p className="text-gray-600 font-medium text-sm">Update main page content and welcome message.</p>
        </Link>
        <Link href="/admin/about" className="p-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all bg-white">
          <h2 className="font-black text-xl uppercase mb-2">Edit About</h2>
          <p className="text-gray-600 font-medium text-sm">Create, edit, or delete articles on About page.</p>
        </Link>
        <Link href="/admin/edit-navigation" className="p-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all bg-white">
          <h2 className="font-black text-xl uppercase mb-2">Edit Admin Navigation</h2>
          <p className="text-gray-600 font-medium text-sm">Customize admin panel navigation header text.</p>
        </Link>
        <Link href="/admin/edit-frontend-navigation" className="p-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all bg-white">
          <h2 className="font-black text-xl uppercase mb-2">Edit Website Navigation</h2>
          <p className="text-gray-600 font-medium text-sm">Customize public website navigation bar.</p>
        </Link>
        <Link href="/admin/settings" className="p-6 border-4 border-pink-500 shadow-[4px_4px_0px_0px_rgba(236,72,153,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all bg-pink-50">
          <h2 className="font-black text-xl uppercase mb-2 text-pink-600">Settings</h2>
          <p className="text-gray-600 font-medium text-sm">Configure Instagram integration and auto-creation settings.</p>
        </Link>
      </div>
    </div>
  )
}