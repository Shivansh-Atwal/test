import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Check, X, Stars } from "lucide-react";
import aptitudeService from "@/api/services/aptitude.service";
import { useToast } from "@/hooks/use-toast";
import { ApiResponse } from "@/types/Api";
import { useSearchParams } from "react-router-dom";
import questionService from "@/api/services/question.service";

interface Question {
  id: number;
  description: string;
  options: string[];
  correct_option: number;
  format: "text" | "img";
  question_type: string;
  marks: number;
}

interface QuestionResponse {
  question: Question;
  answer: number;
  explanation?: string;
  isExplaining?: boolean;
}

interface ResultSummary {
  total_questions: number;
  total_marks: number;
  rank: number;
  total_users: number;
  top: any;
  marks_obtained: number;
}

const AptitudeResult = () => {
  const [responses, setResponses] = useState<QuestionResponse[]>([]);
  const [summary, setSummary] = useState<ResultSummary | null>(null);
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const { id } = useParams();
  const regno = searchParams.get("regno");

  const explainUsingAi = async (questionId: number, index: number) => {
    try {
      setResponses((prev) =>
        prev.map((r, i) => (i === index ? { ...r, isExplaining: true } : r))
      );
  
      const response = await questionService.explainUsingAi(questionId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No reader available');
      }
  
      let explanation = '';
      const decoder = new TextDecoder();
  
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
  
        // Decode the chunk and split by newlines
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
  
        for (const line of lines) {
          if (line.trim().startsWith('data: ')) {
            try {
              // Remove 'data: ' prefix and parse JSON
              const jsonStr = line.replace('data: ', '').trim();
              if (jsonStr) {
                const data = JSON.parse(jsonStr);
                if (data.content) {
                  explanation += data.content;
                  // Update state with accumulated explanation
                  setResponses((prev) =>
                    prev.map((r, i) => 
                      i === index ? { ...r, explanation } : r
                    )
                  );
                }
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
  
      setResponses((prev) =>
        prev.map((r, i) => (i === index ? { ...r, isExplaining: false } : r))
      );
    } catch (error) {
      console.error('AI Explanation Error:', error);
      toast({
        title: "Error",
        description: "Failed to get AI explanation",
        variant: "destructive",
      });
      setResponses((prev) =>
        prev.map((r, i) => (i === index ? { ...r, isExplaining: false } : r))
      );
    }
  };

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const response: ApiResponse = await aptitudeService.getAptitudeResult(
          Number(id),
          regno
        );
        interface ApiResponseData {
          responses: Array<{
            question: Question;
            answer: number;
            explanation?: string;
          }>;
          rank: number;
          total_users: number;
          marks: number;
        }

        setResponses(
          (response.data as ApiResponseData).responses.map((r) => ({
            ...r,
            isExplaining: false,
          }))
        );
        setSummary({
          total_questions: response.data.responses.length,
          total_marks: response.data.responses.length,
          rank: response.data.rank,
          total_users: response.data.total_users,
          marks_obtained: response.data.marks,
          top: (
            (+response.data.rank / +response.data.total_users) *
            100
          ).toFixed(2),
        });
      } catch (error) {
        toast({
          title: "Error",
          description: (error as any).response.data.message,
          variant: "destructive",
        });
      }
    };


    fetchResult();
  }, [id]);

  return (
    <div className="container mx-auto p-6">
      {summary && (
        <div className="mb-8 bg-white rounded-lg p-6 shadow-sm border">
          <h1 className="text-3xl font-bold mb-4">Aptitude Test Result</h1>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600 text-sm">Marks Obtained</p>
              <p className="text-2xl font-semibold">
                {summary.marks_obtained}/{summary.total_marks}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600 text-sm">Percentage</p>
              <p className="text-2xl font-semibold">
                {((summary.marks_obtained / summary.total_marks) * 100).toFixed(
                  2
                )}
                %
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600 text-sm">Rank</p>
              <p
                className={`text-2xl font-semibold ${
                  summary.rank !== null && summary.rank <= 100
                    ? "text-green-500"
                    : summary.rank != null && summary.rank < 250
                    ? "text-orange-300"
                    : "text-gray-400"
                }`}
              >
                {summary.rank !== null ? summary.rank : "N/A"}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600 text-sm">Better than </p>
              <p className="text-2xl font-semibold">
                {summary.rank !== null
                  ? (100 - (summary.rank / summary.total_users) * 100).toFixed(
                      2
                    )
                  : "N/A"}
                %
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {responses.map((response, index) => (
          <div
            key={response.question.id}
            className="border rounded-lg p-4 bg-white shadow-sm"
          >
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-semibold">Question {index + 1}</h3>
              <div className="flex items-center gap-2">
                {response.answer === response.question.correct_option ? (
                  <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded">
                    <Check className="h-4 w-4" />
                    Correct
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded">
                    <X className="h-4 w-4" />
                    Incorrect
                  </span>
                )}
              </div>
            </div>

            <p className="mb-4">
              {response.question.format === "img" ? (
                <img
                  src={response.question.description}
                  alt="Question"
                  className="max-w-full h-auto"
                />
              ) : (
                response.question.description
              )}
            </p>

            <div className="grid grid-cols-2 gap-4">
              {response.question.options.map((option, optionIndex) => (
                <div
                  key={optionIndex + 1}
                  className={`p-3 rounded-lg border ${
                    optionIndex + 1 === response.question.correct_option
                      ? "bg-green-50 border-green-200"
                      : optionIndex + 1 === response.answer &&
                        optionIndex + 1 !== response.question.correct_option
                      ? "bg-red-50 border-red-200"
                      : "bg-gray-50"
                  }`}
                >
                  {option}
                </div>
              ))}
            </div>

            {response.answer !== response.question.correct_option && (
              <div className="mt-4">
                {!response.explanation && !response.isExplaining && (
                  <button
                    onClick={() => explainUsingAi(response.question.id, index)}
                    className="flex items-center gap-2 px-4 lg:px-4 lg:py-2 py-[5px] text-xs lg:text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-full hover:from-purple-600 hover:to-pink-600 transition-colors duration-200 shadow-md"
                  >
                    <Stars className="lg:h-4 lg:w-4 h-3 w-3" />
                    Explain using AI
                  </button>
                )}

                {response.isExplaining && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-500 border-t-transparent"></div>
                    Getting AI explanation...
                  </div>
                )}

                {response.explanation && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                    <p className="text-gray-700 leading-relaxed">
                      {response.explanation}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AptitudeResult;
