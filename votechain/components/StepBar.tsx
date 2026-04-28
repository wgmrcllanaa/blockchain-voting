interface Step {
  label: string;
  description: string;
}

interface StepBarProps {
  steps: Step[];
  currentStep: number; // 0-indexed
}

export default function StepBar({ steps, currentStep }: StepBarProps) {
  return (
    <div className="w-full py-4">
      <div className="flex items-start justify-between relative">
        {/* Connector line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0" />
        <div
          className="absolute top-4 left-0 h-0.5 bg-au-gold z-0 transition-all duration-500"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;

          return (
            <div key={index} className="flex flex-col items-center z-10 flex-1">
              {/* Circle */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
                  isCompleted
                    ? "bg-au-gold border-au-gold text-au-blue-dark"
                    : isActive
                    ? "bg-au-blue border-au-gold text-au-gold"
                    : "bg-white border-gray-300 text-gray-400"
                }`}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              {/* Label */}
              <span
                className={`mt-2 text-xs font-medium text-center hidden sm:block ${
                  isActive ? "text-au-blue font-semibold" : isCompleted ? "text-au-gold" : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
