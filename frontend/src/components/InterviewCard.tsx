import type { Interview } from "../types";
import { formatInterviewDate, getRelativeTime, isDatePast } from "../utils/dateUtils";
import { Button } from "./ui";

/**
 * Card component displaying a single interview.
 * Shows key info at a glance with edit/delete actions.
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
  // Status badge colors
  const statusColors = {
    scheduled: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

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
      {/* Header: Company & Position */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h3 className="font-semibold text-lg text-gray-900">
            {interview.company_name}
          </h3>
          <p className="text-gray-600">{interview.position}</p>
        </div>
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
            statusColors[interview.status]
          }`}
        >
          {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
        </span>
      </div>

      {/* Date & Time */}
      <div className={`mb-3 ${isPast && interview.status === "scheduled" ? "text-red-600" : "text-gray-700"}`}>
        <p className="font-medium">
          {formatInterviewDate(interview.interview_date)}
        </p>
        <p className="text-sm text-gray-500">
          {getRelativeTime(interview.interview_date)}
        </p>
      </div>

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

