import React from 'react';

/**
 * ProgressStepper - Shows progress through the setup flow
 * @param {number} currentStep - Current step (1, 2, or 3)
 * @param {number} totalSteps - Total steps (default 3)
 */
const ProgressStepper = ({ currentStep = 1, totalSteps = 3 }) => {
  return (
    <div className="progress-stepper">
      {Array.from({ length: totalSteps }, (_, i) => {
        const stepNum = i + 1;
        const isCompleted = stepNum < currentStep;
        const isActive = stepNum === currentStep;

        return (
          <React.Fragment key={stepNum}>
            <div
              className={`progress-stepper__step ${
                isCompleted ? 'progress-stepper__step--completed' :
                isActive ? 'progress-stepper__step--active' :
                'progress-stepper__step--upcoming'
              }`}
            >
              {isCompleted ? '✓' : stepNum}
            </div>
            {stepNum < totalSteps && (
              <div
                className={`progress-stepper__line ${
                  isCompleted ? 'progress-stepper__line--completed' : ''
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default ProgressStepper;
