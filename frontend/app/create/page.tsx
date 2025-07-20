"use client";
import { useState } from "react";

export default function CreateCharacter() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [personality, setPersonality] = useState("");
  const [avatar, setAvatar] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";
      const res = await fetch(`${apiUrl}/characters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, personality, avatar }),
      });
      if (res.ok) {
        setMessage("Character created successfully!");
        setName("");
        setDescription("");
        setPersonality("");
        setAvatar("");
      } else {
        const data = await res.json();
        setMessage(data.error || "Failed to create character.");
      }
    } catch (err) {
      setMessage("Error connecting to backend.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col items-center justify-center p-8">
      <h2 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">Create Character</h2>
      <form onSubmit={handleSubmit} className="bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-lg p-8 w-full max-w-md flex flex-col gap-4 border border-gray-200 dark:border-gray-700">
        <input className="rounded p-2 border border-gray-300 dark:bg-gray-900 dark:border-gray-700" placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
        <textarea className="rounded p-2 border border-gray-300 dark:bg-gray-900 dark:border-gray-700" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
        <input className="rounded p-2 border border-gray-300 dark:bg-gray-900 dark:border-gray-700" placeholder="Personality" value={personality} onChange={e => setPersonality(e.target.value)} />
        <input className="rounded p-2 border border-gray-300 dark:bg-gray-900 dark:border-gray-700" placeholder="Avatar URL (optional)" value={avatar} onChange={e => setAvatar(e.target.value)} />
        <button type="submit" className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold py-2 rounded shadow hover:scale-105 transition-transform disabled:opacity-50" disabled={loading}>{loading ? "Creating..." : "Create Character"}</button>
        {message && <div className="text-center text-sm mt-2 text-blue-600 dark:text-blue-300">{message}</div>}
      </form>
    </div>
  );
} 