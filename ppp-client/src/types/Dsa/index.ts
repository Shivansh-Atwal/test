interface DsaSheet {
    id: number;
    title: string;
    description: string;
    link: string;
    topic_tags: string[] | null;
    difficulty_level: number;
    format: string;
  }

export type {DsaSheet};  