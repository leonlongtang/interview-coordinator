import { useState, type FormEvent } from "react";
import { Button, Input, Select, Textarea } from "./ui";
import type { InterviewFormData } from "../types";
import {
  INTERVIEW_TYPE_OPTIONS,
  STATUS_OPTIONS,
  LOCATION_OPTIONS,
  INTERVIEW_STAGE_OPTIONS,
  APPLICATION_STATUS_OPTIONS,
} from "../types";
import { sanitizeInput, containsScript } from "../utils/security";

/**
 * Form component for creating/editing interviews.
 * Handles validation and submission with loading states.
 * Uses split fields: interview_stage (where in process) and application_status (outcome).
 */

interface InterviewFormProps {
  initialData?: Partial<InterviewFormData>;
  onSubmit: (data: InterviewFormData) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
}

export default function InterviewForm({
  initialData,
  onSubmit,
  onCancel,
  isEditing = false,
}: InterviewFormProps) {
  // Form state - initialize with provided data or defaults
  // interview_type, status, location are null until interview is scheduled
  const [formData, setFormData] = useState<InterviewFormData>({
    company_name: initialData?.company_name || "",
    position: initialData?.position || "",
    interview_date: initialData?.interview_date || "",
    interview_type: initialData?.interview_type || null,
    status: initialData?.status || null,
    location: initialData?.location || null,
    // New split fields
    interview_stage: initialData?.interview_stage || "applied",
    application_status: initialData?.application_status || "in_progress",
    // Legacy field (kept for backwards compatibility)
    pipeline_stage: initialData?.pipeline_stage || "applied",
    application_date: initialData?.application_date || "",
    notes: initialData?.notes || "",
  });

  // Check if interview date is set - determines whether to show interview-specific fields
  const hasInterviewDate = Boolean(formData.interview_date);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Update a single field
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    // When interview date is set, auto-populate default values for interview fields
    if (name === "interview_date" && value && !formData.interview_date) {
      setFormData((prev) => ({
        ...prev,
        interview_date: value,
        interview_type: prev.interview_type || "phone",
        status: prev.status || "scheduled",
        location: prev.location || "remote",
      }));
    } else if (name === "interview_date" && !value) {
      // When interview date is cleared, also clear interview-specific fields
      setFormData((prev) => ({
        ...prev,
        interview_date: "",
        interview_type: null,
        status: null,
        location: null,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validate form before submission
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Sanitize and validate company name
    const sanitizedCompany = sanitizeInput(formData.company_name, 200);
    if (!sanitizedCompany.trim()) {
      newErrors.company_name = "Company name is required";
    } else if (containsScript(sanitizedCompany)) {
      newErrors.company_name = "Invalid characters in company name";
    }

    // Sanitize and validate position
    const sanitizedPosition = sanitizeInput(formData.position, 200);
    if (!sanitizedPosition.trim()) {
      newErrors.position = "Position is required";
    } else if (containsScript(sanitizedPosition)) {
      newErrors.position = "Invalid characters in position";
    }

    // Validate notes if provided
    if (formData.notes && containsScript(formData.notes)) {
      newErrors.notes = "Invalid content in notes";
    }

    // Interview date is optional - only validate if provided
    if (formData.interview_date && !isEditing && new Date(formData.interview_date) < new Date()) {
      newErrors.interview_date = "Interview date cannot be in the past";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) return;

    setIsLoading(true);
    try {
      // Sanitize all text inputs before submission
      const submitData = {
        ...formData,
        // Sanitize text fields
        company_name: sanitizeInput(formData.company_name, 200),
        position: sanitizeInput(formData.position, 200),
        notes: formData.notes ? sanitizeInput(formData.notes, 5000) : "",
        // Convert datetime-local format to ISO string for API, or null if not set
        interview_date: formData.interview_date 
          ? new Date(formData.interview_date).toISOString() 
          : null,
        // Convert empty string to null for optional fields
        application_date: formData.application_date || null,
        interview_type: formData.interview_type || null,
        status: formData.status || null,
        location: formData.location || null,
      };
      await onSubmit(submitData);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to save interview"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Format options for Select components
  const interviewStageOptions = INTERVIEW_STAGE_OPTIONS.map(({ value, label }) => ({
    value,
    label,
  }));

  const applicationStatusOptions = APPLICATION_STATUS_OPTIONS.map(({ value, label }) => ({
    value,
    label,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Banner */}
      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {submitError}
        </div>
      )}

      {/* Company & Position */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Company Name"
          name="company_name"
          value={formData.company_name}
          onChange={handleChange}
          error={errors.company_name}
          required
          placeholder="e.g., Google"
        />
        <Input
          label="Position"
          name="position"
          value={formData.position}
          onChange={handleChange}
          error={errors.position}
          required
          placeholder="e.g., Software Engineer"
        />
      </div>

      {/* Interview Stage & Application Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Interview Stage"
          name="interview_stage"
          value={formData.interview_stage}
          onChange={handleChange}
          options={interviewStageOptions}
          required
        />
        <Select
          label="Application Status"
          name="application_status"
          value={formData.application_status}
          onChange={handleChange}
          options={applicationStatusOptions}
          required
        />
      </div>

      {/* Application Date */}
      <Input
        label="Application Date (optional)"
        name="application_date"
        type="date"
        value={formData.application_date || ""}
        onChange={handleChange}
        hint="When you submitted the application"
      />

      {/* Interview Date & Time - optional for applications awaiting response */}
      <Input
        label="Interview Date & Time (optional)"
        name="interview_date"
        type="datetime-local"
        value={formData.interview_date || ""}
        onChange={handleChange}
        error={errors.interview_date}
        hint="Leave blank if no interview scheduled yet"
      />

      {/* Interview-specific fields - only shown when interview date is set */}
      {hasInterviewDate && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
          <Select
            label="Interview Type"
            name="interview_type"
            value={formData.interview_type || "phone"}
            onChange={handleChange}
            options={INTERVIEW_TYPE_OPTIONS}
          />
          <Select
            label="Appointment Status"
            name="status"
            value={formData.status || "scheduled"}
            onChange={handleChange}
            options={STATUS_OPTIONS}
          />
          <Select
            label="Location"
            name="location"
            value={formData.location || "remote"}
            onChange={handleChange}
            options={LOCATION_OPTIONS}
          />
        </div>
      )}

      {/* Notes */}
      <Textarea
        label="Notes (optional)"
        name="notes"
        value={formData.notes || ""}
        onChange={handleChange}
        placeholder="Add any preparation notes, interviewer names, or other details..."
        rows={4}
      />

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button type="submit" isLoading={isLoading}>
          {isEditing ? "Update Interview" : "Create Interview"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

