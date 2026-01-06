import { useState, type FormEvent } from "react";
import { Button, Input, Select, Textarea } from "./ui";
import type { InterviewFormData } from "../types";
import {
  INTERVIEW_TYPE_OPTIONS,
  STATUS_OPTIONS,
  LOCATION_OPTIONS,
} from "../types";

/**
 * Form component for creating/editing interviews.
 * Handles validation and submission with loading states.
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
  const [formData, setFormData] = useState<InterviewFormData>({
    company_name: initialData?.company_name || "",
    position: initialData?.position || "",
    interview_date: initialData?.interview_date || "",
    interview_type: initialData?.interview_type || "phone",
    status: initialData?.status || "scheduled",
    location: initialData?.location || "remote",
    notes: initialData?.notes || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Update a single field
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when field is modified
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validate form before submission
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.company_name.trim()) {
      newErrors.company_name = "Company name is required";
    }
    if (!formData.position.trim()) {
      newErrors.position = "Position is required";
    }
    if (!formData.interview_date) {
      newErrors.interview_date = "Interview date is required";
    } else if (!isEditing && new Date(formData.interview_date) < new Date()) {
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
      // Convert datetime-local format to ISO string for API
      const submitData = {
        ...formData,
        interview_date: new Date(formData.interview_date).toISOString(),
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

      {/* Date & Time */}
      <Input
        label="Interview Date & Time"
        name="interview_date"
        type="datetime-local"
        value={formData.interview_date}
        onChange={handleChange}
        error={errors.interview_date}
        required
      />

      {/* Type, Status, Location */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select
          label="Interview Type"
          name="interview_type"
          value={formData.interview_type}
          onChange={handleChange}
          options={INTERVIEW_TYPE_OPTIONS}
          required
        />
        <Select
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          options={STATUS_OPTIONS}
          required
        />
        <Select
          label="Location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          options={LOCATION_OPTIONS}
          required
        />
      </div>

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

