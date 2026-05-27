'use client';

import { PROGRESS_STEPS, PROGRESS_STATUS_LABELS, PROGRESS_STATUS_COLORS } from '@/lib/sample-data';
import type { ProgressStatus } from '@/lib/types';
import { Check } from 'lucide-react';

interface ProgressStepperProps {
  currentStatus: ProgressStatus;
  onAdvance?: (status: ProgressStatus) => void;
  onRollback?: (status: ProgressStatus) => void;
  readonly?: boolean;
}

export function ProgressStepper({ currentStatus, onAdvance, onRollback, readonly }: ProgressStepperProps) {
  const currentIndex = PROGRESS_STEPS.indexOf(currentStatus);

  return (
    <div className="flex items-center justify-center gap-0 py-4 px-6 bg-white rounded-xl border">
      {PROGRESS_STEPS.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isFuture = index > currentIndex;
        const label = PROGRESS_STATUS_LABELS[step];
        const colors = PROGRESS_STATUS_COLORS[step];

        const handleClick = () => {
          if (readonly) return;
          if (isFuture && onAdvance) {
            onAdvance(step as ProgressStatus);
          } else if (isCompleted && onRollback) {
            onRollback(step as ProgressStatus);
          }
        };

        return (
          <div key={step} className="flex items-center">
            {/* Node */}
            <button
              type="button"
              disabled={readonly || isCurrent}
              onClick={handleClick}
              className={`flex flex-col items-center gap-1.5 group ${(!readonly && (isFuture || isCompleted)) ? 'cursor-pointer' : ''}`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all
                  ${isCompleted ? `${colors.dot} text-white` : ''}
                  ${isCurrent ? `border-2 ${colors.dot.replace('bg-', 'border-')} text-${colors.dot.replace('bg-', '').replace('-500', '-700')} bg-white ring-2 ${colors.dot} ring-opacity-30` : ''}
                  ${isFuture ? 'border-2 border-gray-300 text-gray-400 bg-white' : ''}
                `}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span
                className={`text-xs whitespace-nowrap transition-colors
                  ${isCompleted ? 'text-gray-700' : ''}
                  ${isCurrent ? `${colors.text} font-semibold` : ''}
                  ${isFuture ? 'text-gray-400' : ''}
                  ${!readonly && (isFuture || isCompleted) ? 'group-hover:text-gray-900' : ''}
                `}
              >
                {label}
              </span>
            </button>

            {/* Connector */}
            {index < PROGRESS_STEPS.length - 1 && (
              <div className="flex items-center mx-1.5 mt-[-1.25rem]">
                <div className="w-8 h-0.5 flex items-center">
                  <div className={`flex-1 h-0.5 ${isCompleted ? colors.dot : 'bg-gray-200'}`} />
                  <svg className={`w-3 h-3 -ml-0.5 ${isCompleted ? colors.dot.replace('bg-', 'text-') : 'text-gray-300'}`} viewBox="0 0 12 12" fill="currentColor">
                    <path d="M4 2L9 6L4 10L4 2Z" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
