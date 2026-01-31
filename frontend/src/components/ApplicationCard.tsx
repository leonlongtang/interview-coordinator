import type { JobApplication } from "../types";
import { APPLICATION_STATUS_OPTIONS } from "../types";
import { Button } from "./ui";

/**
 * Card component displaying a single job application.
 * Shows key info at a glance with application status and edit/delete actions.
 */

interface ApplicationCardProps {
  application: JobApplication;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function ApplicationCard({
  application,
  onEdit,
  onDelete,
}: ApplicationCardProps) {
  // Find the status option to get color
  const statusOption = APPLICATION_STATUS_OPTIONS.find(
    (opt) => opt.value === application.application_status
  );

  // Status badge colors
  const statusColors: Record<string, string> = {
    in_progress: "bg-sky-100 text-sky-800",
    offer: "bg-green-100 text-green-800",
    accepted: "bg-emerald-100 text-emerald-800",
    rejected: "bg-red-100 text-red-800",
    declined: "bg-orange-100 text-orange-800",
    withdrawn: "bg-gray-100 text-gray-800",
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-lg hover:border-indigo-200 transition-all duration-200 group h-full flex flex-col">
      {/* Header: Company & Position */}
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-gray-900 truncate group-hover:text-indigo-700 transition-colors">
            {application.company_name}
          </h3>
          <p className="text-gray-600 truncate">{application.position}</p>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex flex-wrap gap-2 mb-3 min-h-[28px]">
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
            statusColors[application.application_status] || "bg-gray-100 text-gray-800"
          }`}
        >
          {statusOption?.label || application.application_status}
        </span>
        {application.interview_count > 0 && (
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
            {application.interview_count} interview{application.interview_count !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Dates Section - fixed height for alignment */}
      <div className="text-gray-700 mb-3 min-h-[44px]">
        <p className="text-sm">
          <span className="font-medium">Applied:</span> {formatDate(application.application_date)}
        </p>
        <p className={`text-sm ${application.next_interview_date ? "text-indigo-600" : "text-gray-400"}`}>
          <span className="font-medium">Next interview:</span>{" "}
          {application.next_interview_date ? formatDate(application.next_interview_date) : "—"}
        </p>
      </div>

      {/* Days in Pipeline - always shown */}
      <p className="text-xs text-gray-500 mb-2">
        {application.days_in_pipeline !== null && application.days_in_pipeline !== undefined
          ? `${application.days_in_pipeline} day${application.days_in_pipeline !== 1 ? "s" : ""} in pipeline`
          : "\u00A0"}
      </p>

      {/* Salary Range - fixed height */}
      <p className={`text-sm mb-3 min-h-[20px] ${application.salary_min || application.salary_max ? "text-gray-600" : "text-transparent"}`}>
        {application.salary_min || application.salary_max
          ? `Salary: $${application.salary_min?.toLocaleString() || "?"} - $${application.salary_max?.toLocaleString() || "?"}`
          : "\u00A0"}
      </p>

      {/* Spacer to push actions to bottom */}
      <div className="flex-grow" />

      {/* Notes Preview */}
      {application.notes && (
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{application.notes}</p>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-gray-100 mt-auto">
        <Button
          variant="secondary"
          onClick={() => onEdit(application.id)}
          className="flex-1 text-sm"
        >
          Edit
        </Button>
        <Button
          variant="danger"
          onClick={() => onDelete(application.id)}
          className="flex-1 text-sm"
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
