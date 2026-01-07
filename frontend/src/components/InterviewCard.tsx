import type { Interview } from "../types";
import { formatInterviewDate, getRelativeTime, isDatePast } from "../utils/dateUtils";
import { Button } from "./ui";
import StatusBadge from "./StatusBadge";

/**
 * Card component displaying a single interview.
 * Shows key info at a glance with pipeline stage, edit/delete actions.
 */

interface InterviewCardProps {
  interview: Interview;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function InterviewCard({
  interview,
  onEdit,
  onDelete,
}: InterviewCardProps) {
  // Interview type badge colors
  const typeColors = {
    phone: "bg-purple-100 text-purple-800",
    technical: "bg-orange-100 text-orange-800",
    behavioral: "bg-teal-100 text-teal-800",
    final: "bg-pink-100 text-pink-800",
  };

  // Location icons
  const locationIcons = {
    onsite: "🏢",
    remote: "💻",
    hybrid: "🔀",
  };

  const isPast = isDatePast(interview.interview_date);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
      {/* Header: Company & Position with Pipeline Stage */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-gray-900 truncate">
            {interview.company_name}
          </h3>
          <p className="text-gray-600 truncate">{interview.position}</p>
        </div>
        <StatusBadge stage={interview.pipeline_stage} size="sm" />
      </div>

      {/* Date & Time with "Upcoming" indicator */}
      <div className={`mb-3 ${isPast && interview.status === "scheduled" ? "text-red-600" : "text-gray-700"}`}>
        <div className="flex items-center gap-2">
          <p className="font-medium">
            {formatInterviewDate(interview.interview_date)}
          </p>
          {interview.is_upcoming && interview.status === "scheduled" && (
            <span className="px-1.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded">
              Upcoming
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500">
          {getRelativeTime(interview.interview_date)}
        </p>
      </div>

      {/* Days in Pipeline */}
      {interview.days_in_pipeline !== null && interview.days_in_pipeline !== undefined && (
        <p className="text-xs text-gray-500 mb-2">
          {interview.days_in_pipeline} day{interview.days_in_pipeline !== 1 ? "s" : ""} in pipeline
        </p>
      )}

      {/* Tags: Type & Location */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
            typeColors[interview.interview_type]
          }`}
        >
          {interview.interview_type.charAt(0).toUpperCase() +
            interview.interview_type.slice(1)}
        </span>
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
          {locationIcons[interview.location]} {interview.location.charAt(0).toUpperCase() + interview.location.slice(1)}
        </span>
      </div>

      {/* Notes Preview */}
      {interview.notes && (
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">
          {interview.notes}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-gray-100">
        <Button
          variant="secondary"
          onClick={() => onEdit(interview.id)}
          className="flex-1 text-sm"
        >
          Edit
        </Button>
        <Button
          variant="danger"
          onClick={() => onDelete(interview.id)}
          className="flex-1 text-sm"
        >
          Delete
        </Button>
      </div>
    </div>
  );
}

