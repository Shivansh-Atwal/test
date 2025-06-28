import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shadcn/ui/dialog";
import { Button } from "@/shadcn/ui/button";
import { Input } from "@/shadcn/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shadcn/ui/select";
import { Label } from "@/shadcn/ui/label";
import { Textarea } from "@/shadcn/ui/textarea";
import { QUESTION_TYPES } from "@/constants";
import { Checkbox } from "@/shadcn/ui/checkbox";
import { Plus, Minus } from "lucide-react";

import questionService from "@/api/services/question.service";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ApiResponse } from "@/types/Api";

const AddQuestionDialog: React.FC = () => {
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [newQuestion, setNewQuestion] = useState<{
    description: string;
    topic_tags: string;
    question_type: string;
    difficulty_level: number;
    options: string[];
    correct_option: number[];
    format: string;
    img: File | null;
  }>({
    description: "",
    topic_tags: "",
    question_type: "GENERAL",
    difficulty_level: 1,
    options: ["", ""],
    correct_option: [],
    format: "text",
    img: null,
  });

  const [topics, setTopics] = useState<string[]>([]);
  const [topicInput, setTopicInput] = useState("");
  const [filteredTopics, setFilteredTopics] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  useEffect(() => {
    questionService
      .getTopics(newQuestion.question_type)
      .then((res: ApiResponse) => setTopics(res.data))
      .catch(console.error);
  }, [newQuestion.question_type]);

  useEffect(() => {
    if (topicInput.trim()) {
      const filtered = topics.filter(
        (topic) =>
          topic.toLowerCase().includes(topicInput.toLowerCase()) &&
          !selectedTopics.includes(topic)
      );
      setFilteredTopics(filtered);
    } else {
      setFilteredTopics([]);
    }
  }, [topicInput, topics, selectedTopics]);

  useEffect(() => {
    // Update newQuestion.topic_tags whenever selectedTopics changes
    setNewQuestion((prev) => ({
      ...prev,
      topic_tags: selectedTopics.join(","),
    }));
  }, [selectedTopics]);

  const handleAddQuestion = async () => {
    // validate
    if (
      !newQuestion.topic_tags ||
      !newQuestion.options.every((option) => option.trim()) ||
      newQuestion.correct_option.length === 0 ||
      (newQuestion.format === "text" && !newQuestion.description) ||
      (newQuestion.format === "img" && !newQuestion.img) ||
      !newQuestion.question_type ||
      !newQuestion.difficulty_level
    ) {
      toast({
        title: "Error",
        description: "Please fill all the fields and select at least one correct answer",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Create FormData to handle file upload
      const formData = new FormData();
      (Object.keys(newQuestion) as (keyof typeof newQuestion)[]).forEach(
        (key) => {
          if (key === "img" && newQuestion.img) {
            formData.append("img", newQuestion.img);
          } else if (key === "correct_option") {
            // Handle correct_option array specially - send as JSON
            const correctOptionJson = JSON.stringify(newQuestion[key]);
            console.log('Sending correct_option as JSON:', correctOptionJson);
            formData.append(key, correctOptionJson);
          } else {
            if (typeof newQuestion[key] === "string")
              formData.append(key, newQuestion[key].trim());
            else if (Array.isArray(newQuestion[key]))
              formData.append(key, newQuestion[key].join("/|/").trim());
            else formData.append(key, JSON.stringify(newQuestion[key]).trim());
          }
        }
      );

      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(key, ':', value);
      }

      // API call to add question
      const res = await questionService.addQuestion(formData);
      console.log(res);
      // setQuestions([...questions, res.data]);
      setNewQuestion({ 
        description: "",
        topic_tags: "",
        question_type: "GENERAL",
        difficulty_level: 1,
        options: ["", ""],
        correct_option: [],
        format: "text",
        img: null,
      });
      setSelectedTopics([]);
      toast({
        title: "Success",
        description: "Question added successfully",
      });
      setIsAddingQuestion(false);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to add question",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to add a new option
  const addOption = () => {
    setNewQuestion({
      ...newQuestion,
      options: [...newQuestion.options, ""],
    });
  };

  // Function to remove an option
  const removeOption = (index: number) => {
    if (newQuestion.options.length <= 2) {
      toast({
        title: "Error",
        description: "At least 2 options are required",
        variant: "destructive",
      });
      return;
    }
    
    const newOptions = newQuestion.options.filter((_, i) => i !== index);
    const newCorrectOptions = newQuestion.correct_option
      .filter(optionIndex => optionIndex !== index + 1)
      .map(optionIndex => optionIndex > index + 1 ? optionIndex - 1 : optionIndex);
    
    setNewQuestion({
      ...newQuestion,
      options: newOptions,
      correct_option: newCorrectOptions,
    });
  };

  // Function to handle correct answer selection
  const handleCorrectOptionChange = (optionIndex: number, checked: boolean) => {
    const optionNumber = optionIndex + 1; // Convert to 1-based indexing
    let newCorrectOptions: number[];
    
    if (checked) {
      newCorrectOptions = [...newQuestion.correct_option, optionNumber];
    } else {
      newCorrectOptions = newQuestion.correct_option.filter(opt => opt !== optionNumber);
    }
    
    setNewQuestion({
      ...newQuestion,
      correct_option: newCorrectOptions,
    });
  };

  return (
    <div>
      <Dialog open={isAddingQuestion} onOpenChange={setIsAddingQuestion}>
        <DialogTrigger asChild>
          <Button>Add Question</Button>
        </DialogTrigger>
        <DialogContent className="w-[95vw] max-w-[600px] h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Question</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="format" className="text-foreground">
                Question Format
              </Label>
              <Select
                value={newQuestion.format}
                onValueChange={(value) =>
                  setNewQuestion({
                    ...newQuestion,
                    format: value,
                  })
                }
              >
                <SelectTrigger id="format">
                  <SelectValue placeholder="Question Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="img">img</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newQuestion.format === "text" ? (
              <div className="grid gap-2">
                <Label htmlFor="description" className="text-foreground">
                  Question Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Question description"
                  value={newQuestion.description}
                  onChange={(e) =>
                    setNewQuestion({
                      ...newQuestion,
                      description: e.target.value,
                    })
                  }
                />
              </div>
            ) : (
              <div className="grid gap-2">
                <Label htmlFor="img" className="text-foreground">
                  Question img
                </Label>
                <Input
                  id="img"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setNewQuestion({
                      ...newQuestion,
                      img: e.target.files?.[0] || null,
                    })
                  }
                />
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="question-type" className="text-foreground">
                Question Type
              </Label>
              <Select
                value={newQuestion.question_type}
                onValueChange={async (value) => {
                  setNewQuestion({
                    ...newQuestion,
                    question_type: value,
                  });
                }}
              >
                <SelectTrigger id="question-type">
                  <SelectValue placeholder="Question Type" />
                </SelectTrigger>
                <SelectContent>
                  {QUESTION_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="topics" className="text-foreground">
                Related Topics
              </Label>
              <div className="flex flex-col gap-2">
                <Input
                  id="topics"
                  placeholder="Type a topic and press Enter"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && topicInput.trim()) {
                      e.preventDefault();
                      const newTopic = topicInput.trim();
                      if (!selectedTopics.includes(newTopic)) {
                        setSelectedTopics([...selectedTopics, newTopic]);
                      }
                      setTopicInput("");
                    }
                  }}
                />
                {filteredTopics.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-2 border rounded-md">
                    {filteredTopics.map((topic) => (
                      <button
                        key={topic}
                        className="px-2 py-1 text-sm bg-secondary rounded-md hover:bg-secondary/80"
                        onClick={() => {
                          setSelectedTopics([...selectedTopics, topic]);
                          setTopicInput("");
                        }}
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {selectedTopics.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedTopics.map((topic, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-sm bg-secondary rounded-md flex items-center gap-2"
                    >
                      {topic}
                      <button
                        onClick={() => {
                          setSelectedTopics(
                            selectedTopics.filter((_, i) => i !== index)
                          );
                        }}
                        className="text-xs hover:text-destructive"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="difficulty" className="text-foreground">
                Difficulty Level
              </Label>
              <Select
                value={String(newQuestion.difficulty_level)}
                onValueChange={(value) =>
                  setNewQuestion({
                    ...newQuestion,
                    difficulty_level: parseInt(value),
                  })
                }
              >
                <SelectTrigger id="difficulty">
                  <SelectValue placeholder="Difficulty Level" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3].map((level) => (
                    <SelectItem key={level} value={String(level)}>
                      Level {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {newQuestion.options.map((option, index) => (
              <div key={index} className="grid gap-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor={`option-${index}`} className="text-foreground flex-1">
                    Option {index + 1}
                  </Label>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`correct-${index}`}
                      checked={newQuestion.correct_option.includes(index + 1)}
                      onCheckedChange={(checked) => 
                        handleCorrectOptionChange(index, checked as boolean)
                      }
                    />
                    <Label htmlFor={`correct-${index}`} className="text-sm">
                      Correct
                    </Label>
                    {newQuestion.options.length > 2 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeOption(index)}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <Input
                  id={`option-${index}`}
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...newQuestion.options];
                    newOptions[index] = e.target.value;
                    setNewQuestion({ ...newQuestion, options: newOptions });
                  }}
                />
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addOption}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Option
            </Button>

            <div className="grid gap-2">
              <Label className="text-foreground">
                Selected Correct Answers: {newQuestion.correct_option.length > 0 
                  ? newQuestion.correct_option.map(opt => `Option ${opt}`).join(", ")
                  : "None selected"
                }
              </Label>
            </div>

            <Button onClick={handleAddQuestion} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Question"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddQuestionDialog;
