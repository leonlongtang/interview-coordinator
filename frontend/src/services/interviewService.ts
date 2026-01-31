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
 * Round stage type - the interview stages that can have rounds.
 */
export type RoundStage = "screening" | "technical" | "onsite" | "final";

/**
 * Round outcome type - the result of a single interview round.
 */
export type RoundOutcome = "pending" | "passed" | "failed" | "cancelled";

/**
 * Interview round data structure - tracks individual interview stages.
 */
export interface InterviewRound {
  id: number;
  interview: number;
  stage: RoundStage;
  stage_display: string;
  scheduled_date: string | null;
  completed_date: string | null;
  duration_minutes: number | null;
  notes: string | null;
  outcome: RoundOutcome;
  outcome_display: string;
  created_at: string;
  updated_at: string;
}

/**
 * Data required to create or update an interview round.
 */
export type InterviewRoundFormData = Omit<
  InterviewRound,
  "id" | "stage_display" | "outcome_display" | "created_at" | "updated_at"
>;

/**
 * Interview with rounds - extended interview data including history.
 */
export interface InterviewWithRounds extends Interview {
  rounds: InterviewRound[];
}

/**
 * Service layer for Interview API operations.
 * Separates API logic from components for cleaner architecture.
 */
const interviewService = {
  /**
   * Fetch all interviews from the API.
   * Returns an empty array if the response isn't an array (defensive).
   */
  async getAllInterviews(): Promise<Interview[]> {
    const response = await api.get<Interview[]>("/interviews/");
    // Defensive: DRF might return paginated object { results: [] } or error shape
    const data = response.data;
    if (Array.isArray(data)) {
      return data;
    }
    // Handle paginated response if pagination is ever enabled
    if (data && typeof data === "object" && "results" in data && Array.isArray((data as { results: Interview[] }).results)) {
      return (data as { results: Interview[] }).results;
    }
    console.warn("getAllInterviews: unexpected response shape", data);
    return [];
  },

  /**
   * Fetch dashboard statistics including counts and upcoming interviews.
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get<DashboardStats>("/interviews/dashboard-stats/");
    return response.data;
  },

  /**
   * Fetch a single interview by ID (includes rounds history).
   */
  async getInterview(id: number): Promise<InterviewWithRounds> {
    const response = await api.get<InterviewWithRounds>(`/interviews/${id}/`);
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

  // ==================== Interview Rounds ====================

  /**
   * Fetch all rounds for an interview.
   */
  async getRounds(interviewId: number): Promise<InterviewRound[]> {
    const response = await api.get<InterviewRound[]>(`/interviews/rounds/?interview=${interviewId}`);
    return response.data;
  },

  /**
   * Create a new interview round.
   */
  async createRound(data: InterviewRoundFormData): Promise<InterviewRound> {
    const response = await api.post<InterviewRound>("/interviews/rounds/", data);
    return response.data;
  },

  /**
   * Update an existing interview round.
   */
  async updateRound(id: number, data: Partial<InterviewRoundFormData>): Promise<InterviewRound> {
    const response = await api.patch<InterviewRound>(`/interviews/rounds/${id}/`, data);
    return response.data;
  },

  /**
   * Delete an interview round.
   */
  async deleteRound(id: number): Promise<void> {
    await api.delete(`/interviews/rounds/${id}/`);
  },
};

export default interviewService;

