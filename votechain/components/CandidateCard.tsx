import { CandidateUI } from "@/types";

interface CandidateCardProps {
  candidate: CandidateUI;
  isSelected: boolean;
  onSelect: (candidateId: string) => void;
}

export default function CandidateCard({ candidate, isSelected, onSelect }: CandidateCardProps) {
  return (
    <button
      onClick={() => onSelect(candidate.id)}
      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 focus:outline-none ${
        isSelected
          ? "border-au-gold bg-au-blue text-white shadow-lg scale-[1.02]"
          : "border-gray-200 bg-white hover:border-au-blue hover:shadow-md text-gray-800"
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Avatar placeholder */}
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
            isSelected ? "bg-au-gold text-au-blue-dark" : "bg-au-blue text-white"
          }`}
        >
          {candidate.name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase()}
        </div>
        {/* Name */}
        <span className={`font-semibold text-sm ${isSelected ? "text-white" : "text-gray-800"}`}>
          {candidate.name}
        </span>
        {/* Selected indicator */}
        {isSelected && (
          <div className="ml-auto">
            <div className="w-5 h-5 rounded-full bg-au-gold flex items-center justify-center">
              <svg className="w-3 h-3 text-au-blue-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </button>
  );
}
