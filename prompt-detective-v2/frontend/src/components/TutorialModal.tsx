import React, { useState, useEffect } from 'react';
import { X, ArrowLeft, ArrowRight, Upload, Eye, History, Settings, CheckCircle } from 'lucide-react';

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  target?: string;
  content: string;
}

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);

  const tutorialSteps: TutorialStep[] = [
    {
      id: 1,
      title: "Welcome to Prompt Detective!",
      description: "AI-powered reverse engineering for prompts",
      icon: <CheckCircle className="w-8 h-8 text-green-500" />,
      content: "Prompt Detective uses advanced AI analysis to reverse engineer the prompts used to create videos and images. Let's take a quick tour to get you started!"
    },
    {
      id: 2,
      title: "Upload Your Media",
      description: "Start by uploading a video or image",
      icon: <Upload className="w-8 h-8 text-blue-500" />,
      target: "upload-area",
      content: "Click the upload area to select videos (MP4, AVI, MOV) or images (JPG, PNG, GIF). Our AI will analyze the content and reverse engineer the likely prompts used to create it."
    },
    {
      id: 3,
      title: "Real-Time Progress",
      description: "Watch the analysis happen live",
      icon: <Eye className="w-8 h-8 text-purple-500" />,
      content: "During analysis, you'll see real-time progress with detailed processing stages. Our sophisticated AI examines visual elements, composition, style, and technical aspects."
    },
    {
      id: 4,
      title: "View Results",
      description: "Get detailed prompts and insights",
      icon: <Settings className="w-8 h-8 text-orange-500" />,
      content: "Results include the main reverse-engineered prompt, technical details, enhancement features, and analysis quality metrics. You can copy prompts or view full details."
    },
    {
      id: 5,
      title: "Usage History",
      description: "Track all your analyses",
      icon: <History className="w-8 h-8 text-teal-500" />,
      content: "Access your complete analysis history with thumbnails, search and filter capabilities, and detailed job information. Perfect for managing your reverse engineering projects."
    },
    {
      id: 6,
      title: "You're All Set!",
      description: "Ready to start reverse engineering",
      icon: <CheckCircle className="w-8 h-8 text-green-500" />,
      content: "You're now ready to use Prompt Detective! Upload your first file to begin exploring the AI-generated prompts behind visual content. Happy analyzing!"
    }
  ];

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    
    // Mark tutorial as completed in localStorage
    localStorage.setItem('tutorial_completed', 'true');
    
    // Wait a moment for the completion animation
    setTimeout(() => {
      onComplete();
      onClose();
      setIsCompleting(false);
      setCurrentStep(0);
    }, 1500);
  };

  const handleSkip = () => {
    localStorage.setItem('tutorial_completed', 'true');
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const step = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full mx-4 shadow-2xl transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
              {step.icon}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
              <p className="text-sm text-gray-600">{step.description}</p>
            </div>
          </div>
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isCompleting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="px-6 py-3 bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
            <span>Step {currentStep + 1} of {tutorialSteps.length}</span>
            <span>{Math.round(((currentStep + 1) / tutorialSteps.length) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isCompleting ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Welcome aboard!</h4>
              <p className="text-gray-600">Setting up your experience...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-gray-700 leading-relaxed">
                {step.content}
              </div>
              
              {currentStep === 1 && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h5 className="font-medium text-blue-900 mb-2">Supported Formats:</h5>
                  <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
                    <div>
                      <strong>Videos:</strong> MP4, AVI, MOV
                    </div>
                    <div>
                      <strong>Images:</strong> JPG, PNG, GIF
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <h5 className="font-medium text-purple-900 mb-2">Analysis Features:</h5>
                  <ul className="text-sm text-purple-800 space-y-1">
                    <li>• Frame-by-frame video analysis</li>
                    <li>• Advanced AI visual understanding</li>
                    <li>• Style and composition detection</li>
                    <li>• Technical parameter identification</li>
                  </ul>
                </div>
              )}

              {currentStep === 3 && (
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <h5 className="font-medium text-orange-900 mb-2">What You'll Get:</h5>
                  <ul className="text-sm text-orange-800 space-y-1">
                    <li>• Main reverse-engineered prompt</li>
                    <li>• Technical analysis summary</li>
                    <li>• Enhancement features used</li>
                    <li>• Processing quality metrics</li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!isCompleting && (
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            <button
              onClick={handlePrevious}
              disabled={isFirstStep}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                isFirstStep 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex space-x-2">
              {tutorialSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentStep
                      ? 'bg-blue-500 w-6'
                      : index < currentStep
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105"
            >
              <span>{isLastStep ? 'Get Started' : 'Next'}</span>
              {!isLastStep && <ArrowRight className="w-4 h-4" />}
              {isLastStep && <CheckCircle className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorialModal;