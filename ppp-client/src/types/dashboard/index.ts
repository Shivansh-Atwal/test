interface TopicAnalysis {
    topic: string;
    total_questions: string;
    total_solved: string;
    correct_answers: string;
    incorrect_answers: string;
    accuracy: string;
  }
  
  interface RecentTest {
    test_name: string;
    test_timestamp: string;
    score: number;
    total_score: number;
  }
  
  interface DashboardData {
    userDetails: {
      regno: string;
      name: string;
      avatar: string;
      trade: string | null;
      batch: string | null;
    };
    testStats: {
      total_tests_taken: string;
      average_score: string;
    };
    lastTest: {
      test_id: number;
      test_name: string;
      test_timestamp: string;
      duration: number;
      score: number;
      total_score: number;
    };
    recentTests: RecentTest[];
    topicAnalysis: TopicAnalysis[];
  }

  export type { TopicAnalysis, RecentTest, DashboardData };