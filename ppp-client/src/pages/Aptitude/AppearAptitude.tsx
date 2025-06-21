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
  

  interface Answer {
    question_id: number;
    selected_option: number;
  }

  const [answers, setAnswers] = useState<Answer[]>([]);

  const questionsPerPage = 10;
  const params = useParams();
  const aptiId = params.id;

  
  const navigate = useNavigate();

  // Load saved registration and trade data on mount
  useEffect(() => {
    const savedRegNo = sessionStorage.getItem(`aptitude-regno-${aptiId}`);
    const savedTrade = sessionStorage.getItem(`aptitude-trade-${aptiId}`);
    
    if (savedRegNo && savedTrade) {
      setRegNo(savedRegNo);
      setTrade(savedTrade);
      // Automatically fetch quiz if we have saved credentials
      handleGetQuiz(savedRegNo, savedTrade);
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

  const handleViolation = (type) => {
  const regNo = localStorage.getItem("regno");
  const testId = localStorage.getItem("aptitude_test_id"); // Store this when test starts

  setWarnings(prev => {
    const newCount = prev + 1;

    toast({
      title: "Warning",
      description: `Warning ${newCount}: ${type} is not allowed!`,
      variant: "destructive",
    });

    fetch("/api/update-warnings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        regno: regNo,
        aptitude_test_id: testId,
        warnings: newCount,
      }),
    }).catch(err => console.error("Warning update failed", err));

    if (newCount >= 3) {
      toast({
        title: "Warning",
        description: "You have violated the rules 3 times. Test ended.",
        variant: "destructive",
      });
      navigate("/"); // or auto-submit
    }

    return newCount;
  });
};



  const requestFullscreen = () => {
    const docElm = document.documentElement;
    if (docElm.requestFullscreen) docElm.requestFullscreen();
  };

  const detectFullScreenExit = () => {
    if (
      !document.fullscreenElement) {
      handleViolation("Exiting fullscreen");
      setIsFullscreenExited(true);
      requestFullscreen(); // Try to re-enter fullscreen
    }
    else {
    setIsFullscreenExited(false); // Hide blur overlay when back in fullscreen
  }
  };

  const handleReturnToFullscreen = () => {
    requestFullscreen();
    setIsFullscreenExited(false);
  };

  

  useEffect(() => {
    // Auto fullscreen on load
    requestFullscreen();

    // Fullscreen exit detection
    document.addEventListener("fullscreenchange", detectFullScreenExit);
    

    return () => {
      document.removeEventListener("fullscreenchange", detectFullScreenExit);
      
    };
  }, []);

  useEffect(() => {
    const blockActions = (e) => {
      e.preventDefault();
      handleViolation("Copy/Paste/Cut/Right-click");
      return false;
    };

    const blockKeys = (e) => {
      if (
        (e.ctrlKey && ["c", "v", "x", "u", "s", "i", "j"].includes(e.key.toLowerCase())) ||
        e.key === "F12"
      ) {
        e.preventDefault();
        handleViolation(`Key "${e.key}"`);
        return false;
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState !== "visible") {
        handleViolation("Tab switching");
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
  }, [navigate]);

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
        if (cheatingAttempts > 3) {
          toast({
            title: "Cheating Warning",
            description:
              "You have been caught cheating. Your quiz has been cancelled.",
            variant: "destructive",
          });
          setTimeout(() => {
            handleSubmitQuestions();
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
      let response: ApiResponse = await aptitudeService.getAptitudeForUser(
        {
          trade: tradeToUse,
          regno: regNoToUse,
        },
        aptiId
      );
      
      // Save credentials to sessionStorage
      sessionStorage.setItem(`aptitude-regno-${aptiId}`, regNoToUse);
      sessionStorage.setItem(`aptitude-trade-${aptiId}`, tradeToUse);

      if (typeof response.data === "string")
        response.data = JSON.parse(response.data);
      
      const sortedQuestions = [
        ...response.data.questions.filter(
          (q: Question) => q.question_type === "GENERAL"
        ),
        ...response.data.questions.filter(
          (q: Question) => q.question_type !== "GENERAL"
        ),
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

  const getCurrentQuestions = () => {
    const start = currentPage * questionsPerPage;
    return questions.slice(start, start + questionsPerPage);
  };

  const isLastPage =
    currentPage === Math.ceil(questions.length / questionsPerPage) - 1;

   const handleSubmitQuestions = async () => {
    if (!answers || answers.length === 0) {
      toast({
        title: "Error",
        description: "No answers to submit",
        variant: "destructive",
      });
      console.log(answers);
      return;
    }

    // Validate that we have at least some answers
    const hasAnswers = answers.some(answer => answer.selected_option !== 0);
    if (!hasAnswers) {
      toast({
        title: "Error",
        description: "Please answer at least one question before submitting",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await aptitudeService.submitAptitude(
        { regno: regNo, trade },
        Number(aptitude?.id),
        answers
      );
      
      toast({
        title: "Success",
        description: "Questions submitted successfully",
      });

      if (aptitude?.id) {
        // Clear all storage related to this aptitude
        localStorage.setItem(`aptitude-${aptitude.id}-submitted`, "true");
        localStorage.removeItem(`aptitude-${aptitude.id - 1}-submitted`);
        sessionStorage.removeItem(`aptitude-answers-${aptitude.id}`);
        sessionStorage.removeItem(`aptitude-start-${aptitude.id}`);
        sessionStorage.removeItem(`aptitude-regno-${aptiId}`);
        sessionStorage.removeItem(`aptitude-trade-${aptiId}`);
      }
      
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit questions",
        variant: "destructive",
      });
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
      <div className="container mx-auto p-4 max-w-md relative">
        <CameraCapture contestId={String(aptiId)} userId={regNo} />
        <div className="fixed top-16 right-2 lg:right-4 bg-[#cc4a4a] backdrop-blur-sm text-white text-xs lg:text-sm px-2 py-1 rounded-md shadow">
          Time: {formatTime(timeLeft)}
        </div>

        <div className="mb-4">
          <h1 className="text-2xl font-bold">{aptitude?.name}</h1>
          <p className="text-sm text-gray-600">
            Duration: {aptitude?.duration} minutes | Page {currentPage + 1} of{" "}
            {Math.ceil(questions.length / questionsPerPage)}
          </p>
        </div>

        <div className="space-y-6">
          {getCurrentQuestions().map((question, idx) => (
            <div key={question.id} className="bg-white p-4 rounded-lg shadow">
              <p className="font-medium mb-3">
                {currentPage * questionsPerPage + idx + 1}.{" "}
                {question.format === "img" ? (
                  <img
                    src={question.description}
                    alt="Question"
                    className="max-w-full h-auto my-2"
                  />
                ) : (
                  question.description
                )}
              </p>
              <div className="space-y-2">
                {question.options.map((option, optIdx) => {
                  const savedAnswer = answers.find(
                    (a) => a.question_id === question.id
                  );
                  return (
                    <label
                      key={optIdx}
                      className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded"
                    >
                    {isFullscreenExited && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white p-8 rounded-lg shadow-xl text-center">
                        <h2 className="text-2xl font-bold text-red-600 mb-4">
                          ⚠️ Fullscreen Required
                        </h2>
                        <p className="text-gray-700 mb-6">
                          You have exited fullscreen mode. Please return to fullscreen to continue the test.
                        </p>
                        <button
                          onClick={handleReturnToFullscreen}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                        >
                          Return to Fullscreen
                        </button>
                      </div>
                    </div>
                  )}
                      <input
                        type="radio"
                        name={`q${question.id}`}
                        className="w-4 h-4"
                        checked={savedAnswer?.selected_option === optIdx + 1}
                        onChange={() =>
                          handleAnswerChange(Number(question.id), optIdx)
                        }
                      />
                      <span>{option}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-6">
          <Button
            onClick={() => setCurrentPage((prev) => prev - 1)}
            disabled={currentPage === 0}
          >
            Previous
          </Button>
          {isLastPage ? (
            <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
              <DialogTrigger asChild>
                <Button disabled={loading}>Submit</Button>
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
                  <Button disabled={loading} onClick={handleSubmitQuestions}>
                    {loading ? "Submitting..." : "Confirm Submit"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <Button
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={
                currentPage >=
                Math.ceil(questions.length / questionsPerPage) - 1
              }
            >
              Next
            </Button>
          )}
        </div>

        
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-md">
      {isFullscreenExited && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              ⚠️ Fullscreen Required
            </h2>
            <p className="text-gray-700 mb-6">
              You have exited fullscreen mode. Please return to fullscreen to continue the test.
            </p>
            <button
              onClick={handleReturnToFullscreen}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Return to Fullscreen
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-center">Aptitude Test</h1>

        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Registration Number
          </label>
          <Input
            type="text"
            value={regNo}
            onChange={(e) => setRegNo(e.target.value)}
            placeholder="Enter your registration number"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Select Trade</label>
          <Select onValueChange={setTrade} >
            <SelectTrigger>
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
          className="w-full"
        >
          {loading ? "Getting Quiz..." : "Get Quiz"}
        </Button>

        <p className="text-sm text-gray-500 text-center">
          Note: Location access is required to ensure test integrity. Please
          allow location access when prompted by your browser.
          If we caught you cheating 3 times, the test will automatically submitted!
        </p>
      </div>
    </div>
  );
};

export default AppearAptitude;

