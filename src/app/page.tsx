"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useState } from "react"

export default function Home() {
  const [username, setUsername] = useState("")
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username.trim() !== "") {
      router.push(`/play?username=${encodeURIComponent(username)}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 p-4">
      <div className="max-w-lg mx-auto pt-8 sm:pt-16">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="text-8xl mb-6">🎮</div>
          <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-[#FE11C5] to-purple-600 bg-clip-text text-transparent mb-4">
            2048 ZK Game
          </h1>
          <p className="text-gray-600 text-lg mb-2">Zero-Knowledge Proof Gaming</p>
          <p className="text-gray-500 text-sm">Play • Prove • Share your achievements!</p>
        </div>

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-8">
          <div className="text-center mb-8">
            <div className="text-4xl mb-4">✨</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Ready to Play?</h2>
            <p className="text-gray-600">Enter your Twitter username to start your ZK gaming journey!</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <span className="text-lg">🐦</span>
                Twitter Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter your Twitter handle"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-4 border-2 border-pink-100 text-[#FE11C5] rounded-xl focus:border-[#FE11C5] focus:outline-none transition-all duration-200 bg-white/70 backdrop-blur-sm text-lg placeholder-gray-400"
                  required
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <span className="text-sm">@</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <span>💡</span>
                Your username will be used for proof verification
              </p>
            </div>

            <button
              type="submit"
              disabled={!username.trim()}
              className="w-full bg-gradient-to-r from-[#FE11C5] to-purple-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 text-lg"
            >
              <span className="text-2xl">🚀</span>
              Start Playing 2048 ZK
            </button>
          </form>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="font-bold text-gray-800 mb-2">Classic 2048</h3>
            <p className="text-xs text-gray-600">Combine tiles to reach 2048 and beyond!</p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg">
            <div className="text-3xl mb-3">🔐</div>
            <h3 className="font-bold text-gray-800 mb-2">ZK Proofs</h3>
            <p className="text-xs text-gray-600">Every move is cryptographically verified</p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg">
            <div className="text-3xl mb-3">🏆</div>
            <h3 className="font-bold text-gray-800 mb-2">Share & Compete</h3>
            <p className="text-xs text-gray-600">Share your proven achievements on Twitter</p>
          </div>
        </div>

        {/* Game Preview */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg mb-8">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center justify-center gap-2">
            <span className="text-xl">👀</span>
            Game Preview
          </h3>
          <div className="grid grid-cols-4 gap-2 max-w-48 mx-auto">
            {/* Sample tiles */}
            <div className="aspect-square bg-gradient-to-br from-pink-100 to-pink-200 rounded-lg flex items-center justify-center text-sm font-bold text-pink-800">
              2
            </div>
            <div className="aspect-square bg-gradient-to-br from-pink-200 to-pink-300 rounded-lg flex items-center justify-center text-sm font-bold text-pink-900">
              4
            </div>
            <div className="aspect-square bg-gradient-to-br from-[#FE11C5] to-pink-500 rounded-lg flex items-center justify-center text-sm font-bold text-white">
              8
            </div>
            <div className="aspect-square bg-white/60 rounded-lg shadow-inner"></div>
            <div className="aspect-square bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center text-sm font-bold text-white">
              16
            </div>
            <div className="aspect-square bg-white/60 rounded-lg shadow-inner"></div>
            <div className="aspect-square bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg flex items-center justify-center text-sm font-bold text-white">
              32
            </div>
            <div className="aspect-square bg-white/60 rounded-lg shadow-inner"></div>
            <div className="aspect-square bg-white/60 rounded-lg shadow-inner"></div>
            <div className="aspect-square bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-sm font-bold text-white">
              64
            </div>
            <div className="aspect-square bg-white/60 rounded-lg shadow-inner"></div>
            <div className="aspect-square bg-gradient-to-br from-pink-100 to-pink-200 rounded-lg flex items-center justify-center text-sm font-bold text-pink-800">
              2
            </div>
            <div className="aspect-square bg-white/60 rounded-lg shadow-inner"></div>
            <div className="aspect-square bg-white/60 rounded-lg shadow-inner"></div>
            <div className="aspect-square bg-white/60 rounded-lg shadow-inner"></div>
            <div className="aspect-square bg-white/60 rounded-lg shadow-inner"></div>
          </div>
          <p className="text-xs text-gray-500 mt-4">Use arrow keys to combine tiles and reach higher scores!</p>
        </div>

        {/* How it Works */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
          <h3 className="font-bold text-gray-800 mb-4 text-center flex items-center justify-center gap-2">
            <span className="text-xl">🔮</span>
            How ZK Proofs Work
          </h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start gap-3">
              <span className="text-lg">1️⃣</span>
              <div>
                <p className="font-medium text-gray-700">Play the Game</p>
                <p className="text-xs">Every move you make is recorded and verified</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-lg">2️⃣</span>
              <div>
                <p className="font-medium text-gray-700">Generate Proofs</p>
                <p className="text-xs">Each action creates a cryptographic proof</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-lg">3️⃣</span>
              <div>
                <p className="font-medium text-gray-700">Share Achievement</p>
                <p className="text-xs">Your final score is provably authentic</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Powered by Zero-Knowledge Technology ⚡</p>
        </div>
      </div>
    </div>
  )
}
