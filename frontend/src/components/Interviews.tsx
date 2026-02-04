import { useState } from "react";
import type { Interview, InterviewType, InterviewOutcome, InterviewLocation } from "../types";
import { INTERVIEW_TYPE_OPTIONS, INTERVIEW_OUTCOME_OPTIONS, INTERVIEW_LOCATION_OPTIONS } from "../types";
import { Button, Input, Textarea, Select } from "./ui";
import applicationService from "../services/applicationService";

/**
 * Component to display and manage interviews for a job application.
 * Shows a timeline of all interviews with their outcomes and feedback.
 * Allows adding new interviews and updating existing ones.
 */

interface InterviewsProps {
  applicationId: number;
  interviews: Interview[];
  onInterviewsChange: (interviews: Interview[]) => void;
}

// Outcome badge colors
const OUTCOME_COLORS: Record<InterviewOutcome, string> = {
  pending: "bg-gray-100 text-gray-700",
  passed: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  cancelled: "bg-orange-100 text-orange-700",
};

export default function Interviews({
  applicationId,
  interviews,
  onInterviewsChange,
}: InterviewsProps) {
  const [isAddingInterview, setIsAddingInterview] = useState(false);
  const [editingInterviewId, setEditingInterviewId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<{
    interview_type: InterviewType;
    scheduled_date: string;
    completed_date: string;
    duration_minutes: string;
    location: InterviewLocation;
    interviewer_name: string;
    interviewer_title: string;
    feedback: string;
    outcome: InterviewOutcome;
  }>({
    interview_type: "phone_screening",
    scheduled_date: "",
    completed_date: "",
    duration_minutes: "",
    location: "remote",
    interviewer_name: "",
    interviewer_title: "",
    feedback: "",
    outcome: "pending",
  });

  const resetForm = () => {
    setFormData({
      interview_type: "phone_screening",
      scheduled_date: "",
      completed_date: "",
      duration_minutes: "",
      location: "remote",
      interviewer_name: "",
      interviewer_title: "",
      feedback: "",
      outcome: "pending",
    });
    setIsAddingInterview(false);
    setEditingInterviewId(null);
    setError(null);
  };

  const handleEditInterview = (interview: Interview) => {
    setFormData({
      interview_type: interview.interview_type,
      scheduled_date: interview.scheduled_date?.slice(0, 16) || "",
      completed_date: interview.completed_date?.slice(0, 16) || "",
      duration_minutes: interview.duration_minutes?.toString() || "",
      location: interview.location,
      interviewer_name: interview.interviewer_name || "",
      interviewer_title: interview.interviewer_title || "",
      feedback: interview.feedback || "",
      outcome: interview.outcome,
    });
    setEditingInterviewId(interview.id);
    setIsAddingInterview(false);
  };

  const handleSaveInterview = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = {
        job_application: applicationId,
        interview_type: formData.interview_type,
        // Convert datetime-local format to ISO string for the API
        scheduled_date: formData.scheduled_date 
          ? new Date(formData.scheduled_date).toISOString() 
          : null,
        completed_date: formData.completed_date 
          ? new Date(formData.completed_date).toISOString() 
          : null,
        duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
        location: formData.location,
        interviewer_name: formData.interviewer_name || null,
        interviewer_title: formData.interviewer_title || null,
        feedback: formData.feedback || null,
        outcome: formData.outcome,
        reminder_sent: false,
      };

      if (editingInterviewId) {
        const updated = await applicationService.updateInterview(editingInterviewId, data);
        onInterviewsChange(
          interviews.map((i) => (i.id === editingInterviewId ? updated : i))
        );
      } else {
        const created = await applicationService.createInterview(data);
        onInterviewsChange([...interviews, created]);
      }
      resetForm();
    } catch (err) {
      setError("Failed to save interview. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteInterview = async (interviewId: number) => {
    if (!confirm("Are you sure you want to delete this interview?")) return;

    setIsLoading(true);
    try {
      await applicationService.deleteInterview(interviewId);
      onInterviewsChange(interviews.filter((i) => i.id !== interviewId));
    } catch (err) {
      setError("Failed to delete interview. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not scheduled";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <span>Interviews</span>
        </h3>
        {!isAddingInterview && !editingInterviewId && (
          <Button
            variant="secondary"
            onClick={() => setIsAddingInterview(true)}
            className="text-sm"
          >
            + Add Interview
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Interviews Timeline */}
      {interviews.length === 0 && !isAddingInterview ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No interviews scheduled yet.</p>
          <button
            onClick={() => setIsAddingInterview(true)}
            className="mt-2 text-indigo-600 hover:text-indigo-800 font-medium text-sm"
          >
            Schedule your first interview
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {interviews.map((interview, index) => (
            <div
              key={interview.id}
              className={`relative pl-8 pb-4 ${
                index < interviews.length - 1 ? "border-l-2 border-gray-200 ml-3" : "ml-3"
              }`}
            >
              {/* Timeline dot */}
              <div
                className={`absolute left-0 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  interview.outcome === "passed"
                    ? "bg-green-100 text-green-600"
                    : interview.outcome === "failed"
                    ? "bg-red-100 text-red-600"
                    : interview.outcome === "cancelled"
                    ? "bg-orange-100 text-orange-600"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {interview.interview_type.charAt(0).toUpperCase()}
              </div>

              {editingInterviewId === interview.id ? (
                <div className="bg-white border border-indigo-200 rounded-lg p-4 shadow-sm">
                  <InterviewForm
                    formData={formData}
                    setFormData={setFormData}
                    onSave={handleSaveInterview}
                    onCancel={resetForm}
                    isLoading={isLoading}
                    isEditing
                  />
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {interview.interview_type_display}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            OUTCOME_COLORS[interview.outcome]
                          }`}
                        >
                          {interview.outcome_display}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDate(interview.scheduled_date)}
                        {interview.duration_minutes && (
                          <span className="ml-2">- {interview.duration_minutes} min</span>
                        )}
                      </p>
                      {interview.interviewer_name && (
                        <p className="text-sm text-gray-500">
                          with {interview.interviewer_name}
                          {interview.interviewer_title && ` (${interview.interviewer_title})`}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditInterview(interview)}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                        title="Edit"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteInterview(interview.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        Del
                      </button>
                    </div>
                  </div>
                  {interview.feedback && (
                    <p className="mt-2 text-sm text-gray-600 bg-gray-50 rounded p-2">
                      {interview.feedback}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add new interview form */}
      {isAddingInterview && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Add Interview</h4>
          <InterviewForm
            formData={formData}
            setFormData={setFormData}
            onSave={handleSaveInterview}
            onCancel={resetForm}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  );
}

// Extracted form component
interface InterviewFormProps {
  formData: {
    interview_type: InterviewType;
    scheduled_date: string;
    completed_date: string;
    duration_minutes: string;
    location: InterviewLocation;
    interviewer_name: string;
    interviewer_title: string;
    feedback: string;
    outcome: InterviewOutcome;
  };
  setFormData: React.Dispatch<React.SetStateAction<InterviewFormProps["formData"]>>;
  onSave: () => void;
  onCancel: () => void;
  isLoading: boolean;
  isEditing?: boolean;
}

function InterviewForm({
  formData,
  setFormData,
  onSave,
  onCancel,
  isLoading,
  isEditing = false,
}: InterviewFormProps) {
  const typeOptions = INTERVIEW_TYPE_OPTIONS.map(({ value, label }) => ({ value, label }));
  const outcomeOptions = INTERVIEW_OUTCOME_OPTIONS.map(({ value, label }) => ({ value, label }));
  const locationOptions = INTERVIEW_LOCATION_OPTIONS.map(({ value, label }) => ({ value, label }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Select
          label="Interview Type"
          value={formData.interview_type}
          onChange={(e) =>
            setFormData({ ...formData, interview_type: e.target.value as InterviewType })
          }
          options={typeOptions}
        />
        <Select
          label="Location"
          value={formData.location}
          onChange={(e) =>
            setFormData({ ...formData, location: e.target.value as InterviewLocation })
          }
          options={locationOptions}
        />
        <Select
          label="Outcome"
          value={formData.outcome}
          onChange={(e) =>
            setFormData({ ...formData, outcome: e.target.value as InterviewOutcome })
          }
          options={outcomeOptions}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Scheduled Date"
          type="datetime-local"
          value={formData.scheduled_date}
          onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
        />
        <Input
          label="Completed Date"
          type="datetime-local"
          value={formData.completed_date}
          onChange={(e) => setFormData({ ...formData, completed_date: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label="Duration (minutes)"
          type="number"
          value={formData.duration_minutes}
          onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
          placeholder="e.g., 45"
        />
        <Input
          label="Interviewer Name"
          value={formData.interviewer_name}
          onChange={(e) => setFormData({ ...formData, interviewer_name: e.target.value })}
          placeholder="e.g., John Smith"
        />
        <Input
          label="Interviewer Title"
          value={formData.interviewer_title}
          onChange={(e) => setFormData({ ...formData, interviewer_title: e.target.value })}
          placeholder="e.g., Engineering Manager"
        />
      </div>

      <Textarea
        label="Feedback / Notes"
        value={formData.feedback}
        onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
        placeholder="How did it go? What questions were asked? Any feedback received?"
        rows={3}
      />

      <div className="flex gap-2 justify-end">
        <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={onSave} isLoading={isLoading}>
          {isEditing ? "Update Interview" : "Add Interview"}
        </Button>
      </div>
    </div>
  );
}
