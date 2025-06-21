import { useEffect, useState } from "react";
import aptitudeService from "@/api/services/aptitude.service";
import { useToast } from "@/hooks/use-toast";
import { useParams } from "react-router-dom";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shadcn/ui/alert-dialog";
import { Button } from "@/shadcn/ui/button";

interface Question {
  question_id: number;
  description: string;
  topic_tags: string[];
  question_type: string;
  last_used: string | null;
  difficulty_level: number;
  options: string[];
  correct_option: number;
}

interface Aptitude {
  id: number;
  name: string;
  test_timestamp: string;
  duration: number;
}

const AptitudeQuestions = () => {
  const [aptitude, setAptitude] = useState<Aptitude | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
  const { toast } = useToast();

  const aptiId:any = useParams().id;

  const fetchAptitudeDetails = async () => {
    try {
      const response: { data: { aptitude: Aptitude; questions: Question[] } } = await aptitudeService.getAptitudeQuestions(+aptiId);
      setAptitude(response.data.aptitude);
      setQuestions(response.data.questions);
      toast({
        title: "Success",
        description: "Aptitude test fetched successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch aptitude details",
        variant: "destructive",
      });
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    setSelectedQuestionId(questionId);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedQuestionId) return;
    
    setIsDeleting(selectedQuestionId);
    try {
      await aptitudeService.deleteQuestionFromApptitude(aptiId,selectedQuestionId);
      setQuestions(questions.filter(q => q.question_id !== selectedQuestionId));
      toast({
        title: "Success",
        description: "Question deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete question",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
      setShowDeleteDialog(false);
      setSelectedQuestionId(null);
    }
  };

  useEffect(() => {
    fetchAptitudeDetails();
  }, []);

  return (
    <div className="container mx-auto px-3">
      {aptitude && (
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{aptitude.name}</h1>
          <p className="text-gray-600">
            Duration: {aptitude.duration} minutes | 
            Date: {new Date(parseInt(aptitude.test_timestamp) * 1000).toLocaleDateString()} |
          Questions: {questions.length}
          </p>
        </div>
      )}

      <div className="space-y-8">
        {questions.map((question, index) => (
          <div key={question.question_id} className="border rounded-lg px-3 lg:px-6 py-5 bg-white shadow-sm">
            <div className="flex justify-between mb-4">
              <h3 className="text-base  lg:text-lg font-semibold">Question {index + 1}</h3>
              <div className="flex items-center gap-4">
                <div className="flex gap-1 lg:gap-2 text-sm">
                  <span className="text-xs lg:text-base h-fit px-2 py-1 bg-gray-100 rounded">
                    Type: {question.question_type}
                  </span>
                  <span className="px-2 h-fit text-xs lg:text-base py-1 bg-gray-100 rounded">
                    Difficulty: {question.difficulty_level}
                  </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleDeleteQuestion(question.question_id)}
                  disabled={isDeleting === question.question_id}
                >
                  {isDeleting === question.question_id ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
                </div>
              </div>
            </div>

            <p className="mb-4">
              {question.description.startsWith('https://') ? (
                <img src={question.description} alt="Question" className="max-w-full h-auto" />
              ) : (
                question.description
              )}
            </p>

            <div className="grid grid-cols-2 gap-4">
              {question.options.map((option, optionIndex) => (
                <div
                  key={optionIndex}
                  className={`p-3 rounded-lg border ${
                    optionIndex+1 === question.correct_option
                      ? "bg-green-50 border-green-200"
                      : "bg-gray-50"
                  }`}
                >
                  {option}
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {question.topic_tags.map((tag, tagIndex) => (
                <span
                  key={tagIndex}
                  className="px-2 py-1 bg-blue-50 text-blue-600 text-sm rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the question.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AptitudeQuestions;