"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { supabase } from "@/libs/supabase"
import Link from "next/link"

export default function PlayGameComponent() {
  const [grid, setGrid] = useState<number[][]>([])
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [username, setUsername] = useState("")
  const [moveStatus, setMoveStatus] = useState("")
  const [showFinalProofModal, setShowFinalProofModal] = useState(false)
  const [finalProofStatus, setFinalProofStatus] = useState("")
  const [proofHash, setProofHash] = useState("")
  const [savedToDatabase, setSavedToDatabase] = useState(false)
  const searchParams = useSearchParams()
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const initialUsername = searchParams.get("username")
    if (initialUsername) setUsername(initialUsername)
  }, [searchParams])

  useEffect(() => {
    initGame()
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      handleMove(e.key)
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [grid, gameOver, score, username])

  // --- Save to Supabase with Update Logic ---
  const saveToSupabase = async (username: string, proofHash: string, topScore: number) => {
    try {
      // First, check if user already exists
      const { data: existingData, error: fetchError } = await supabase
        .from("succinct2048")
        .select("*")
        .eq("username", username)
        .single()

      if (fetchError && fetchError.code !== "PGRST116") {
        // PGRST116 is "not found" error, which is expected for new users
        console.error("Error checking existing data:", fetchError)
        return false
      }

      if (existingData) {
        // User exists, check if new score is higher
        if (topScore > existingData.top_score) {
          // Update existing record with higher score
          const { data, error } = await supabase
            .from("succinct2048")
            .update({
              proof_hash: proofHash,
              top_score: topScore,
              created_at: new Date().toISOString(), // Update timestamp to latest achievement
            })
            .eq("username", username)

          if (error) {
            console.error("Supabase update error:", error)
            return false
          }

          console.log("✅ Score updated in Supabase:", data)
          return true
        } else {
          // New score is not higher, don't save but return success
          console.log("🔄 Score not higher than existing, keeping previous record")
          return true
        }
      } else {
        // User doesn't exist, create new record
        const { data, error } = await supabase.from("succinct2048").insert([
          {
            username: username,
            proof_hash: proofHash,
            top_score: topScore,
            created_at: new Date().toISOString(),
          },
        ])

        if (error) {
          console.error("Supabase insert error:", error)
          return false
        }

        console.log("✅ New record created in Supabase:", data)
        return true
      }
    } catch (err) {
      console.error("❌ Failed to save to Supabase:", err)
      return false
    }
  }

  // --- Prove Final Point Handler ---
  const handleProveFinal = async () => {
    setFinalProofStatus("🔮 Proving your final score...")

    try {
      const res = await fetch("/api/prove-final", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, finalPoint: score }),
      })

      if (!res.ok) throw new Error("Final proof failed")

      const data = await res.json()
      const fullProofHash = data.proof_hash || "generated_hash"

      setProofHash(fullProofHash)
      setFinalProofStatus(`🎉 Final proved! Hash: ${fullProofHash.substring(0, 8)}...`)

      // Check existing score before saving
      setFinalProofStatus(`💾 Checking leaderboard...`)

      const { data: existingData } = await supabase
        .from("succinct2048")
        .select("top_score")
        .eq("username", username)
        .single()

      const isNewRecord = !existingData || score > existingData.top_score

      const saveSuccess = await saveToSupabase(username, fullProofHash, score)

      if (saveSuccess) {
        setSavedToDatabase(true)
        if (isNewRecord) {
          setFinalProofStatus(`🎉 New personal record! Hash: ${fullProofHash.substring(0, 8)}...`)
        } else {
          setFinalProofStatus(
            `✅ Score verified! Previous record maintained. Hash: ${fullProofHash.substring(0, 8)}...`,
          )
        }
      } else {
        setFinalProofStatus(`⚠️ Proof completed but save failed. Hash: ${fullProofHash.substring(0, 8)}...`)
      }
    } catch (err) {
      setFinalProofStatus("❌ Final proof failed")
      console.error("Final proof error:", err)
    }
  }

  // --- TOUCH/SWIPE HANDLERS ---
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null) // Reset touchEnd
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    })
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    })
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distanceX = touchStart.x - touchEnd.x
    const distanceY = touchStart.y - touchEnd.y
    const isLeftSwipe = distanceX > 50
    const isRightSwipe = distanceX < -50
    const isUpSwipe = distanceY > 50
    const isDownSwipe = distanceY < -50

    // Determine swipe direction (prioritize the larger distance)
    if (Math.abs(distanceX) > Math.abs(distanceY)) {
      // Horizontal swipe
      if (isLeftSwipe) {
        handleMove("ArrowLeft")
      } else if (isRightSwipe) {
        handleMove("ArrowRight")
      }
    } else {
      // Vertical swipe
      if (isUpSwipe) {
        handleMove("ArrowUp")
      } else if (isDownSwipe) {
        handleMove("ArrowDown")
      }
    }
  }

  const handleMove = (key: string) => {
    if (gameOver) return

    let direction = ""
    let newGrid = [...grid]
    let newScore = score

    switch (key) {
      case "ArrowUp":
        direction = "up"
        ;[newGrid, newScore] = moveUp(newGrid, newScore)
        break
      case "ArrowDown":
        direction = "down"
        ;[newGrid, newScore] = moveDown(newGrid, newScore)
        break
      case "ArrowLeft":
        direction = "left"
        ;[newGrid, newScore] = moveLeft(newGrid, newScore)
        break
      case "ArrowRight":
        direction = "right"
        ;[newGrid, newScore] = moveRight(newGrid, newScore)
        break
      default:
        return
    }

    // Notifikasi + fetch interaction
    if (username && direction) {
      setMoveStatus("🔮 Proving your move...")
      fetch("http://api/prove-interaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          direction,
          timestamp: new Date().toISOString(),
        }),
      })
        .then(async (res) => {
          if (!res.ok) throw new Error("Prove interaction failed")
          const data = await res.json()
          setMoveStatus(`✨ Move proved! Hash: ${data.proof_hash?.substring(0, 16) || "-"}...`)
        })
        .catch((err) => {
          setMoveStatus("❌ Move failed")
          console.error("Interaction error:", err)
        })
    }

    setGrid(newGrid)
    setScore(newScore)

    if (isGameOver(newGrid)) {
      setGameOver(true)
      setShowFinalProofModal(true)
    }
  }

  // --- GAME LOGIC ---
  function initGame() {
    const emptyGrid = Array(4)
      .fill(0)
      .map(() => Array(4).fill(0))
    addRandomTile(emptyGrid)
    addRandomTile(emptyGrid)
    setGrid(emptyGrid)
    setScore(0)
    setGameOver(false)
    setMoveStatus("")
    setShowFinalProofModal(false)
    setFinalProofStatus("")
    setProofHash("")
    setSavedToDatabase(false)
  }

  function addRandomTile(grid: number[][]) {
    const emptyCells = []
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (grid[row][col] === 0) emptyCells.push([row, col])
      }
    }
    if (emptyCells.length === 0) return
    const [r, c] = emptyCells[Math.floor(Math.random() * emptyCells.length)]
    grid[r][c] = Math.random() < 0.9 ? 2 : 4
  }

  function isGameOver(grid: number[][]): boolean {
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (grid[row][col] === 0) return false
        if (col < 3 && grid[row][col] === grid[row][col + 1]) return false
        if (row < 3 && grid[row][col] === grid[row + 1][col]) return false
      }
    }
    return true
  }

  function compress(row: number[]) {
    const newRow = row.filter((val) => val !== 0)
    while (newRow.length < 4) newRow.push(0)
    return newRow
  }

  function merge(row: number[], score: number): [number[], number] {
    for (let i = 0; i < 3; i++) {
      if (row[i] !== 0 && row[i] === row[i + 1]) {
        row[i] *= 2
        score += row[i]
        row[i + 1] = 0
      }
    }
    return [row, score]
  }

  function moveLeft(grid: number[][], score: number): [number[][], number] {
    const newGrid = grid.map((row) => [...row])
    for (let i = 0; i < 4; i++) {
      let row = compress(newGrid[i])
      ;[row, score] = merge(row, score)
      row = compress(row)
      newGrid[i] = row
    }
    addRandomTile(newGrid)
    return [newGrid, score]
  }

  function moveRight(grid: number[][], score: number): [number[][], number] {
    let newGrid = grid.map((row) => [...row].reverse())
    for (let i = 0; i < 4; i++) {
      let row = compress(newGrid[i])
      ;[row, score] = merge(row, score)
      row = compress(row)
      newGrid[i] = row
    }
    newGrid = newGrid.map((row) => row.reverse())
    addRandomTile(newGrid)
    return [newGrid, score]
  }

  function moveUp(grid: number[][], score: number): [number[][], number] {
    const newGrid = [...grid]
    for (let col = 0; col < 4; col++) {
      let colVals = newGrid.map((row) => row[col])
      colVals = compress(colVals)
      ;[colVals, score] = merge(colVals, score)
      colVals = compress(colVals)
      for (let row = 0; row < 4; row++) {
        newGrid[row][col] = colVals[row]
      }
    }
    addRandomTile(newGrid)
    return [newGrid, score]
  }

  function moveDown(grid: number[][], score: number): [number[][], number] {
    const newGrid = [...grid]
    for (let col = 0; col < 4; col++) {
      let colVals = newGrid.map((row) => row[col]).reverse()
      colVals = compress(colVals)
      ;[colVals, score] = merge(colVals, score)
      colVals = compress(colVals)
      colVals.reverse()
      for (let row = 0; row < 4; row++) {
        newGrid[row][col] = colVals[row]
      }
    }
    addRandomTile(newGrid)
    return [newGrid, score]
  }

  // Get tile styling based on value
  function getTileStyle(value: number) {
    const styles: Record<number, string> = {
      2: "bg-gradient-to-br from-pink-100 to-pink-200 text-pink-800 shadow-md",
      4: "bg-gradient-to-br from-pink-200 to-pink-300 text-pink-900 shadow-md",
      8: "bg-gradient-to-br from-[#FE11C5] to-pink-500 text-white shadow-lg",
      16: "bg-gradient-to-br from-purple-400 to-purple-600 text-white shadow-lg",
      32: "bg-gradient-to-br from-indigo-400 to-indigo-600 text-white shadow-lg",
      64: "bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-xl",
      128: "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-xl",
      256: "bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-xl",
      512: "bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-xl",
      1024: "bg-gradient-to-br from-red-400 to-red-600 text-white shadow-xl",
      2048: "bg-gradient-to-br from-gradient-to-br from-yellow-300 via-pink-300 to-purple-400 text-white shadow-2xl animate-pulse",
    }
    return styles[value] || "bg-gradient-to-br from-gray-600 to-gray-800 text-white shadow-2xl"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#FE11C5] to-purple-600 bg-clip-text text-transparent mb-2">
            2048 ZK Game ✨
          </h1>
          <p className="text-gray-600 text-sm">Zero-Knowledge Proof Gaming</p>

          {/* Navigation */}
          <div className="flex justify-center gap-2 mt-4">
            <Link
              href="/leaderboard"
              className="bg-gradient-to-r from-[#FE11C5] to-purple-600 text-white font-medium py-2 px-4 rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 text-sm flex items-center gap-2"
            >
              <span>🏆</span>
              Leaderboard
            </Link>
          </div>
        </div>

        {/* User Input */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🎮</span>
            <span className="font-medium text-gray-700">Player Info</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Username:</span>
              <span className="font-medium text-[#FE11C5]">{username || "Not set"}</span>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="🐦 Enter Twitter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border-2 border-pink-100 rounded-xl focus:border-[#FE11C5] focus:outline-none transition-colors bg-white/70 backdrop-blur-sm"
              />
            </div>
          </div>
        </div>

        {/* Score Display */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏆</span>
              <span className="font-medium text-gray-700">Score</span>
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-[#FE11C5] to-purple-600 bg-clip-text text-transparent">
              {score.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Move Status */}
        {moveStatus && (
          <div className="bg-gradient-to-r from-[#FE11C5]/10 to-purple-100 rounded-xl p-4 mb-6 border border-[#FE11C5]/20">
            <div className="text-center text-sm font-medium text-[#FE11C5]">{moveStatus}</div>
          </div>
        )}

        {/* Game Grid */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6">
          <div
            className="grid grid-cols-4 gap-3 p-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl select-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {grid.map((row, i) =>
              row.map((val, j) => (
                <div
                  key={`${i}-${j}`}
                  className={`aspect-square flex items-center justify-center text-lg font-bold rounded-xl transition-all duration-200 ${
                    val !== 0 ? `${getTileStyle(val)} hover:scale-105` : "bg-white/60 text-gray-300 shadow-inner"
                  }`}
                >
                  {val !== 0 ? val : ""}
                </div>
              )),
            )}
          </div>
        </div>

        {/* Game Over Status */}
        {gameOver && (
          <div className="bg-gradient-to-r from-red-100 to-pink-100 rounded-xl p-4 mb-6 border border-red-200">
            <div className="text-center">
              <span className="text-2xl mb-2 block">😅</span>
              <p className="text-red-700 font-bold">Game Over!</p>
              <p className="text-sm text-red-600">Final Score: {score.toLocaleString()}</p>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center">
          <div className="text-2xl mb-2">🎯</div>
          <p className="text-sm text-gray-600 mb-2">
            <span className="hidden sm:inline">Use arrow keys</span>
            <span className="sm:hidden">Swipe to move tiles</span>
            <span className="hidden sm:inline"> to play</span>
          </p>
          <p className="text-xs text-gray-500">Combine tiles to reach 2048! 🚀</p>
          <div className="mt-3 flex justify-center gap-4 text-xs text-gray-400">
            <span className="hidden sm:inline">⌨️ Keyboard</span>
            <span className="sm:hidden">👆 Swipe gestures</span>
          </div>
        </div>

        {/* Reset Button */}
        <button
          onClick={initGame}
          className="w-full mt-6 bg-gradient-to-r from-[#FE11C5] to-purple-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <span className="text-xl">🔄</span>
          New Game
        </button>
      </div>

      {/* Final Proof Modal */}
      {showFinalProofModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center transform scale-100 transition-transform">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Amazing Game!</h2>
            <p className="text-gray-600 mb-6">
              Let's prove your final score of <span className="font-bold text-[#FE11C5]">{score.toLocaleString()}</span>{" "}
              points!
            </p>

            <button
              onClick={handleProveFinal}
              disabled={finalProofStatus.includes("proved") || finalProofStatus.includes("completed")}
              className="w-full bg-gradient-to-r from-[#FE11C5] to-purple-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mb-4"
            >
              {finalProofStatus.includes("completed")
                ? "✅ Completed!"
                : finalProofStatus.includes("proved")
                  ? "✅ Proved!"
                  : "🔮 Prove Final Score"}
            </button>

            {savedToDatabase && (
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl p-3 mb-4 border border-green-200">
                <div className="text-sm font-medium text-green-700 flex items-center justify-center gap-2">
                  <span>💾</span>
                  Data saved to leaderboard!
                </div>
              </div>
            )}

            {(finalProofStatus.includes("proved") || finalProofStatus.includes("completed")) && (
              <>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    `🎮 Just crushed 2048 ZK Game! 🚀\n\n🏆 Final Score: ${score.toLocaleString()} points\n🔐 Cryptographically Verified with Zero-Knowledge Proof!\n\n✨ Proof Hash: ${proofHash.substring(0, 16)}...\n\n🎯 Think you can beat my score? Try the ZK-powered 2048!\n\n#ZKProof #Web3Gaming #2048Challenge #ZeroKnowledge`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 mb-4 flex items-center justify-center gap-2"
                >
                  <span className="text-xl">🐦</span>
                  Share Achievement on Twitter
                </a>

                <Link
                  href="/leaderboard"
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 mb-4 flex items-center justify-center gap-2"
                >
                  <span className="text-xl">🏆</span>
                  View Leaderboard
                </Link>
              </>
            )}

            {finalProofStatus && (
              <div className="bg-gradient-to-r from-[#FE11C5]/10 to-purple-100 rounded-xl p-4 mb-4 border border-[#FE11C5]/20">
                <div className="text-sm font-medium text-[#FE11C5]">{finalProofStatus}</div>
              </div>
            )}

            <button
              onClick={() => setShowFinalProofModal(false)}
              className="text-gray-500 hover:text-gray-700 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
