import api from "./api";

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
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Data required to create or update an interview.
 * Omits auto-generated fields (id, created_at, updated_at).
 */
export type InterviewFormData = Omit<Interview, "id" | "created_at" | "updated_at">;

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

