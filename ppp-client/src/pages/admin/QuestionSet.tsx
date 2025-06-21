import { useEffect, useState } from "react";
import { Question, QuestionFilters } from "@/types/Question";

import questionService from "@/api/services/question.service";
import PaginationComp from "@/components/pagination/PaginationComp";
import QuestionTable from "../../components/QuestionTable/QuestionTable";
import Filters from "@/components/QuestionTable/Filters";
import { useToast } from "@/hooks/use-toast";
import AddQuestionDialog from "@/components/QuestionTable/AddQuestionDialog";
import { Button } from "@/shadcn/ui/button";
import aptitudeService from "@/api/services/aptitude.service";
import { useSelector } from "react-redux";
import { Aptitude } from "@/types/Aptitude";
import { uncheckAll } from "@/redux/slices/aptitude";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shadcn/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shadcn/ui/select";
import { useDispatch } from "react-redux";
import { ApiResponse } from "@/types/Api";

export default function QuestionSet() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(5); // You would calculate this based on your data
  const [filters, setFilters] = useState<QuestionFilters>({
    question_type: "",
    difficulty_level: 0,
    topic_tags: [],
    sort: "DESC",
  });
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const dispatch = useDispatch();
  const selectedQuestions = useSelector(
    (state: any) => state.aptitude.selectedQuestions
  );

  const [upcomingAptitudes, setUpcomingAptitudes] = useState<Aptitude[]>([]);
  const [selectedAptitude, setSelectedAptitude] = useState<Aptitude | null>(
    null
  );

  useEffect(()=>{
    console.log(upcomingAptitudes);

  })

  const fetchQuestions = async (page: number, limit: number) => {
    try {
      const res:ApiResponse = await questionService.getQuestions(page, limit, filters);
      setTotalPages(res.data.totalPages);
      setQuestions(res.data.results);
      console.log(filters);
      toast({
        title: "Success",
        description: "Questions fetched successfully",
      });
      console.log(questions);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to fetch questions",
        variant: "destructive",
      });
    }
  };

  const getUpcomingAptitudes = async () => {
    try {
      const { data } = await aptitudeService.getUpcomingAptitudes();
      setUpcomingAptitudes(data);
    } catch (error) {
      console.error(error);
    }
  };

  const addQuestionsToAptitude = async (aptiId: number) => {
    if (selectedQuestions.length === 0) {
      toast({
        title: "Error",
        description: "Please select atleast one question",
        variant: "destructive",
      });
      return;
    }
    try {
      await aptitudeService.addQustionsToAptitude(aptiId, selectedQuestions);
      toast({
        title: "Success",
        description: "Questions added to aptitude successfully",
      });
      setDialogOpen(false);
      dispatch(uncheckAll());
    } catch (error) {
      toast({
        title: "Error",
        description:
          (error as Error).message || "Failed to add questions to aptitude",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    // Fetch questions data
    fetchQuestions(page, 100);
    getUpcomingAptitudes();
  }, [page, filters]);

  return (
    <div className="container mx-auto p-2 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Question Set</h1>
        {/* Add Question Dialog */}
        <div className="flex gap-5">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>Add Question to Aptitude</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Select Aptitude</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                <Select
                  onValueChange={(value) =>
                    setSelectedAptitude(
                      upcomingAptitudes.find(
                        (apt) => apt.id === Number(value)
                      ) || null
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an aptitude" />
                  </SelectTrigger>
                  <SelectContent>
                    {upcomingAptitudes.map((aptitude) => (
                      <SelectItem key={aptitude.id} value={String(aptitude.id)}>
                        {aptitude.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={() =>
                    selectedAptitude?.id !== undefined &&
                    addQuestionsToAptitude(selectedAptitude.id)
                  }
                  disabled={!selectedAptitude}
                >
                  Save
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <AddQuestionDialog />
        </div>
      </div>

      {/* Filters */}
      <Filters filters={filters} setFilters={setFilters} />

      {/* Questions Table */}
      <QuestionTable questions={questions} />

      {/* Pagination */}
      <PaginationComp page={page} totalPages={totalPages} setPage={setPage} />
    </div>
  );
}
