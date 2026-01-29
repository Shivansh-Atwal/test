import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import aptitudeService from "@/api/services/aptitude.service";
import { Button } from "@/shadcn/ui/button";
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
  const [isProcessingViolation, setIsProcessingViolation] = useState(false);

  // New state for section switching
  const [activeSection, setActiveSection] = useState<"general" | "technical">("general");

  interface Answer {
    question_id: number;
    selected_options: number[];
  }

  const [answers, setAnswers] = useState<Answer[]>([]);

  const questionsPerPage = 1;
  const params = useParams();
  const aptiId = params.id;
  const navigate = useNavigate();

  // Filter questions by section - General section only has "GENERAL" type (case-insensitive)
  // Technical section has questions matching the user's selected trade
  const generalQuestions = questions.filter((q) => 
    q.question_type && q.question_type.toLowerCase() === "general"
  );
  const technicalQuestions = questions.filter((q) => 
    q.question_type && q.question_type.toLowerCase() === trade.toLowerCase()
  );
  const currentSectionQuestions = activeSection === "general" ? generalQuestions : technicalQuestions;

  // Initialize registration number from login data
  useEffect(() => {
    const savedRegNo = sessionStorage.getItem(`aptitude-regno-${aptiId}`);
    
    if (savedRegNo) {
      setRegNo(savedRegNo);
    } else {
      // Try to get from localStorage (where login data is usually stored)
      const userRegNo = localStorage.getItem("userRegNo") || 
                        localStorage.getItem("regno") || 
                        localStorage.getItem("registrationNumber");
      
      if (userRegNo) {
        setRegNo(userRegNo);
      }
    }
  }, [aptiId]);

  const handleGetQuiz = async (savedRegNo?: string, savedTrade?: string) => {
    const regNoToUse = savedRegNo || regNo;
    const tradeToUse = savedTrade || trade;

    // Prevent already submitted re-entry
    if (localStorage.getItem(`aptitude-${aptiId}-submitted`)) {
      toast({
        title: "Error",
        description: "You have already submitted your quiz",
        variant: "destructive",
      });
      return;
    }

    if (!regNoToUse) {
      toast({
        title: "Error",
        description: "Registration number not found. Please login again.",
        variant: "destructive",
      });
      return;
    }

    if (!tradeToUse) {
      toast({
        title: "Error",
        description: "Please select a trade",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const res: ApiResponse = await aptitudeService.getAptitudeForUser(
        { regno: regNoToUse, trade: tradeToUse },
        aptiId
      );

      let response = res;

      // Safely parse string responses
      if (typeof response.data === "string") {
        try {
          response.data = JSON.parse(response.data);
        } catch (err) {
          console.error("Error parsing response data:", err);
          toast({
            title: "Error",
            description: "Invalid quiz data received",
            variant: "destructive",
          });
          return;
        }
      }

      // Validate question data
      if (response.data.questions && Array.isArray(response.data.questions)) {
        response.data.questions.forEach((question: any, index: number) => {
          if (!question.correct_option) {
            question.correct_option = [];
          }
          if (!Array.isArray(question.correct_option)) {
            question.correct_option = [question.correct_option].filter(Boolean);
          }

          if (!Array.isArray(question.options)) {
            question.options = ["Option 1", "Option 2", "Option 3", "Option 4"];
          }

          console.log(`Question ${index + 1} type:`, question.question_type);
        });
      }

      setQuestions(response.data.questions || []);
      setAptitude(response.data.aptitude);

      // Save user data to session storage
      sessionStorage.setItem(`aptitude-regno-${aptiId}`, regNoToUse);
      sessionStorage.setItem(`aptitude-trade-${aptiId}`, tradeToUse);
      sessionStorage.setItem(`aptitude-start-${aptiId}`, Date.now().toString());

      toast({
        title: "Success",
        description: "Quiz loaded successfully",
      });
    } catch (error: any) {
      console.error("Error loading quiz:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load quiz",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // -------- USE EFFECTS --------

  useEffect(() => {
    const savedRegNo = sessionStorage.getItem(`aptitude-regno-${aptiId}`);
    const savedTrade = sessionStorage.getItem(`aptitude-trade-${aptiId}`);
    const savedWarnings = sessionStorage.getItem(`aptitude-warnings-${aptiId}`);

    if (savedRegNo && savedTrade) {
      setRegNo(savedRegNo);
      setTrade(savedTrade);
      handleGetQuiz(savedRegNo, savedTrade);
    }

    if (savedWarnings) {
      try {
        const parsedWarnings = JSON.parse(savedWarnings);
        setWarnings(parsedWarnings.count || 0);
      } catch (error) {
        console.error("Error parsing saved warnings:", error);
        setWarnings(0);
      }
    } else {
      setWarnings(0);
    }
  }, [aptiId]);

  useEffect(() => {
    if (!aptitude?.id || initialized) return;

    const savedAnswers = sessionStorage.getItem(`aptitude-answers-${aptitude.id}`);
    if (savedAnswers) {
      try {
        const parsedAnswers = JSON.parse(savedAnswers);
        if (Array.isArray(parsedAnswers) && parsedAnswers.length > 0) {
          setAnswers(parsedAnswers);
        }
      } catch (err) {
        console.error("Error parsing saved answers:", err);
      }
    }
    setInitialized(true);
  }, [aptitude?.id, initialized]);

  useEffect(() => {
    if (aptiId) {
      const savedWarnings = sessionStorage.getItem(`aptitude-warnings-${aptiId}`);
      if (savedWarnings) {
        try {
          const parsedWarnings = JSON.parse(savedWarnings);
          const warningCount = parsedWarnings.count || 0;
          if (warningCount !== warnings) {
            setWarnings(warningCount);
          }
        } catch (error) {
          console.error("Error parsing saved warnings:", error);
        }
      }
    }
  }, [aptiId, warnings]);

  const handleViolation = async (type: string, regNo: string) => {
    if (isProcessingViolation) {
      console.log("Violation already being processed, skipping:", type);
      return;
    }

    setIsProcessingViolation(true);

    const savedRegNo = sessionStorage.getItem(`aptitude-regno-${aptiId}`);

    console.log("Violation detected:", { type, regNo, savedRegNo, aptiId, currentWarnings: warnings });

    setWarnings(prev => {
      const newCount = prev + 1;
      console.log("Warning count updated:", { prev, newCount, type });

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
          });
      } else {
        console.log("No access token available, skipping server warning update");
      }

      if (newCount >= 5) {
        console.log("Auto-submit triggered at warning count:", newCount);
        toast({
          title: "Test Terminated",
          description: "You violated the rules 5 times. Submitting your test.",
          variant: "destructive",
        });

        const finalRegNo = savedRegNo || regNo;
        if (!finalRegNo) {
          console.error("No registration number available for auto-submit");
          toast({
            title: "Error",
            description: "Unable to auto-submit: Registration number not found",
            variant: "destructive",
          });
          navigate("/");
          return newCount;
        }

        handleSubmitQuestions(true, finalRegNo);
      }

      return newCount;
    });

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
    }
  };

  const detectFullScreenExit = () => {
    const isFullscreen = !!(document.fullscreenElement);

    console.log("Fullscreen state changed:", isFullscreen);

    if (!isFullscreen) {
      if (questions && Array.isArray(questions) && questions.length > 0) {
        const currentRegNo = sessionStorage.getItem(`aptitude-regno-${aptiId}`) || regNo;
        console.log("Fullscreen exit detected, triggering violation");
        handleViolation("Exiting fullscreen", currentRegNo);

        setTimeout(() => {
          requestFullscreen();
        }, 500);
      }
      setIsFullscreenExited(true);
    } else {
      setIsFullscreenExited(false);
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
    const handleUserInteraction = () => {
      requestFullscreen();
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);

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
    if (!questions || !Array.isArray(questions) || questions.length === 0) return;

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

    const interval = setInterval(enforceFullscreen, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [questions.length]);

  useEffect(() => {
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return;
    }

    const blockActions = (e: any) => {
      e.preventDefault();
      const currentRegNo = sessionStorage.getItem(`aptitude-regno-${aptiId}`) || regNo;
      handleViolation("Copy/Paste/Cut/Right-click", currentRegNo);
      return false;
    };

    const blockKeys = (e: any) => {
      if (
        (e.ctrlKey && ["c", "v", "x", "u", "s", "i", "j"].includes(e.key.toLowerCase())) ||
        e.key === "F12"
      ) {
        e.preventDefault();
        const currentRegNo = sessionStorage.getItem(`aptitude-regno-${aptiId}`) || regNo;
        handleViolation(`Key "${e.key}"`, currentRegNo);
        return false;
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState !== "visible") {
        const currentRegNo = sessionStorage.getItem(`aptitude-regno-${aptiId}`) || regNo;
        handleViolation("Tab switching", currentRegNo);
      }
    };

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
  }, [questions.length, aptiId, regNo]);

  useEffect(() => {
    if (aptitude?.duration) {
      const durationMs = (aptitude.duration * 60 * 1000) - (2 * 60 * 1000);
      const startTime = +aptitude.test_timestamp * 1000;
      const elapsedTime = Date.now() - startTime;
      const timeLeft = durationMs - elapsedTime;
      setTimeLeft(timeLeft);

      let warningShown = false;
      let autoSubmitTriggered = false;

      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = Math.max(0, prev - 1000);

          if (newTime <= 30000 && !warningShown) {
            warningShown = true;
            toast({
              title: "Warning",
              description: "30 seconds remaining, Auto-submit will be activated in 30 seconds.",
              variant: "destructive",
              duration: 10000,
            });
          }

          if (newTime <= 10000 && newTime > 0 && !autoSubmitTriggered) {
            autoSubmitTriggered = true;
            toast({
              title: "Final Warning!",
              description: "Auto-submitting your answers...",
              variant: "destructive",
              duration: 5000,
            });

            const savedRegNo = sessionStorage.getItem(`aptitude-regno-${aptiId}`) || regNo;
            if (!savedRegNo) {
              console.error("No registration number available for auto-submit");
              toast({
                title: "Error",
                description: "Unable to auto-submit: Registration number not found",
                variant: "destructive",
              });
              navigate("/");
              return newTime;
            }

            handleSubmitQuestions(true, savedRegNo);
          }

          if (newTime <= 0 && !autoSubmitTriggered) {
            autoSubmitTriggered = true;
            toast({
              title: "Time's Up!",
              description: "Test time has expired. Auto-submitting your answers...",
              variant: "destructive",
              duration: 5000,
            });

            const savedRegNo = sessionStorage.getItem(`aptitude-regno-${aptiId}`) || regNo;
            if (!savedRegNo) {
              console.error("No registration number available for auto-submit");
              toast({
                title: "Error",
                description: "Unable to auto-submit: Registration number not found",
                variant: "destructive",
              });
              navigate("/");
              return newTime;
            }

            handleSubmitQuestions(true, savedRegNo);
          }

          return newTime;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [aptitude?.duration, aptitude?.test_timestamp, aptiId, regNo]);

  useEffect(() => {
    if (questions && Array.isArray(questions) && questions.length > 0) {
      const savedAnswers = sessionStorage.getItem(`aptitude-answers-${aptitude?.id}`);
      let initialAnswers: Answer[];

      if (savedAnswers) {
        try {
          initialAnswers = JSON.parse(savedAnswers);

          const allQuestionsHaveAnswers = questions.every(question =>
            initialAnswers.some(answer => answer.question_id === Number(question.id))
          );

          if (!allQuestionsHaveAnswers) {
            initialAnswers = questions.map(question => ({
              question_id: Number(question.id),
              selected_options: [],
            }));
          }
        } catch (e) {
          initialAnswers = questions.map(question => ({
            question_id: Number(question.id),
            selected_options: [],
          }));
        }
      } else {
        initialAnswers = questions.map(question => ({
          question_id: Number(question.id),
          selected_options: [],
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
    if (!questions || !Array.isArray(questions) || questions.length <= 0 || !aptitude?.id) return;

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
            handleSubmitQuestions(false, regNo);
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
  }, [questions, cheatingAttempts, aptitude?.id]);

  const handleAnswerChange = (questionId: number, selectedOption: number) => {
    const backendOptionIndex = selectedOption + 1;

    const currentQuestion = questions.find(q => q.id === questionId);

    if (!currentQuestion) {
      console.error('Question not found:', questionId);
      return;
    }

    const isSingleAnswer = currentQuestion?.correct_option &&
      Array.isArray(currentQuestion.correct_option) &&
      currentQuestion.correct_option.length === 1;

    setAnswers(prevAnswers => {
      const newAnswers = prevAnswers.map(answer => {
        if (answer.question_id === questionId) {
          const currentOptions = answer.selected_options || [];
          const optionIndex = currentOptions.indexOf(backendOptionIndex);

          if (optionIndex > -1) {
            const updatedOptions = currentOptions.filter((_, index) => index !== optionIndex);
            return {
              ...answer,
              selected_options: updatedOptions
            };
          } else {
            let updatedOptions;
            if (isSingleAnswer) {
              updatedOptions = [backendOptionIndex];
            } else {
              updatedOptions = [...currentOptions, backendOptionIndex];
            }
            return {
              ...answer,
              selected_options: updatedOptions
            };
          }
        }
        return answer;
      });

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
    if (!currentSectionQuestions || !Array.isArray(currentSectionQuestions)) {
      return [];
    }
    const start = currentPage * questionsPerPage;
    return currentSectionQuestions.slice(start, start + questionsPerPage);
  };

  const isLastPage =
    currentSectionQuestions && Array.isArray(currentSectionQuestions) ?
      currentPage === Math.ceil(currentSectionQuestions.length / questionsPerPage) - 1 :
      true;

  // Check if a question is attempted
  const isQuestionAttempted = (questionId: number) => {
    const answer = answers.find((a) => a.question_id === questionId);
    return answer && answer.selected_options.length > 0;
  };

  const handleSubmitQuestions = async (autoSubmit = false, regNo: string) => {
    console.log("handleSubmitQuestions called with autoSubmit:", autoSubmit);
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
      const hasAnswers = answers.some((answer) => answer.selected_options.length > 0);
      if (!hasAnswers) {
        toast({
          title: "Error",
          description: "Please answer at least one question before submitting",
          variant: "destructive",
        });
        return;
      }
    }

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

      const aptitudeId = aptitude?.id || aptiId;
      if (!aptitudeId) {
        throw new Error("Aptitude test ID not found");
      }

      let submissionAnswers = answers && answers.length > 0 ? answers : [];

      if (submissionAnswers.length === 0 && aptitudeId) {
        const savedAnswers = sessionStorage.getItem(`aptitude-answers-${aptitudeId}`);
        if (savedAnswers) {
          try {
            const parsedAnswers = JSON.parse(savedAnswers);
            if (Array.isArray(parsedAnswers) && parsedAnswers.length > 0) {
              submissionAnswers = parsedAnswers;
              console.log("Retrieved answers from session storage:", submissionAnswers);
            }
          } catch (error) {
            console.error("Error parsing saved answers:", error);
          }
        }
      }

      if (submissionAnswers.length === 0) {
        console.warn("No answers available for submission");
        if (autoSubmit) {
          console.log("Auto-submit with no answers - proceeding anyway");
        } else {
          toast({
            title: "Error",
            description: "No answers to submit",
            variant: "destructive",
          });
          return;
        }
      }

      console.log("Submitting with data:", {
        regno: regNo,
        trade,
        aptitudeId: aptitudeId,
        answers: submissionAnswers,
        autoSubmit,
        answersCount: submissionAnswers.length,
        hasAnswers: submissionAnswers.some(a => a.selected_options.length > 0),
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

      if (aptitudeId) {
        localStorage.setItem(`aptitude-${aptitudeId}-submitted`, "true");
        localStorage.removeItem(`aptitude-${Number(aptitudeId) - 1}-submitted`);

        setTimeout(() => {
          sessionStorage.removeItem(`aptitude-answers-${aptitudeId}`);
          sessionStorage.removeItem(`aptitude-start-${aptitudeId}`);
          sessionStorage.removeItem(`aptitude-regno-${aptitudeId}`);
          sessionStorage.removeItem(`aptitude-trade-${aptitudeId}`);
          sessionStorage.removeItem(`aptitude-warnings-${aptitudeId}`);
        }, 300000);
      }

      navigate("/");
    } catch (error: any) {
      console.error("Submit error:", error);

      if (autoSubmit) {
        toast({
          title: "Test Terminated",
          description: "Test ended. Some data may not have been saved.",
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

  if (questions && Array.isArray(questions) && questions.length > 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Compact Header */}
        <div className="fixed top-0 left-0 right-0 bg-white shadow-md z-40 p-2 sm:p-3">
          <div className="max-w-7xl mx-auto flex flex-col gap-2">
            {/* Top Row - Timer and Warnings */}
            <div className="flex items-center gap-2 justify-between w-full">
              <div className={`text-white text-xs px-2 py-1 rounded-md shadow font-semibold whitespace-nowrap ${
                timeLeft <= 5000 ? 'bg-black animate-pulse' : timeLeft <= 30000 ? 'bg-red-600 animate-pulse' : 'bg-red-500'
              }`}>
                ⏱ {formatTime(timeLeft)}
              </div>

              <div className="flex justify-end">
              <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
                <DialogTrigger asChild>
                  <Button 
                    disabled={loading} 
                    className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 whitespace-nowrap"
                  >
                  Submit
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[90vw] sm:w-full">
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
                      {loading ? "Submitting..." : "Confirm"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
              {/* <div className="bg-black text-white text-xs px-2 py-1 rounded-md shadow font-semibold whitespace-nowrap">
                ⚠ {warnings}/5
              </div> */}
              {/* <span className="text-xs text-gray-700 font-medium">
                Q: {currentPage + 1}/{currentSectionQuestions?.length || 0}
              </span> */}
            </div>

            {/* Bottom Row - Submit Button */}
            
          </div>
        </div>

        {/* Section Tabs - Fully Responsive */}
        <div className="fixed top-16 left-0 right-0 z-40 bg-white border-b">
  <div className="mx-auto max-w-5xl px-2 sm:px-4">
    <div className="flex w-full">
      
      {/* Aptitude Tab */}
      <button
        onClick={() => {
          setActiveSection("general");
          setCurrentPage(0);
        }}
        className={`w-1/2 py-3 text-xs sm:text-sm font-semibold transition-all
        border-b-4 flex items-center justify-center gap-1
        ${
          activeSection === "general"
            ? "border-blue-600 text-blue-600 bg-blue-50"
            : "border-transparent text-gray-600 hover:bg-gray-50"
        }`}
      >
        Aptitude
        <span className="text-[10px] sm:text-xs text-gray-500">
          ({generalQuestions.length})
        </span>
      </button>

      {/* Technical Tab */}
      <button
        onClick={() => {
          setActiveSection("technical");
          setCurrentPage(0);
        }}
        className={`w-1/2 py-3 text-xs sm:text-sm font-semibold transition-all
        border-b-4 flex items-center justify-center gap-1
        ${
          activeSection === "technical"
            ? "border-blue-600 text-blue-600 bg-blue-50"
            : "border-transparent text-gray-600 hover:bg-gray-50"
        }`}
      >
        {trade || "Technical"}
        <span className="text-[10px] sm:text-xs text-gray-500">
          ({technicalQuestions.length})
        </span>
      </button>

    </div>
  </div>
</div>


        {/* Main Content */}
        <div className="flex gap-2 sm:gap-4 pt-32 sm:pt-36 pb-24 px-2 sm:px-4">
          {/* Main Question Area */}
          <div className="flex-1 min-w-0">
            <div className="max-w-3xl mx-auto">
              {getCurrentQuestions().length > 0 ? (
                getCurrentQuestions().map((question) => (
                  <div key={question.id} className="bg-white rounded-lg shadow-lg p-4 sm:p-8">
                    <div className="mb-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-lg sm:text-xl font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                            Q{currentPage + 1}
                          </span>
                          <span className="text-xs sm:text-sm text-gray-500 font-medium">
                            {isQuestionAttempted(Number(question.id)) ? "✓ Attempted" : "○ Unattempted"}
                          </span>
                        </div>
                      </div>

                      {question.format !== "img" ? (
                        <h2 className="text-base sm:text-xl font-semibold text-gray-800 mb-4 leading-relaxed">
                          {question.description}
                        </h2>
                      ) : (
                        <div className="mb-6">
                          <img
                            src={question.description}
                            alt="Question"
                            className="max-w-full h-auto rounded-lg shadow-md mx-auto"
                            style={{ maxHeight: '300px' }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      {(() => {
                        const isSingleAnswer = question?.correct_option &&
                          Array.isArray(question.correct_option) &&
                          question.correct_option.length === 1;
                        return (
                          <h3 className="text-xs sm:text-sm font-medium text-gray-700 mb-3">
                            {isSingleAnswer
                              ? "Select one:"
                              : "Select all correct:"}
                          </h3>
                        );
                      })()}

                      {question?.options && Array.isArray(question.options) && question.options.map((option, optIdx) => {
                        const savedAnswer = answers.find(
                          (a) => a.question_id === question.id
                        );
                        const selectedOptions = savedAnswer?.selected_options || [];
                        const backendOptionIndex = optIdx + 1;
                        const isSingleAnswer = question?.correct_option &&
                          Array.isArray(question.correct_option) &&
                          question.correct_option.length === 1;

                        return (
                          <label
                            key={optIdx}
                            className={`flex items-start space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all active:scale-95 ${
                              selectedOptions.includes(backendOptionIndex)
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type={isSingleAnswer ? "radio" : "checkbox"}
                              name={`q${question.id}`}
                              className={`mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 rounded flex-shrink-0 cursor-pointer ${
                                isSingleAnswer ? 'rounded-full' : 'rounded'
                              }`}
                              checked={selectedOptions.includes(backendOptionIndex)}
                              onChange={() =>
                                handleAnswerChange(Number(question.id), optIdx)
                              }
                            />
                            <span className="text-xs sm:text-sm text-gray-800 leading-relaxed">
                              {option}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 text-center">
                  <p className="text-sm text-gray-600">No questions available in this section.</p>
                </div>
              )}
            </div>
          </div>

          {/* Question Navigation Sidebar - Hidden on Mobile */}
          <div className="hidden lg:block w-48 xl:w-56">
            <div className="bg-white rounded-lg shadow-lg p-3 sticky top-32 max-h-[calc(100vh-200px)] overflow-y-auto">
              <h3 className="font-bold text-sm text-gray-800 mb-3">Questions</h3>
              <div className="grid grid-cols-4 gap-2">
                {currentSectionQuestions.map((question, idx) => (
                  <button
                    key={question.id}
                    onClick={() => setCurrentPage(idx)}
                    className={`p-2 rounded text-xs font-semibold transition-colors ${
                      currentPage === idx
                        ? 'bg-blue-600 text-white'
                        : isQuestionAttempted(Number(question.id))
                          ? 'bg-green-100 text-green-800 border-2 border-green-500'
                          : 'bg-gray-100 text-gray-600 border-2 border-gray-300'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-100 border-2 border-green-500 rounded"></div>
                  <span>Attempted</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-100 border-2 border-gray-300 rounded"></div>
                  <span>Unattempted</span>
                </div>
                {/* <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-100 border-2 border-gray-300 rounded"></div>
                  <span className="text-xs text-gray-700 font-medium">
                Q: {currentPage + 1}/{currentSectionQuestions?.length || 0}
              </span>
                </div> */}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Footer - Responsive */}
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t z-40">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-3">
            <div className="flex justify-between items-center gap-2">
              <Button
                onClick={() => setCurrentPage((prev) => prev - 1)}
                disabled={currentPage === 0}
                variant="outline"
                className="flex-1 px-2 sm:px-4 py-2 text-xs sm:text-sm h-9"
              >
                ← Prev
              </Button>

              <span className="text-xs sm:text-sm text-gray-600 hidden sm:block flex-1 text-center">
                {currentPage + 1} / {currentSectionQuestions?.length || 0}
              </span>

              {!isLastPage && (
                <Button
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={!currentSectionQuestions || !Array.isArray(currentSectionQuestions) || currentPage >= currentSectionQuestions.length - 1}
                  className="flex-1 px-2 sm:px-4 py-2 text-xs sm:text-sm h-9"
                >
                  Next →
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Fullscreen Exit Overlay */}
        {isFullscreenExited && questions && Array.isArray(questions) && questions.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-4 sm:p-8 rounded-lg shadow-xl text-center max-w-sm w-full">
              <h2 className="text-lg sm:text-2xl font-bold text-red-600 mb-3">
                Fullscreen Required
              </h2>
              <p className="text-gray-700 mb-4 text-xs sm:text-base">
                Fullscreen mode is mandatory. Returning to fullscreen automatically.
              </p>
              <button
                onClick={handleReturnToFullscreen}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors text-xs sm:text-base w-full"
              >
                Return Now
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Login screen - Trade selection only
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {isFullscreenExited && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 sm:p-8 rounded-lg shadow-xl text-center max-w-sm w-full">
            <h2 className="text-lg sm:text-2xl font-bold text-red-600 mb-3">
              Fullscreen Required
            </h2>
            <p className="text-gray-700 mb-4 text-xs sm:text-base">
              Please return to fullscreen to continue.
            </p>
            <button
              onClick={handleReturnToFullscreen}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors text-xs sm:text-base w-full"
            >
              Return to Fullscreen
            </button>
          </div>
        </div>
      )
      }

      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8">
          <h1 className="text-xl sm:text-2xl font-bold text-center mb-4 text-gray-800">Aptitude Test</h1>
          
          {/* Display Registration Number */}
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-gray-600 font-medium">Registration Number:</p>
            <p className="text-sm font-bold text-blue-600">{regNo || "Not Found"}</p>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <label className="block text-xs sm:text-sm font-medium text-gray-700">Select Your Trade</label>
              <Select onValueChange={setTrade} value={trade}>
                <SelectTrigger className="w-full text-xs sm:text-sm">
                  <SelectValue placeholder="Choose your trade" />
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
              disabled={loading || !regNo}
              onClick={() => handleGetQuiz()}
              className="w-full py-2 text-xs sm:text-sm"
            >
              {loading ? "Loading..." : "Start Test"}
            </Button>

            {!regNo && (
              <p className="text-xs text-red-600 text-center font-medium">
                Registration number not found. Please login first.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>

  );
};

export default AppearAptitude;

// Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8 max-w-sm w-full">
            <h1 className="text-lg sm:text-2xl font-bold text-center mb-4 text-red-600">Error</h1>
            <p className="text-gray-700 mb-4 text-xs sm:text-sm">
              Something went wrong. Try refreshing.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-xs sm:text-sm"
            >
              Refresh
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export const AppearAptitudeWithErrorBoundary = () => (
  <ErrorBoundary>
    <AppearAptitude />
  </ErrorBoundary>
);

