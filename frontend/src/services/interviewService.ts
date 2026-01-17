import api from "./api";

/**
 * Pipeline stage type - represents where the candidate is in the hiring process.
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
  interview_date: string;
  interview_type: "phone" | "technical" | "behavioral" | "final";
  status: "scheduled" | "completed" | "cancelled";
  location: "onsite" | "remote" | "hybrid";
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
  by_stage: Record<PipelineStage, number>;
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

