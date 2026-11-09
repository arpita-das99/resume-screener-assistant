export interface AnalysisDTO {
  id: string;
  candidateName: string;
  matchScore: number;
  matchingSkills: string[];
  skillGaps: string[];
  interviewQuestions: string[];
  createdAt: string;
}

interface AnalysisDocLike {
  _id: { toString(): string };
  candidateName: string;
  matchScore: number;
  matchingSkills: string[];
  skillGaps: string[];
  interviewQuestions: string[];
  createdAt: Date;
}

export function toDTO(doc: AnalysisDocLike): AnalysisDTO {
  return {
    id: doc._id.toString(),
    candidateName: doc.candidateName,
    matchScore: doc.matchScore,
    matchingSkills: doc.matchingSkills,
    skillGaps: doc.skillGaps,
    interviewQuestions: doc.interviewQuestions,
    createdAt: doc.createdAt.toISOString(),
  };
}
