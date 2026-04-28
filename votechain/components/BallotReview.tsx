import { useEffect, useRef } from "react";
import { PositionUI, CandidateUI, BallotSelections } from "@/types";

interface BallotReviewProps {
  positions: PositionUI[];
  candidates: CandidateUI[];
  selections: BallotSelections;
  onConfirm: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

export default function BallotReview({
  positions,
  candidates,
  selections,
  onConfirm,
  onBack,
  isSubmitting,
}: BallotReviewProps) {
  const skipped = positions.filter((p) => !selections[p.id]);
  const dialogRef = useRef<HTMLDivElement>(null);
  const backButtonRef = useRef<HTMLButtonElement>(null);

  const getCandidateName = (positionId: string): string => {
    const candidateId = selections[positionId];
    if (!candidateId) return "— Not selected —";
    const candidate = candidates.find((c) => c.id === candidateId);
    return candidate?.name ?? "Unknown";
  };

  useEffect(() => {
    const previousActiveElement = document.activeElement as HTMLElement | null;
    backButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) {
        onBack();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (!firstElement || !lastElement) return;

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      previousActiveElement?.focus();
    };
  }, [isSubmitting, onBack]);

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) onBack();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ballot-review-title"
        aria-describedby="ballot-review-description"
        className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="bg-au-blue border-b-4 border-au-gold px-6 py-4 rounded-t-lg">
          <h2 id="ballot-review-title" className="font-heading text-2xl text-white font-bold">Review Your Ballot</h2>
          <p id="ballot-review-description" className="text-blue-200 text-sm mt-1">
            Please confirm your selections before submitting to the blockchain.
          </p>
        </div>

        <div className="px-6 py-5 space-y-3">
          {/* Skipped warning */}
          {skipped.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3">
              <p className="text-yellow-800 text-sm font-semibold">
                Partial ballot: you skipped {skipped.length} position{skipped.length > 1 ? "s" : ""}:
              </p>
              <ul className="mt-1 text-yellow-700 text-sm list-disc list-inside">
                {skipped.map((p) => (
                  <li key={p.id}>{p.name}</li>
                ))}
              </ul>
              <p className="text-yellow-600 text-xs mt-1">
                Skipped positions will not be counted. You can go back to fill them in.
              </p>
            </div>
          )}

          {/* Selections list */}
          <div className="space-y-2">
            {positions.map((position) => {
              const selected = !!selections[position.id];
              return (
                <div
                  key={position.id}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg border ${
                    selected ? "border-gray-200 bg-gray-50" : "border-yellow-200 bg-yellow-50"
                  }`}
                >
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide w-36 flex-shrink-0">
                    {position.name}
                  </span>
                  <span
                    className={`text-sm font-semibold text-right ${
                      selected ? "text-au-blue" : "text-yellow-600 italic"
                    }`}
                  >
                    {getCandidateName(position.id)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-blue-700 text-xs">
            Your vote will be permanently recorded on the blockchain. This action cannot be undone.
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            ref={backButtonRef}
            onClick={onBack}
            disabled={isSubmitting}
            className="flex-1 btn-outline text-sm py-2.5"
          >
            Go Back
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-1 btn-gold text-sm py-2.5 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Submitting...
              </>
            ) : (
              skipped.length > 0 ? "Submit Partial Ballot" : "Submit Vote"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
