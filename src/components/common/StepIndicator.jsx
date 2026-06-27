// StepIndicator Component
import React from 'react';
import { Check } from 'lucide-react';

export const StepIndicator = ({ steps = [], currentStep = 1, className = '' }) => {
  return (
    <div className={`w-full py-4 ${className}`}>
      <div className="flex items-center justify-between w-full">
        {steps.map((step, idx) => {
          const stepNum = idx + 1;
          const isCompleted = stepNum < currentStep;
          const isActive = stepNum === currentStep;

          return (
            <React.Fragment key={idx}>
              {/* Step circle */}
              <div className="flex flex-col items-center relative z-10">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 border-2 ${
                    isCompleted
                      ? 'bg-primary border-primary text-white'
                      : isActive
                        ? 'border-primary bg-white text-primary ring-4 ring-primary-light/50'
                        : 'border-neutral-200 bg-white text-neutral-400'
                  }`}
                >
                  {isCompleted ? <Check size={14} strokeWidth={3} /> : stepNum}
                </div>
                <span
                  className={`mt-2 text-xs font-medium text-center absolute top-8 whitespace-nowrap -translate-x-0 hidden sm:block ${
                    isActive ? 'text-primary font-semibold' : 'text-neutral-500'
                  }`}
                >
                  {step}
                </span>
              </div>

              {/* Connector Line */}
              {idx < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 bg-neutral-200 relative overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-primary transition-all duration-300"
                    style={{ width: isCompleted ? '100%' : '0%' }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
      {/* Mobile label display */}
      <div className="text-center mt-3 text-xs font-bold text-primary sm:hidden uppercase tracking-wider">
        Step {currentStep}: {steps[currentStep - 1]}
      </div>
    </div>
  );
};

export default StepIndicator;
