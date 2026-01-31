import { useState, type FormEvent } from "react";
import { Button, Input, Select, Textarea } from "./ui";
import type { JobApplicationFormData } from "../types";
import { APPLICATION_STATUS_OPTIONS } from "../types";
import { sanitizeInput, containsScript } from "../utils/security";

/**
 * Form component for creating/editing job applications.
 * 
 * This form collects the core application details like company, position,
 * and status. Individual interviews are managed separately.
 */

interface ApplicationFormProps {
  initialData?: Partial<JobApplicationFormData>;
  onSubmit: (data: JobApplicationFormData) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
}

export default function ApplicationForm({
  initialData,
  onSubmit,
  onCancel,
  isEditing = false,
}: ApplicationFormProps) {
  const [formData, setFormData] = useState<JobApplicationFormData>({
    company_name: initialData?.company_name || "",
    position: initialData?.position || "",
    application_date: initialData?.application_date || "",
    application_status: initialData?.application_status || "in_progress",
    notes: initialData?.notes || "",
    job_url: initialData?.job_url || "",
    salary_min: initialData?.salary_min || null,
    salary_max: initialData?.salary_max || null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    // Handle numeric fields
    if (name === "salary_min" || name === "salary_max") {
      const numValue = value ? parseInt(value, 10) : null;
      setFormData((prev) => ({ ...prev, [name]: numValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const sanitizedCompany = sanitizeInput(formData.company_name, 200);
    if (!sanitizedCompany.trim()) {
      newErrors.company_name = "Company name is required";
    } else if (containsScript(sanitizedCompany)) {
      newErrors.company_name = "Invalid characters in company name";
    }

    const sanitizedPosition = sanitizeInput(formData.position, 200);
    if (!sanitizedPosition.trim()) {
      newErrors.position = "Position is required";
    } else if (containsScript(sanitizedPosition)) {
      newErrors.position = "Invalid characters in position";
    }

    if (formData.notes && containsScript(formData.notes)) {
      newErrors.notes = "Invalid content in notes";
    }

    if (formData.salary_min && formData.salary_max && formData.salary_min > formData.salary_max) {
      newErrors.salary_min = "Minimum salary cannot be greater than maximum";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) return;

    setIsLoading(true);
    try {
      const submitData = {
        ...formData,
        company_name: sanitizeInput(formData.company_name, 200),
        position: sanitizeInput(formData.position, 200),
        notes: formData.notes ? sanitizeInput(formData.notes, 5000) : null,
        job_url: formData.job_url || null,
        application_date: formData.application_date || null,
      };
      await onSubmit(submitData);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to save application"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const statusOptions = APPLICATION_STATUS_OPTIONS.map(({ value, label }) => ({
    value,
    label,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

      {/* Application Date & Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Application Date"
          name="application_date"
          type="date"
          value={formData.application_date || ""}
          onChange={handleChange}
          hint="When you submitted the application"
        />
        <Select
          label="Application Status"
          name="application_status"
          value={formData.application_status}
          onChange={handleChange}
          options={statusOptions}
          required
        />
      </div>

      {/* Job URL */}
      <Input
        label="Job Posting URL (optional)"
        name="job_url"
        type="url"
        value={formData.job_url || ""}
        onChange={handleChange}
        placeholder="https://..."
        hint="Link to the job posting for reference"
      />

      {/* Salary Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Salary Min (optional)"
          name="salary_min"
          type="number"
          value={formData.salary_min?.toString() || ""}
          onChange={handleChange}
          error={errors.salary_min}
          placeholder="e.g., 80000"
          hint="Minimum salary expectation"
        />
        <Input
          label="Salary Max (optional)"
          name="salary_max"
          type="number"
          value={formData.salary_max?.toString() || ""}
          onChange={handleChange}
          placeholder="e.g., 120000"
          hint="Maximum salary expectation"
        />
      </div>

      {/* Notes */}
      <Textarea
        label="Notes (optional)"
        name="notes"
        value={formData.notes || ""}
        onChange={handleChange}
        placeholder="Add any notes about the application, requirements, or company..."
        rows={4}
      />

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button type="submit" isLoading={isLoading}>
          {isEditing ? "Update Application" : "Create Application"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
