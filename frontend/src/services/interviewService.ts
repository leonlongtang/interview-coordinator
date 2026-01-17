import api from "./api";

/**
 * Interview stage type - where you are in the interview process.
 */
export type InterviewStage =
  | "applied"
  | "screening"
  | "technical"
  | "onsite"
  | "final"
  | "completed";

/**
 * Application status type - the outcome/decision of the application.
 */
export type ApplicationStatus =
  | "in_progress"
  | "offer"
  | "accepted"
  | "rejected"
  | "declined"
  | "withdrawn";

/**
 * @deprecated Use InterviewStage and ApplicationStatus instead.
 * Kept for backwards compatibility during transition.
 */
export type PipelineStage =
  | "applied"
  | "screening"
  | "technical"
  | "onsite"
  | "final"
  | "offer"
  | "rejected"
  | "accepted"
  | "declined";

/**
 * Interview data structure matching our Django model.
 */
export interface Interview {
  id: number;
  company_name: string;
  position: string;
  // Optional - null when application submitted but no interview scheduled yet
  interview_date: string | null;
  // These fields are optional until an interview is scheduled
  interview_type: "phone" | "technical" | "behavioral" | "final" | null;
  status: "scheduled" | "completed" | "cancelled" | null;
  location: "onsite" | "remote" | "hybrid" | null;
  // New split fields
  interview_stage: InterviewStage;
  application_status: ApplicationStatus;
  // Legacy field (kept for backwards compatibility)
  pipeline_stage: PipelineStage;
  application_date?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  // Computed fields from backend
  days_in_pipeline?: number | null;
  is_upcoming?: boolean;
}

/**
 * Data required to create or update an interview.
 * Omits auto-generated and computed fields.
 */
export type InterviewFormData = Omit<
  Interview,
  "id" | "created_at" | "updated_at" | "days_in_pipeline" | "is_upcoming"
>;

/**
 * Dashboard stats returned from the API.
 * Provides summary metrics and upcoming interviews for the dashboard.
 */
export interface DashboardStats {
  total: number;
  active: number;
  offers: number;
  success_rate: number;
  upcoming_count: number;
  upcoming_interviews: UpcomingInterview[];
  awaiting_count: number;
  awaiting_response: AwaitingInterview[];
  needs_review_count: number;
  needs_review: NeedsReviewInterview[];
  by_interview_stage: Record<InterviewStage, number>;
  by_application_status: Record<ApplicationStatus, number>;
}

/**
 * Simplified interview data for the upcoming interviews widget.
 */
export interface UpcomingInterview {
  id: number;
  company_name: string;
  position: string;
  interview_date: string;
  interview_type: string;
  location: string;
}

/**
 * Interview data for applications awaiting response (no interview scheduled yet).
 */
export interface AwaitingInterview {
  id: number;
  company_name: string;
  position: string;
  application_date: string | null;
  interview_stage: string;
  days_waiting: number | null;
}

/**
 * Interview data for past interviews that need status update/review.
 */
export interface NeedsReviewInterview {
  id: number;
  company_name: string;
  position: string;
  interview_date: string;
  interview_type: string | null;
  interview_stage: string;
  days_ago: number;
}

/**
 * Service layer for Interview API operations.
 * Separates API logic from components for cleaner architecture.
 */
const interviewService = {
  /**
   * Fetch all interviews from the API.
   */
  async getAllInterviews(): Promise<Interview[]> {
    const response = await api.get<Interview[]>("/interviews/");
    return response.data;
  },

  /**
   * Fetch dashboard statistics including counts and upcoming interviews.
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get<DashboardStats>("/interviews/dashboard-stats/");
    return response.data;
  },

  /**
   * Fetch a single interview by ID.
   */
  async getInterview(id: number): Promise<Interview> {
    const response = await api.get<Interview>(`/interviews/${id}/`);
    return response.data;
  },

  /**
   * Create a new interview.
   */
  async createInterview(data: InterviewFormData): Promise<Interview> {
    const response = await api.post<Interview>("/interviews/", data);
    return response.data;
  },

  /**
   * Update an existing interview.
   */
  async updateInterview(id: number, data: InterviewFormData): Promise<Interview> {
    const response = await api.put<Interview>(`/interviews/${id}/`, data);
    return response.data;
  },

  /**
   * Delete an interview.
   */
  async deleteInterview(id: number): Promise<void> {
    await api.delete(`/interviews/${id}/`);
  },
};

export default interviewService;

