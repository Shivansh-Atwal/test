import React from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/shadcn/ui/select";
import { Input } from "@/shadcn/ui/input";
import { Label } from "@/shadcn/ui/label";
import { QuestionFilters } from "@/types/Question";
import { QUESTION_TYPES } from '@/constants';

interface FiltersProps {
    filters: QuestionFilters;
    setFilters: (filters: QuestionFilters) => void;
  }

const  Filters: React.FC<FiltersProps> = ({ filters, setFilters }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="grid gap-2 w-full sm:w-auto">
          <Label htmlFor="filter-type" className="text-foreground">
            Question Type
          </Label>
          <Select
            value={filters.question_type}
            onValueChange={(value) =>
              setFilters({ ...filters, question_type: value })
            }
          >
            <SelectTrigger id="filter-type" className="w-full sm:w-[200px]">
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

        <div className="grid gap-2 w-full sm:w-auto">
          <Label htmlFor="filter-difficulty" className="text-foreground">
            Difficulty
          </Label>
          <Select
            value={
              filters.difficulty_level === 0
                ? undefined
                : filters.difficulty_level.toString()
            }
            onValueChange={(value) =>
              setFilters({ ...filters, difficulty_level: +value })
            }
          >
            <SelectTrigger
              id="filter-difficulty"
              className="w-full sm:w-[200px]"
            >
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

        <div className="grid gap-2 w-full sm:w-auto">
          <Label htmlFor="filter-topic" className="text-foreground">
            Topic
          </Label>
          <Input
            id="filter-topic"
            placeholder="Search by topic"
            value={filters.topic_tags?.join(", ") || ""}
            onChange={(e) =>{
              if(e.target.value.trim() === "") setFilters({ ...filters, topic_tags: [] })
              setFilters({ ...filters, topic_tags: e.target.value.split(",") })}
            }
            className="w-full sm:w-[200px]"
          />
        </div>

        <div className="grid gap-2 w-full sm:w-auto">
          <Label htmlFor="filter-sort" className="text-foreground">
            Sort
          </Label>
          <Select
            value={filters.sort}
            onValueChange={(value) =>
              setFilters({ ...filters, sort: value as "ASC" | "DESC" })
            }
          >
            <SelectTrigger
              id="filter-difficulty"
              className="w-full sm:w-[200px]"
            >
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              {[
                { title: "New", value: "DESC" },
                { title: "Old", value: "ASC" },
              ].map((val) => (
                <SelectItem key={val.title} value={val.value}>
                  {val.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

  )
}

export default Filters
