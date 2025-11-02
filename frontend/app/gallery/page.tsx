"use client";
import { useEffect, useState } from "react";

interface Character {
  _id: string;
  name: string;
  description?: string;
  avatar?: string;
}

export default function Gallery() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

  useEffect(() => {
    fetch(`${apiUrl}/characters`)
      .then((res) => res.json())
      .then((data) => {
        setCharacters(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-8">
      <h2 className="text-3xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">Character Gallery</h2>
      {loading ? (
        <div className="text-center text-lg text-gray-500">Loading characters...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {characters.map((char) => (
            <div key={char._id} className="rounded-xl shadow-lg bg-white/80 dark:bg-gray-800/80 p-6 flex flex-col items-center border border-gray-200 dark:border-gray-700">
              {char.avatar ? (
                <img src={char.avatar} alt={char.name} className="w-20 h-20 rounded-full object-cover mb-4" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 flex items-center justify-center text-3xl mb-4">
                  {char.name[0]}
                </div>
              )}
              <div className="font-semibold text-lg mb-1">{char.name}</div>
              <div className="text-gray-500 text-sm text-center">{char.description || "No description"}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 