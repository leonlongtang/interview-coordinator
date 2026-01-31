import api from "./api";

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
 * Interview type - the kind of interview event.
 */
export type InterviewType =
  | "phone_screening"
  | "recruiter_call"
  | "technical"
  | "coding"
  | "system_design"
  | "behavioral"
  | "hiring_manager"
  | "team_fit"
  | "onsite"
  | "final"
  | "hr_final"
  | "offer_call";

/**
 * Interview location type.
 */
export type InterviewLocation = "remote" | "onsite" | "hybrid";

/**
 * Interview outcome type.
 */
export type InterviewOutcome = "pending" | "passed" | "failed" | "cancelled";

/**
 * Job Application data structure - represents the entire job application journey.
 */
export interface JobApplication {
  id: number;
  company_name: string;
  position: string;
  application_date: string | null;
  application_status: ApplicationStatus;
  notes: string | null;
  job_url: string | null;
  salary_min: number | null;
  salary_max: number | null;
  created_at: string;
  updated_at: string;
  // Computed fields from backend
  days_in_pipeline: number | null;
  current_stage: string | null;
  interview_count: number;
  next_interview_date: string | null;
}

/**
 * Data required to create or update a job application.
 */
export type JobApplicationFormData = Omit<
  JobApplication,
  | "id"
  | "created_at"
  | "updated_at"
  | "days_in_pipeline"
  | "current_stage"
  | "interview_count"
  | "next_interview_date"
>;

/**
 * Interview data structure - represents a single interview event.
 */
export interface Interview {
  id: number;
  job_application: number;
  interview_type: InterviewType;
  interview_type_display: string;
  scheduled_date: string | null;
  completed_date: string | null;
  duration_minutes: number | null;
  location: InterviewLocation;
  location_display: string;
  interviewer_name: string | null;
  interviewer_title: string | null;
  feedback: string | null;
  outcome: InterviewOutcome;
  outcome_display: string;
  reminder_sent: boolean;
  is_upcoming: boolean;
  is_past: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Data required to create or update an interview.
 */
export type InterviewFormData = Omit<
  Interview,
  | "id"
  | "interview_type_display"
  | "location_display"
  | "outcome_display"
  | "is_upcoming"
  | "is_past"
  | "created_at"
  | "updated_at"
>;

/**
 * Job application with interviews - extended data including interview history.
 */
export interface JobApplicationWithInterviews extends JobApplication {
  interviews: Interview[];
}

/**
 * Dashboard stats returned from the API.
 */
export interface DashboardStats {
  total: number;
  active: number;
  offers: number;
  success_rate: number;
  total_interviews: number;
  upcoming_count: number;
  upcoming_interviews: UpcomingInterview[];
  awaiting_count: number;
  awaiting_response: AwaitingApplication[];
  needs_review_count: number;
  needs_review: NeedsReviewInterview[];
  by_application_status: Record<ApplicationStatus, number>;
  by_interview_type: Record<InterviewType, number>;
}

/**
 * Upcoming interview for dashboard widget.
 */
export interface UpcomingInterview {
  id: number;
  application_id: number;
  company_name: string;
  position: string;
  interview_type: InterviewType;
  interview_type_display: string;
  scheduled_date: string;
  location: InterviewLocation;
}

/**
 * Application awaiting response (no interviews yet).
 */
export interface AwaitingApplication {
  id: number;
  company_name: string;
  position: string;
  application_date: string | null;
  days_waiting: number | null;
}

/**
 * Interview needing review (past but not updated).
 */
export interface NeedsReviewInterview {
  id: number;
  application_id: number;
  company_name: string;
  position: string;
  interview_type: InterviewType;
  interview_type_display: string;
  scheduled_date: string;
  days_ago: number;
}

/**
 * Service layer for Job Application and Interview API operations.
 */
const applicationService = {
  // ==================== Job Applications ====================

  /**
   * Fetch all job applications from the API.
   */
  async getAllApplications(): Promise<JobApplication[]> {
    const response = await api.get<JobApplication[]>("/applications/");
    const data = response.data;
    if (Array.isArray(data)) {
      return data;
    }
    if (
      data &&
      typeof data === "object" &&
      "results" in data &&
      Array.isArray((data as { results: JobApplication[] }).results)
    ) {
      return (data as { results: JobApplication[] }).results;
    }
    console.warn("getAllApplications: unexpected response shape", data);
    return [];
  },

  /**
   * Fetch dashboard statistics.
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get<DashboardStats>("/applications/dashboard-stats/");
    return response.data;
  },

  /**
   * Fetch a single job application by ID (includes interviews).
   */
  async getApplication(id: number): Promise<JobApplicationWithInterviews> {
    const response = await api.get<JobApplicationWithInterviews>(`/applications/${id}/`);
    return response.data;
  },

  /**
   * Create a new job application.
   */
  async createApplication(data: JobApplicationFormData): Promise<JobApplication> {
    const response = await api.post<JobApplication>("/applications/", data);
    return response.data;
  },

  /**
   * Update an existing job application.
   */
  async updateApplication(
    id: number,
    data: JobApplicationFormData
  ): Promise<JobApplication> {
    const response = await api.put<JobApplication>(`/applications/${id}/`, data);
    return response.data;
  },

  /**
   * Delete a job application.
   */
  async deleteApplication(id: number): Promise<void> {
    await api.delete(`/applications/${id}/`);
  },

  // ==================== Interviews ====================

  /**
   * Fetch all interviews for an application.
   */
  async getInterviews(applicationId: number): Promise<Interview[]> {
    const response = await api.get<Interview[]>(
      `/applications/interviews/?job_application=${applicationId}`
    );
    return response.data;
  },

  /**
   * Create a new interview.
   */
  async createInterview(data: InterviewFormData): Promise<Interview> {
    const response = await api.post<Interview>("/applications/interviews/", data);
    return response.data;
  },

  /**
   * Update an existing interview.
   */
  async updateInterview(
    id: number,
    data: Partial<InterviewFormData>
  ): Promise<Interview> {
    const response = await api.patch<Interview>(`/applications/interviews/${id}/`, data);
    return response.data;
  },

  /**
   * Delete an interview.
   */
  async deleteInterview(id: number): Promise<void> {
    await api.delete(`/applications/interviews/${id}/`);
  },
};

export default applicationService;
