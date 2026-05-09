import { FaSearch, FaMicrophone } from "react-icons/fa";
import { StoreType } from "@/data/mockData";
import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";

interface SearchBarProps {
  store: StoreType;
  onSearch?: (query: string) => void;
  fullPage?: boolean;
  floating?: boolean;
}

const placeholders: Record<StoreType, string> = {
  food: 'Search for "Biryani"',
  bazaar: 'Search in Bazaar...',
  electronic: 'Search Electronics...',
};

const SearchBar = ({ store, onSearch, fullPage, floating }: SearchBarProps) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef("");

  const handleVoiceSearch = () => {
    if (isListening) return;
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Voice search is not supported in this browser.");
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognitionRef.current = recognition;
    finalTranscriptRef.current = "";
    setIsListening(true);
    setLiveTranscript("");
    recognition.onresult = (event: any) => {
      let interim = "";
      let finalChunk = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const text = event.results[i][0]?.transcript ?? "";
        if (event.results[i].isFinal) {
          finalChunk += text;
        } else {
          interim += text;
        }
      }

      if (finalChunk.trim()) {
        finalTranscriptRef.current = `${finalTranscriptRef.current} ${finalChunk}`.trim();
      }

      const composed = `${finalTranscriptRef.current} ${interim}`.trim();
      setLiveTranscript(composed);
      setQuery(composed);

      if (finalChunk.trim()) {
        const committed = `${finalTranscriptRef.current}`.trim();
        if (!committed) return;
        setQuery(committed);
        if (onSearch) {
          onSearch(committed);
          setIsListening(false);
        } else {
          navigate(`/search/${store}?q=${encodeURIComponent(committed)}`);
        }
      }
    };
    recognition.onerror = () => {
      setIsListening(false);
      setLiveTranscript("");
    };
    recognition.onend = () => {
      setIsListening(false);
    };
    recognition.start();
  };

  const handleStopListening = () => {
    try {
      recognitionRef.current?.stop?.();
    } catch {
      // no-op
    }
    setIsListening(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      if (onSearch) {
        onSearch(query);
      } else {
        navigate(`/search/${store}?q=${encodeURIComponent(query)}`);
      }
    }
  };

  return (
    <div
      className={
        fullPage
          ? ""
          : `px-4 pt-2 pb-3 lg:px-10 lg:max-w-2xl lg:mx-auto lg:w-full ${floating ? "lg:sticky lg:top-[104px] z-40 bg-[#F7F3FF]" : ""}`
      }
    >
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-3 bg-white rounded-2xl h-11 px-4 border-2 border-primary/25 transition-colors focus-within:border-primary/55 focus-within:ring-2 focus-within:ring-primary/20"
      >
        <FaSearch className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onSearch?.(e.target.value);
          }}
          placeholder={placeholders[store]}
          className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground outline-none"
        />
        <button
          type="button"
          onClick={handleVoiceSearch}
          className={`flex-shrink-0 p-1.5 rounded-full transition-colors ${
            isListening
              ? "bg-gradient-to-r from-[#4B0082] to-[#A855F7] text-white"
              : "text-muted-foreground hover:text-primary"
          }`}
          aria-label="Start voice search"
        >
          <FaMicrophone className="w-4 h-4 cursor-pointer" />
        </button>
      </form>
      {isListening && <p className="text-[11px] text-primary mt-1.5 px-1">Listening... speak now</p>}

      {isListening && (
        <div className="fixed inset-0 z-[90] bg-black/30 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="w-full max-w-xs rounded-2xl bg-white p-4 border border-primary/20 shadow-[0_12px_34px_rgba(0,0,0,0.2)]">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3 animate-pulse">
                <FaMicrophone className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm font-bold text-foreground">Listening...</p>
              <p className="text-xs text-muted-foreground mt-1">Bolte rahiye, text box me auto-fill hoga</p>
              <div className="mt-3 min-h-9 w-full rounded-lg bg-muted/60 border border-border px-3 py-2 text-xs text-foreground">
                {liveTranscript || "Say something..."}
              </div>
              <button
                type="button"
                onClick={handleStopListening}
                className="mt-3 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-semibold"
              >
                Stop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
