export interface PlacementExperience {
  id: string;
  studentName: string;
  studentRegNo: string;
  studentTrade: string;
  studentBatch: string;
  companyName: string;
  companyYear: number;
  interviewQuestions: {
    technical: string[];
    hr: string[];
  };
  projectDetails: {
    title: string;
    description: string;
    technologies: string[];
  };
  additionalTips: string;
  createdAt: string;
  updatedAt: string;
  isAnonymous: boolean;
}

export interface Company {
  id: string;
  name: string;
  experiences: PlacementExperience[];
}


export interface Year {
  id: string;
  year: number;
  companies: Company[];
}

export interface ExperienceFilters {
  year?: number;
  company?: string;
  search?: string;
}

export interface ExperienceUploadData {
  companyName: string;
  companyYear: number;
  studentTrade: string;
  interviewQuestions: {
    technical: string[];
    hr: string[];
  };
  projectDetails: {
    title: string;
    description: string;
    technologies: string[];
  };
  additionalTips: string;
  isAnonymous: boolean;
}

