import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import aptitudeService from "@/api/services/aptitude.service";
import { Button } from "@/shadcn/ui/button";
import { Input } from "@/shadcn/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shadcn/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shadcn/ui/dialog";
import { Question } from "@/types/Question";
import { Aptitude } from "@/types/Aptitude";
import { TRADES } from "@/constants";
import { ApiResponse } from "@/types/Api";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import CameraCapture  from '../../helpers/CameraCapture';

const AppearAptitude = () => {
  const [regNo, setRegNo] = useState("");
  const [trade, setTrade] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [aptitude, setAptitude] = useState<Aptitude | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const [cheatingAttempts, setCheatingAttempts] = useState<number>(0);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [warnings, setWarnings] = useState(0);
  const [isFullscreenExited, setIsFullscreenExited] = useState(false);
  const [isCameraOn,setIsCameraOn] = useState(false);
  const [isProcessingViolation, setIsProcessingViolation] = useState(false);
  

  interface Answer {
    question_id: number;
    selected_option: number;
  }

  const [answers, setAnswers] = useState<Answer[]>([]);

  const questionsPerPage = 1;
  const params = useParams();
  const aptiId = params.id;

  
  const navigate = useNavigate();

  const handleGetQuiz = async (savedRegNo?: string, savedTrade?: string) => {
    const regNoToUse = savedRegNo || regNo;
    const tradeToUse = savedTrade || trade;

    if (localStorage.getItem(`aptitude-${aptiId}-submitted`)) {
      toast({
        title: "Error",
        description: "You have already submitted your quiz",
        variant: "destructive",
      });
      return;
    }

    if (!isCameraOn) {
      toast({
        title: "Camera Required",
        description: "Please allow camera access before starting the test.",
        variant: "destructive",
      });
      return;
    }

    if (!regNoToUse || !tradeToUse) {
      toast({
        title: "Error",
        description: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const response: ApiResponse = await aptitudeService.getAptitudeForUser(
        { trade: tradeToUse, regno: regNoToUse },
        aptiId
      );

      // Save to sessionStorage
      sessionStorage.setItem(`aptitude-regno-${aptiId}`, regNoToUse);
      sessionStorage.setItem(`aptitude-trade-${aptiId}`, tradeToUse);

      if (typeof response.data === "string") {
        response.data = JSON.parse(response.data);
      }

      const sortedQuestions = [
        ...response.data.questions.filter((q: Question) => q.question_type === "GENERAL"),
        ...response.data.questions.filter((q: Question) => q.question_type !== "GENERAL"),
      ];

      setQuestions(sortedQuestions);
      setAptitude(response.data.aptitude);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch quiz",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load saved registration and trade data on mount
  useEffect(() => {
    const savedRegNo = sessionStorage.getItem(`aptitude-regno-${aptiId}`);
    const savedTrade = sessionStorage.getItem(`aptitude-trade-${aptiId}`);
    const savedWarnings = sessionStorage.getItem(`aptitude-warnings-${aptiId}`);
    
    if (savedRegNo && savedTrade) {
      setRegNo(savedRegNo);
      setTrade(savedTrade);
      // Automatically fetch quiz if we have saved credentials
      handleGetQuiz(savedRegNo, savedTrade);
    }

    // Restore warning count if exists
    if (savedWarnings) {
      try {
        const parsedWarnings = JSON.parse(savedWarnings);
        const warningCount = parsedWarnings.count || 0;
        console.log("Restoring warnings from session storage:", warningCount);
        setWarnings(warningCount);
      } catch (error) {
        console.error("Error parsing saved warnings:", error);
        setWarnings(0);
      }
    } else {
      console.log("No saved warnings found, starting with 0");
      setWarnings(0);
    }
  }, [aptiId]);

  useEffect(() => {
    if (!aptitude?.id || initialized) return;

    const savedAnswers = sessionStorage.getItem(`aptitude-answers-${aptitude.id}`);
    if (savedAnswers) {
      const parsedAnswers = JSON.parse(savedAnswers);
      if (Array.isArray(parsedAnswers) && parsedAnswers.length > 0) {
        setAnswers(parsedAnswers);
      }
    }
    setInitialized(true);
  }, [aptitude?.id, initialized]);

  useEffect(() => {
    document.addEventListener("copy", (e: Event) => {
      e.preventDefault();
      navigator.clipboard.writeText(
        "Cheating is not a good idea. Your quiz might get cancelled..."
      );
    });
  }, []);

  useEffect(()=>{
    console.log(regNo ,"abcd");
    console.log(trade,"abcd");
  },[regNo,trade]);

  // Debug useEffect to track registration number availability
  useEffect(() => {
    console.log("Debug - Current state:", {
      regNo,
      aptiId,
      savedRegNo: sessionStorage.getItem(`aptitude-regno-${aptiId}`),
      warnings
    });
  }, [regNo, aptiId, warnings]);

  // Ensure warnings are properly initialized
  useEffect(() => {
    if (aptiId) {
      const savedWarnings = sessionStorage.getItem(`aptitude-warnings-${aptiId}`);
      if (savedWarnings) {
        try {
          const parsedWarnings = JSON.parse(savedWarnings);
          const warningCount = parsedWarnings.count || 0;
          if (warningCount !== warnings) {
            console.log("Updating warnings from session storage:", warningCount);
            setWarnings(warningCount);
          }
        } catch (error) {
          console.error("Error parsing saved warnings:", error);
        }
      }
    }
  }, [aptiId, warnings]);

const handleViolation = async (type: string,regNo:string) => {
  // Prevent multiple rapid violations
  if (isProcessingViolation) {
    console.log("Violation already being processed, skipping:", type);
    return;
  }

  setIsProcessingViolation(true);

  // Get registration number from session storage using aptiId
  const savedRegNo = sessionStorage.getItem(`aptitude-regno-${aptiId}`);

  console.log("Violation detected:", { type, regNo, savedRegNo, aptiId, currentWarnings: warnings });

  setWarnings(prev => {
    const newCount = prev + 1;
    console.log("Warning count updated:", { prev, newCount, type });

    // Save warnings to session storage
    if (aptiId) {
      sessionStorage.setItem(`aptitude-warnings-${aptiId}`, JSON.stringify({
        count: newCount,
      }));
      console.log("Warnings saved to session storage:", { aptiId, newCount });
    }

    toast({
      title: "Warning",
      description: `Warning ${newCount}: ${type} is not allowed!`,
      variant: "destructive",
    });

    // Update warnings on server
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      fetch("/user/update-warnings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          regno: regNo,
          aptitude_test_id: aptiId,
          warnings: newCount,
        }),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log("Warning updated successfully:", data);
      })
      .catch(err => {
        console.error("Warning update failed:", err);
        // Don't show error to user as this is not critical
        // The warning is still tracked locally
      });
    } else {
      console.log("No access token available, skipping server warning update");
    }

    // Submit test after 5 warnings
    if (newCount >= 5) {
      console.log("Auto-submit triggered at warning count:", newCount);
      toast({
        title: "Test Terminated",
        description: "You violated the rules 5 times. Submitting your test.",
        variant: "destructive",
      });

      // Ensure we have the necessary data before auto-submitting
      const finalRegNo = savedRegNo || regNo;
      if (!finalRegNo) {
        console.error("No registration number available for auto-submit");
        console.log("Debug info:", { savedRegNo, regNo, aptiId });
        toast({
          title: "Error",
          description: "Unable to auto-submit: Registration number not found",
          variant: "destructive",
        });
        navigate("/");
        return newCount; // Return the new count even if auto-submit fails
      }

      // Call submit handler with auto flag
      handleSubmitQuestions(true, finalRegNo); // true = auto submission
      navigate("/"); 
    }

    return newCount; // Always return the new count
  });

  // Reset processing flag after a delay
  setTimeout(() => {
    setIsProcessingViolation(false);
  }, 1000);
};



  const requestFullscreen = async () => {
    try {
      const docElm = document.documentElement;
      if (docElm.requestFullscreen) {
        await docElm.requestFullscreen();
      }
    } catch (error) {
      console.log("Fullscreen request failed:", error);
      // Don't show error to user as this is not critical
    }
  };

  const detectFullScreenExit = () => {
    const isFullscreen = !!(
      document.fullscreenElement
    );

    console.log("Fullscreen state changed:", isFullscreen);

    if (!isFullscreen) {
      // Only trigger violation if we're actually in a test (questions are loaded)
      if (questions.length > 0) {
        const currentRegNo = sessionStorage.getItem(`aptitude-regno-${aptiId}`) || regNo;
        console.log("Fullscreen exit detected, triggering violation");
        handleViolation("Exiting fullscreen", currentRegNo);
        
        // Immediately try to re-enter fullscreen
        setTimeout(() => {
          requestFullscreen();
        }, 500);
      }
      setIsFullscreenExited(true);
    } else {
      setIsFullscreenExited(false); // Hide blur overlay when back in fullscreen
    }
  };

  const handleReturnToFullscreen = async () => {
    try {
      await requestFullscreen();
      setIsFullscreenExited(false);
      toast({
        title: "Success",
        description: "Returned to fullscreen mode",
      });
    } catch (error) {
      console.error("Failed to return to fullscreen:", error);
      toast({
        title: "Error",
        description: "Failed to return to fullscreen. Please press F11 or use browser controls.",
        variant: "destructive",
      });
    }
  };

  

  useEffect(() => {
    // Auto fullscreen on load (only if user has interacted with the page)
    const handleUserInteraction = () => {
      requestFullscreen();
      // Remove the event listener after first interaction
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };

    // Add event listeners for user interaction
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);

    // Fullscreen exit detection - add all browser prefixes
    document.addEventListener("fullscreenchange", detectFullScreenExit);
    document.addEventListener("webkitfullscreenchange", detectFullScreenExit);
    document.addEventListener("mozfullscreenchange", detectFullScreenExit);
    document.addEventListener("MSFullscreenChange", detectFullScreenExit);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener("fullscreenchange", detectFullScreenExit);
      document.removeEventListener("webkitfullscreenchange", detectFullScreenExit);
      document.removeEventListener("mozfullscreenchange", detectFullScreenExit);
      document.removeEventListener("MSFullscreenChange", detectFullScreenExit);
    };
  }, []);

  // Continuous fullscreen enforcement during test
  useEffect(() => {
    if (questions.length === 0) return; // Only enforce during active test

    const enforceFullscreen = () => {
      const isFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );

      if (!isFullscreen) {
        console.log("Fullscreen enforcement: re-entering fullscreen");
        requestFullscreen();
      }
    };

    // Check every 2 seconds during the test
    const interval = setInterval(enforceFullscreen, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [questions.length]);

  useEffect(() => {
    // Only set up event listeners when questions are loaded (test is active)
    if (questions.length === 0) {
      return;
    }

    const blockActions = (e:any) => {
      e.preventDefault();
      // Get current regNo from session storage to avoid closure issues
      const currentRegNo = sessionStorage.getItem(`aptitude-regno-${aptiId}`) || regNo;
      handleViolation("Copy/Paste/Cut/Right-click", currentRegNo);
      return false;
    };

    const blockKeys = (e:any) => {
      if (
        (e.ctrlKey && ["c", "v", "x", "u", "s", "i", "j"].includes(e.key.toLowerCase())) ||
        e.key === "F12"
      ) {
        e.preventDefault();
        // Get current regNo from session storage to avoid closure issues
        const currentRegNo = sessionStorage.getItem(`aptitude-regno-${aptiId}`) || regNo;
        handleViolation(`Key "${e.key}"`, currentRegNo);
        return false;
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState !== "visible") {
        // Get current regNo from session storage to avoid closure issues
        const currentRegNo = sessionStorage.getItem(`aptitude-regno-${aptiId}`) || regNo;
        handleViolation("Tab switching", currentRegNo);
      }
    };

    // Event listeners
    document.addEventListener("copy", blockActions);
    document.addEventListener("paste", blockActions);
    document.addEventListener("cut", blockActions);
    document.addEventListener("contextmenu", blockActions);
    document.addEventListener("keydown", blockKeys);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      document.removeEventListener("copy", blockActions);
      document.removeEventListener("paste", blockActions);
      document.removeEventListener("cut", blockActions);
      document.removeEventListener("contextmenu", blockActions);
      document.removeEventListener("keydown", blockKeys);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [questions.length, aptiId, regNo]); // Add proper dependencies

  useEffect(() => {
    if (aptitude?.duration) {
      const durationMs = aptitude.duration * 60 * 1000;
      const startTime = +aptitude.test_timestamp * 1000;
      const elapsedTime = Date.now() - startTime;
      const timeLeft = durationMs - elapsedTime;
      setTimeLeft(timeLeft);

      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = Math.max(0, prev - 1000);
          if (newTime <= 30000) {
            toast({
              title: "Warning",
              description: "Submit quiz now it might take some time to process",
              variant: "destructive",
            });
          }
          return newTime;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [aptitude?.duration, aptitude?.test_timestamp]);

  useEffect(() => {
    if (questions.length > 0) {
      // Initialize answers when questions are loaded
      const savedAnswers = sessionStorage.getItem(`aptitude-answers-${aptitude?.id}`);
      let initialAnswers: Answer[];

      if (savedAnswers) {
        try {
          initialAnswers = JSON.parse(savedAnswers);
          // Validate that all questions have corresponding answers
          const allQuestionsHaveAnswers = questions.every(question =>
            initialAnswers.some(answer => answer.question_id === Number(question.id))
          );
          
          if (!allQuestionsHaveAnswers) {
            // If some questions don't have answers, create complete initial state
            initialAnswers = questions.map(question => ({
              question_id: Number(question.id),
              selected_option: 0,
            }));
          }
        } catch (e) {
          // If parsing fails, create new initial answers
          initialAnswers = questions.map(question => ({
            question_id: Number(question.id),
            selected_option: 0,
          }));
        }
      } else {
        // If no saved answers, create new initial answers
        initialAnswers = questions.map(question => ({
          question_id: Number(question.id),
          selected_option: 0,
        }));
      }

      setAnswers(initialAnswers);
      if (aptitude?.id) {
        sessionStorage.setItem(
          `aptitude-answers-${aptitude.id}`,
          JSON.stringify(initialAnswers)
        );
      }
      setInitialized(true);
    }
  }, [questions, aptitude?.id]);

  useEffect(() => {
    if (questions.length <= 0) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        setCheatingAttempts((prev) => prev + 1);
      } else {
        if (cheatingAttempts > 5) {
          toast({
            title: "Cheating Warning",
            description:
              "You have been caught cheating. Your quiz has been cancelled.",
            variant: "destructive",
          });
          setTimeout(() => {
            handleSubmitQuestions(false,regNo);
          }, 3000);
        } else {
          toast({
            title: "Cheating Warning",
            description:
              "You have been caught cheating. Further attempts will result in quiz cancellation.",
            variant: "destructive",
          });
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [questions, cheatingAttempts]);

  const handleAnswerChange = (questionId: number, selectedOption: number) => {
    setAnswers(prevAnswers => {
      const newAnswers = prevAnswers.map(answer =>
        answer.question_id === questionId
          ? { ...answer, selected_option: selectedOption + 1 }
          : answer
      );

      // Save to session storage immediately after update
      if (aptitude?.id) {
        sessionStorage.setItem(
          `aptitude-answers-${aptitude.id}`,
          JSON.stringify(newAnswers)
        );
      }

      return newAnswers;
    });
  };

  const getCurrentQuestions = () => {
    const start = currentPage * questionsPerPage;
    return questions.slice(start, start + questionsPerPage);
  };

  const isLastPage =
    currentPage === Math.ceil(questions.length / questionsPerPage) - 1;

const handleSubmitQuestions = async (autoSubmit = false, regNo: string) => {
    console.log("handleSubmitQuestions called with autoSubmit:", autoSubmit);
    console.log("Current answers:", answers);
    console.log("Registration number:", regNo);

    if (!autoSubmit && (!answers || answers.length === 0)) {
      toast({
        title: "Error",
        description: "No answers to submit",
        variant: "destructive",
      });
      return;
    }

    if (!autoSubmit) {
      const hasAnswers = answers.some((answer) => answer.selected_option !== 0);
      if (!hasAnswers) {
        toast({
          title: "Error",
          description: "Please answer at least one question before submitting",
          variant: "destructive",
        });
        return;
      }
    }

    // Validate registration number
    if (!regNo) {
      toast({
        title: "Error",
        description: "Registration number is required for submission",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      console.log("Starting submission process...");
      
      // Use aptiId from URL params as fallback for auto-submit scenarios
      const aptitudeId = aptitude?.id || aptiId;
      if (!aptitudeId) {
        throw new Error("Aptitude test ID not found");
      }

      const submissionAnswers = answers && answers.length > 0 ? answers : [];

      console.log("Submitting with data:", {
        regno: regNo,
        trade,
        aptitudeId: aptitudeId,
        answers: submissionAnswers,
        autoSubmit,
      });

      await aptitudeService.submitAptitude(
        { regno: regNo, trade },
        Number(aptitudeId),
        submissionAnswers
      );

      if (!autoSubmit) {
        toast({
          title: "Success",
          description: "Questions submitted successfully",
        });
      } else {
        console.log("Auto-submit completed successfully");
      }

      // Use aptitudeId for cleanup operations
      if (aptitudeId) {
        localStorage.setItem(`aptitude-${aptitudeId}-submitted`, "true");
        localStorage.removeItem(`aptitude-${Number(aptitudeId) - 1}-submitted`);
        sessionStorage.removeItem(`aptitude-answers-${aptitudeId}`);
        sessionStorage.removeItem(`aptitude-start-${aptitudeId}`);
        sessionStorage.removeItem(`aptitude-regno-${aptitudeId}`);
        sessionStorage.removeItem(`aptitude-trade-${aptitudeId}`);
        sessionStorage.removeItem(`aptitude-warnings-${aptitudeId}`);
      }

      navigate("/");
    } catch (error: any) {
      console.error("Submit error:", error);

      if (autoSubmit) {
        toast({
          title: "Test Terminated",
          description: "Test ended due to violations. Some data may not have been saved.",
          variant: "destructive",
        });

        setTimeout(() => navigate("/"), 2000);
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to submit questions",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
      setShowSubmitDialog(false);
    }
  };


  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / (60 * 1000));
    const seconds = Math.floor((ms % (60 * 1000)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };


  if (questions.length > 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CameraCapture contestId={String(aptiId)} userId={regNo} />
        
        {/* Header with timer and warnings */}
        <div className="fixed top-0 left-0 right-0 bg-white shadow-md z-40 p-3">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
            <div className="flex items-center gap-4">
              <h1 className="text-lg sm:text-xl font-bold text-gray-800">{aptitude?.name}</h1>
              <span className="text-sm text-gray-600">
                Question {currentPage + 1} of {questions.length}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Warning Display */}
              <div className="bg-yellow-500 text-white text-xs sm:text-sm px-2 py-1 rounded-md shadow">
                Warnings: {warnings}/5
              </div>
              
              {/* Fullscreen Indicator */}
              <div className="bg-blue-500 text-white text-xs sm:text-sm px-2 py-1 rounded-md shadow">
                Fullscreen Required
              </div>
              
              {/* Temporary Test Button */}
              <button
                onClick={() => {
                  const currentRegNo = sessionStorage.getItem(`aptitude-regno-${aptiId}`) || regNo;
                  console.log("Manual test violation triggered");
                  handleViolation("Manual Test", currentRegNo);
                }}
                className="bg-blue-500 text-white text-xs px-2 py-1 rounded-md shadow hover:bg-blue-600"
                title="Test warning system"
              >
                Test Warning
              </button>
              
              {/* Timer */}
              <div className="bg-red-500 text-white text-xs sm:text-sm px-2 py-1 rounded-md shadow">
                Time: {formatTime(timeLeft)}
              </div>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="pt-20 pb-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {getCurrentQuestions().map((question, idx) => (
              <div key={question.id} className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
                {/* Question Header */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-500">Question {currentPage + 1}</span>
                    <span className="text-sm text-gray-500">{formatTime(timeLeft)} remaining</span>
                  </div>
                  
                  {/* Question Text */}
                  <div className="mb-6">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
                      {question.description}
                    </h2>
                    
                    {/* Question Image if present */}
                    {question.format === "img" && (
                      <div className="mb-6">
                        <img
                          src={question.description}
                          alt="Question"
                          className="max-w-full h-auto rounded-lg shadow-md mx-auto"
                          style={{ maxHeight: '400px' }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-700 mb-4">Select your answer:</h3>
                  {question.options.map((option, optIdx) => {
                    const savedAnswer = answers.find(
                      (a) => a.question_id === question.id
                    );
                    return (
                      <label
                        key={optIdx}
                        className={`flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all hover:bg-gray-50 ${
                          savedAnswer?.selected_option === optIdx + 1
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q${question.id}`}
                          className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          checked={savedAnswer?.selected_option === optIdx + 1}
                          onChange={() =>
                            handleAnswerChange(Number(question.id), optIdx)
                          }
                        />
                        <span className="text-sm sm:text-base text-gray-800 leading-relaxed">
                          {option}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t z-40">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <Button
                onClick={() => setCurrentPage((prev) => prev - 1)}
                disabled={currentPage === 0}
                variant="outline"
                className="px-6 py-2"
              >
                ← Previous
              </Button>
              
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 hidden sm:block">
                  {currentPage + 1} of {questions.length}
                </span>
                
                {isLastPage ? (
                  <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
                    <DialogTrigger asChild>
                      <Button disabled={loading} className="px-6 py-2 bg-green-600 hover:bg-green-700">
                        Submit Test
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirm Submission</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to submit your answers? This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex justify-end gap-4">
                        <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
                          Cancel
                        </Button>
                        <Button disabled={loading} onClick={() => handleSubmitQuestions(false, regNo)}>
                          {loading ? "Submitting..." : "Confirm Submit"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <Button
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    disabled={currentPage >= questions.length - 1}
                    className="px-6 py-2"
                  >
                    Next →
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Fullscreen Exit Overlay */}
        {isFullscreenExited && questions.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl text-center max-w-md mx-4">
              <h2 className="text-xl sm:text-2xl font-bold text-red-600 mb-4">
                ⚠️ Fullscreen Required
              </h2>
              <p className="text-gray-700 mb-6 text-sm sm:text-base">
                Fullscreen mode is mandatory during the test. The test will automatically return to fullscreen mode.
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleReturnToFullscreen}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors text-sm sm:text-base w-full"
                >
                  Return to Fullscreen Now
                </button>
                <p className="text-xs text-gray-500">
                  Fullscreen will be enforced automatically. Press F11 if needed.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {isFullscreenExited && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl text-center max-w-md mx-4">
            <h2 className="text-xl sm:text-2xl font-bold text-red-600 mb-4">
              ⚠️ Fullscreen Required
            </h2>
            <p className="text-gray-700 mb-6 text-sm sm:text-base">
              You have exited fullscreen mode. Please return to fullscreen to continue the test.
            </p>
            <div className="space-y-3">
              <button
                onClick={handleReturnToFullscreen}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors text-sm sm:text-base w-full"
              >
                Return to Fullscreen
              </button>
              <p className="text-xs text-gray-500">
                Or press F11 to toggle fullscreen manually
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Aptitude Test</h1>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Registration Number
              </label>
              <Input
                type="text"
                value={regNo}
                onChange={(e) => setRegNo(e.target.value)}
                placeholder="Enter your registration number"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Select Trade</label>
              <Select onValueChange={setTrade}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select your trade" />
                </SelectTrigger>
                <SelectContent>
                  {TRADES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              disabled={loading}
              onClick={() => handleGetQuiz()}
              className="w-full py-3"
            >
              {loading ? "Getting Quiz..." : "Get Quiz"}
            </Button>

            <p className="text-sm text-gray-500 text-center">
              Note: If we caught you cheating 5 times, the test will be automatically submitted!
            </p>
            
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  navigator.mediaDevices.getUserMedia({ video: true })
                    .then((stream) => {
                      // Stop stream after permission is granted (no need to show video here)
                      setIsCameraOn(true);
                      stream.getTracks().forEach(track => track.stop());
                      toast({
                        title: "Camera Access Granted",
                        description: "You can now proceed with your test.",
                      });
                    })
                    .catch((err) => {
                      setIsCameraOn(false);
                      toast({
                        title: "Camera Access Denied",
                        description: "Please allow camera access to continue.",
                        variant: "destructive",
                      });
                    });
                    setIsCameraOn(true);
                }}
                className="w-full"
              >
                Allow Camera Access
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppearAptitude;

