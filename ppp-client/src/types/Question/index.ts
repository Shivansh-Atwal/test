
interface Question {
    id?: number;
    description: string;
    topic_tags: string[] | null;
    question_type:  string;
    last_used?: string;
    difficulty_level: number;
    options: string[];
    correct_option: number;
    format: string;
  }

  interface QuestionFilters {
    topic_tags: string[] | null
    question_type: string,
    difficulty_level: number,
    sort: 'ASC' | 'DESC'
}

  export type {Question, QuestionFilters};