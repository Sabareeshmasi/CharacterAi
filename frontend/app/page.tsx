import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col items-center justify-center p-8">
      <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mb-4 drop-shadow-lg">CharacterAI</h1>
      <p className="text-lg text-gray-700 dark:text-gray-300 mb-10 text-center max-w-xl">Create, chat, and explore with custom AI characters. Your imagination is the only limit!</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-4xl">
        <Link href="/gallery" className="rounded-xl shadow-lg bg-white/80 dark:bg-gray-800/80 p-8 flex flex-col items-center hover:scale-105 transition-transform border border-gray-200 dark:border-gray-700">
          <span className="text-3xl mb-2">🖼️</span>
          <span className="font-semibold text-lg mb-1">Character Gallery</span>
          <span className="text-gray-500 text-sm">Browse and discover AI characters</span>
        </Link>
        <Link href="/create" className="rounded-xl shadow-lg bg-white/80 dark:bg-gray-800/80 p-8 flex flex-col items-center hover:scale-105 transition-transform border border-gray-200 dark:border-gray-700">
          <span className="text-3xl mb-2">✨</span>
          <span className="font-semibold text-lg mb-1">Create Character</span>
          <span className="text-gray-500 text-sm">Design your own AI persona</span>
        </Link>
        <Link href="/chat" className="rounded-xl shadow-lg bg-white/80 dark:bg-gray-800/80 p-8 flex flex-col items-center hover:scale-105 transition-transform border border-gray-200 dark:border-gray-700">
          <span className="text-3xl mb-2">💬</span>
          <span className="font-semibold text-lg mb-1">Chat</span>
          <span className="text-gray-500 text-sm">Talk to your favorite characters</span>
        </Link>
      </div>
    </div>
  );
}
