"use client";
import { useEffect, useState, useRef } from "react";

interface Character {
  _id: string;
  name: string;
  avatar?: string;
  personality?: string;
  description?: string;
}
interface Message {
  sender: string;
  text: string;
}

function getGender(personality?: string, description?: string): "male" | "female" | undefined {
  const text = (personality || "") + " " + (description || "");
  const lower = text.toLowerCase();
  if (/(female|woman|girl|she|her)/.test(lower)) return "female";
  if (/(male|man|boy|he|him)/.test(lower)) return "male";
  return undefined;
}

export default function Chat() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [listening, setListening] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [charVoices, setCharVoices] = useState<{ [id: string]: SpeechSynthesisVoice | undefined }>({});
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

  // Fetch available voices and assign to characters by gender
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      setVoices(v);
      // Assign a gender-matching voice to each character
      setCharVoices((prev) => {
        const mapping: { [id: string]: SpeechSynthesisVoice | undefined } = {};
        characters.forEach((char, i) => {
          const gender = getGender(char.personality, char.description);
          let match: SpeechSynthesisVoice | undefined;
          if (gender) {
            match = v.find((voice) =>
              gender === "female"
                ? voice.name.toLowerCase().includes("female") || voice.name.match(/(fem|woman|girl)/i)
                : voice.name.toLowerCase().includes("male") || voice.name.match(/(male|man|boy)/i)
            );
          }
          mapping[char._id] = match || v[i % v.length];
        });
        return mapping;
      });
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, [characters]);

  useEffect(() => {
    fetch(`${apiUrl}/characters`)
      .then((res) => res.json())
      .then((data) => setCharacters(data));
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Text-to-Speech for AI messages, using unique voice per character
  const speak = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utter = new window.SpeechSynthesisUtterance(text);
      utter.lang = "en-US";
      if (selected && charVoices[selected]) {
        utter.voice = charVoices[selected];
      }
      utter.onstart = () => { setSpeaking(true); setPaused(false); };
      utter.onend = () => { setSpeaking(false); setPaused(false); };
      utter.onpause = () => setPaused(true);
      utter.onresume = () => setPaused(false);
      window.speechSynthesis.speak(utter);
    }
  };
  const pauseSpeech = () => {
    if (typeof window !== "undefined" && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setPaused(true);
    }
  };
  const resumeSpeech = () => {
    if (typeof window !== "undefined" && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setPaused(false);
    }
  };
  const stopSpeech = () => {
    if (typeof window !== "undefined") {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      setPaused(false);
    }
  };

  // Speech-to-Text for user input
  const startListening = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Speech recognition not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => prev + (prev ? " " : "") + transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  };
  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selected) return;
    setMessages((msgs) => [...msgs, { sender: "User", text: input }]);
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterId: selected,
          messages: [...messages, { sender: "User", text: input }],
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages((msgs) => [...msgs, { sender: "AI", text: data.aiResponse }]);
      } else {
        setError(data.error || "Failed to get AI response.");
      }
    } catch {
      setError("Network error.");
    }
    setInput("");
    setLoading(false);
  };

  const selectedChar = characters.find((c) => c._id === selected);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col items-center justify-center p-8">
      <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-lg p-6 w-full max-w-xl flex flex-col border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-center">Chat with your AI Character</h2>
        <div className="mb-4">
          <select
            className="w-full p-2 rounded border border-gray-300 dark:bg-gray-900 dark:border-gray-700 mb-2"
            value={selected}
            onChange={e => {
              setSelected(e.target.value);
              setMessages([]);
            }}
          >
            <option value="">Select a character...</option>
            {characters.map((char) => (
              <option key={char._id} value={char._id}>{char.name}</option>
            ))}
          </select>
          {selectedChar && (
            <div className="flex items-center gap-3 mb-2">
              {selectedChar.avatar ? (
                <img src={selectedChar.avatar} alt={selectedChar.name} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 flex items-center justify-center text-xl">
                  {selectedChar.name[0]}
                </div>
              )}
              <div>
                <div className="font-semibold">{selectedChar.name}</div>
                <div className="text-xs text-gray-500">{selectedChar.personality}</div>
                {charVoices[selectedChar._id] && (
                  <div className="text-xs text-gray-400">Voice: {charVoices[selectedChar._id]?.name}</div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto mb-4 max-h-80 border rounded bg-white/60 dark:bg-gray-900/60 p-2">
          {messages.length === 0 && <div className="text-gray-400 text-center">Start the conversation!</div>}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.sender === "User" ? "justify-end" : "justify-start"} mb-2`}>
              <div className={`px-4 py-2 rounded-2xl max-w-[70%] ${msg.sender === "User" ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"}`}>
                <span className="block text-xs font-semibold mb-1">{msg.sender === "User" ? "You" : selectedChar?.name || "AI"}</span>
                {msg.text}
                {msg.sender === "AI" && (
                  <button
                    type="button"
                    className="ml-2 text-lg align-middle hover:scale-125 transition-transform"
                    title="Speak"
                    onClick={() => speak(msg.text)}
                  >🔊</button>
                )}
              </div>
            </div>
          ))}
          {loading && <div className="text-center text-gray-400">AI is typing...</div>}
          <div ref={chatEndRef} />
        </div>
        <div className="flex gap-2 mb-2">
          {speaking && (
            <>
              <button
                type="button"
                className="bg-yellow-400 text-black font-semibold px-3 py-1 rounded shadow hover:scale-105 transition-transform"
                onClick={paused ? resumeSpeech : pauseSpeech}
              >{paused ? "Resume" : "Pause"} Voice</button>
              <button
                type="button"
                className="bg-red-500 text-white font-semibold px-3 py-1 rounded shadow hover:scale-105 transition-transform"
                onClick={stopSpeech}
              >Stop Voice</button>
            </>
          )}
        </div>
        <form onSubmit={handleSend} className="flex gap-2 mt-2">
          <input
            className="flex-1 rounded p-2 border border-gray-300 dark:bg-gray-900 dark:border-gray-700"
            placeholder="Type your message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={!selected || loading}
            required
          />
          <button
            type="button"
            className={`text-2xl px-2 ${listening ? "animate-pulse text-red-500" : "hover:scale-125 transition-transform"}`}
            title={listening ? "Stop Recording" : "Speak"}
            onClick={listening ? stopListening : startListening}
            disabled={!selected || loading}
          >🎤</button>
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold px-4 py-2 rounded shadow hover:scale-105 transition-transform disabled:opacity-50"
            disabled={!selected || loading || !input.trim()}
          >Send</button>
        </form>
        {error && <div className="text-center text-sm mt-2 text-red-600 dark:text-red-400">{error}</div>}
      </div>
    </div>
  );
} 