"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/libs/supabase"
import Link from "next/link"

interface LeaderboardEntry {
  id: number
  username: string
  proof_hash: string
  top_score: number
  created_at: string
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("succinct2048")
        .select("*")
        .order("top_score", { ascending: false })
        .limit(50)

      if (error) {
        throw error
      }

      setLeaderboard(data || [])
    } catch (err) {
      console.error("Error fetching leaderboard:", err)
      setError("Failed to load leaderboard")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return "🥇"
      case 2:
        return "🥈"
      case 3:
        return "🥉"
      default:
        return "🏅"
    }
  }

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white"
      case 2:
        return "bg-gradient-to-r from-gray-400 to-gray-600 text-white"
      case 3:
        return "bg-gradient-to-r from-amber-600 to-amber-800 text-white"
      default:
        return "bg-white/80 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 p-4">
        <div className="max-w-4xl mx-auto pt-8">
          <div className="text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#FE11C5] to-purple-600 bg-clip-text text-transparent mb-4">
              Loading Leaderboard...
            </h1>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FE11C5] mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 p-4">
        <div className="max-w-4xl mx-auto pt-8">
          <div className="text-center">
            <div className="text-6xl mb-4">😅</div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent mb-4">
              Oops! Something went wrong
            </h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchLeaderboard}
              className="bg-gradient-to-r from-[#FE11C5] to-purple-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 p-4">
      <div className="max-w-4xl mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-8xl mb-6">🏆</div>
          <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-[#FE11C5] to-purple-600 bg-clip-text text-transparent mb-4">
            ZK Leaderboard
          </h1>
          <p className="text-gray-600 text-lg mb-2">Top Verified Scores</p>
          <p className="text-gray-500 text-sm">Cryptographically proven achievements</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg">
            <div className="text-3xl mb-2">👥</div>
            <div className="text-2xl font-bold text-gray-800">{leaderboard.length}</div>
            <div className="text-sm text-gray-600">Total Players</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg">
            <div className="text-3xl mb-2">🎯</div>
            <div className="text-2xl font-bold text-gray-800">
              {leaderboard.length > 0 ? leaderboard[0].top_score.toLocaleString() : "0"}
            </div>
            <div className="text-sm text-gray-600">Highest Score</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg">
            <div className="text-3xl mb-2">🔐</div>
            <div className="text-2xl font-bold text-gray-800">{leaderboard.length}</div>
            <div className="text-sm text-gray-600">Verified Proofs</div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <span className="text-3xl">📊</span>
              Top Scores
            </h2>
            <button
              onClick={fetchLeaderboard}
              className="bg-gradient-to-r from-[#FE11C5] to-purple-600 text-white font-medium py-2 px-4 rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 text-sm"
            >
              🔄 Refresh
            </button>
          </div>

          {leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎮</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No scores yet!</h3>
              <p className="text-gray-600 mb-6">Be the first to set a verified score</p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FE11C5] to-purple-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <span className="text-xl">🚀</span>
                Start Playing
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry, index) => {
                const rank = index + 1
                return (
                  <div
                    key={entry.id}
                    className={`${getRankStyle(rank)} backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        {/* Rank */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-2xl sm:text-3xl">{getRankEmoji(rank)}</span>
                          <span className="font-bold text-lg sm:text-xl">#{rank}</span>
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg sm:text-xl">🐦</span>
                            <span className="font-bold text-base sm:text-lg truncate">@{entry.username}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs sm:text-sm opacity-75">
                            <span>🔐</span>
                            <span className="font-mono truncate">{entry.proof_hash.substring(0, 12)}...</span>
                          </div>
                        </div>
                      </div>

                      {/* Score & Date */}
                      <div className="text-right shrink-0">
                        <div className="text-xl sm:text-2xl font-bold mb-1">{entry.top_score.toLocaleString()}</div>
                        <div className="text-xs sm:text-sm opacity-75">{formatDate(entry.created_at)}</div>
                      </div>
                    </div>

                    {/* Full Proof Hash (expandable on hover) */}
                    <div className="mt-3 pt-3 border-t border-white/20">
                      <div className="text-xs font-mono break-all opacity-60 hover:opacity-100 transition-opacity">
                        <span className="font-medium">Full Proof:</span> {entry.proof_hash}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="bg-gradient-to-r from-[#FE11C5] to-purple-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-3"
          >
            <span className="text-2xl">🎮</span>
            Play 2048 ZK
          </Link>

          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
              `🏆 Check out the ZK Leaderboard for 2048!\n\n${
                leaderboard.length > 0
                  ? `👑 Current champion: @${leaderboard[0].username} with ${leaderboard[0].top_score.toLocaleString()} points!`
                  : "Be the first to set a verified score!"
              }\n\n🔐 Every score is cryptographically verified with Zero-Knowledge Proofs!\n\n🎯 Think you can make it to the top?\n\n#ZKProof #Web3Gaming #2048Challenge #Leaderboard`,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-3"
          >
            <span className="text-2xl">🐦</span>
            Share Leaderboard
          </a>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-gray-500">
          <p>All scores are cryptographically verified ⚡</p>
          <p className="mt-1">Powered by Zero-Knowledge Technology</p>
        </div>
      </div>
    </div>
  )
}
