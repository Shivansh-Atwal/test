import React from "react";
import { Question } from "@/types/Question";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shadcn/ui/table";
import { Button } from "@/shadcn/ui/button";
import { Checkbox } from "@/shadcn/ui/checkbox";
import questionService from "@/api/services/question.service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shadcn/ui/dialog";
interface QuestionTableProps {
  questions: Question[];
}
import { useDispatch, useSelector } from "react-redux";
import { checkeQs, uncheckQs } from "@/redux/slices/aptitude";
import { rootState } from "@/redux/store";
import { useToast } from "@/hooks/use-toast";

const QuestionTable: React.FC<QuestionTableProps> = ({ questions }) => {
  const { selectedQuestions } = useSelector(
    (state: rootState) => state.aptitude
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [questionToDelete, setQuestionToDelete] = React.useState<number | null>(null);

  const timestampToDate = (timestamp: string) => {
    const date = new Date(parseInt(timestamp) );
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const { toast } = useToast();

  const deleteQs = async (id: number) => {
    console.log("Delete Question with id: ", id);
    try {
      await questionService.deleteQuestion(id);
      toast({
        title: "Success",
        description: "Question Deleted",
      });
      setDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete Question",
        variant: "destructive",
      });
    }
  }

  const dispatch = useDispatch();

  return (
    <div className="overflow-x-auto">
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <p>Are you sure you want to delete this question?</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={() => questionToDelete && deleteQs(questionToDelete)}
              >
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">Select</TableHead>
            <TableHead className="min-w-[200px]">Description</TableHead>
            <TableHead className="min-w-[120px]">Type</TableHead>
            <TableHead className="min-w-[120px]">Topics</TableHead>
            <TableHead className="min-w-[100px]">Difficulty</TableHead>
            <TableHead className="min-w-[120px]">Last Used</TableHead>
            <TableHead className="min-w-[120px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {questions.map((question) => (
            <TableRow key={question.id}>
              <TableCell>
                <Checkbox
                  checked={selectedQuestions.includes(Number(question?.id))}
                  onCheckedChange={(checked) => {
                    console.log(selectedQuestions);
                    if (checked) {
                      dispatch(checkeQs(Number(question.id)));
                    } else {
                      dispatch(uncheckQs(Number(question.id)));
                    }
                  }}
                />
              </TableCell>
              <TableCell className="font-medium">
                {question.description}
              </TableCell>
              <TableCell>{question.question_type}</TableCell>
              <TableCell>{question.topic_tags}</TableCell>
              <TableCell>{question.difficulty_level}</TableCell>
              <TableCell>
                {question.last_used
                  ? timestampToDate(question.last_used)
                  : "N/A"}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => {
                      setQuestionToDelete(Number(question.id));
                      setDeleteDialogOpen(true);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default QuestionTable;
