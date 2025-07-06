"use client"
import { Suspense } from "react"
import PlayGameComponent from "./PlayGameComponent"

function PlayPageFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 p-4">
      <div className="max-w-md mx-auto pt-8">
        <div className="text-center">
          <div className="text-6xl mb-4">🎮</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#FE11C5] to-purple-600 bg-clip-text text-transparent mb-4">
            Loading Game...
          </h1>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FE11C5] mx-auto"></div>
        </div>
      </div>
    </div>
  )
}

export default function PlayPage() {
  return (
    <Suspense fallback={<PlayPageFallback />}>
      <PlayGameComponent />
    </Suspense>
  )
}
