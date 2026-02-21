export default function Loading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-700 border-t-white mb-4"></div>
        <p className="text-gray-400">로딩 중...</p>
      </div>
    </div>
  )
}
