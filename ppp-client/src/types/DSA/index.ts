export interface DSAContest {
  id: string;
  platform: 'leetcode' | 'codechef' | 'codeforces' | 'hackerrank';
  title: string;
  link: string;
  startTime: string;
  duration: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  status: 'upcoming' | 'ongoing' | 'completed';
}