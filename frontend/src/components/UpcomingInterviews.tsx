import { useNavigate } from "react-router-dom";
import type { UpcomingInterview } from "../services/interviewService";
import { formatDistanceToNow, parseISO } from "date-fns";

/**
 * UpcomingInterviews widget displays interviews scheduled in the next 7 days.
 * Shows countdown, company name, and quick access to interview details.
 */

interface UpcomingInterviewsProps {
  interviews: UpcomingInterview[];
  isLoading?: boolean;
}

// Map interview types to display labels
const typeLabels: Record<string, string> = {
  phone: "📞 Phone",
  technical: "💻 Technical",
  behavioral: "🤝 Behavioral",
  final: "🎯 Final",
};

// Map location to icons
const locationIcons: Record<string, string> = {
  remote: "🏠",
  onsite: "🏢",
  hybrid: "🔄",
};

export default function UpcomingInterviews({
  interviews,
  isLoading = false,
}: UpcomingInterviewsProps) {
  const navigate = useNavigate();

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>📅</span> Upcoming Interviews
        </h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (interviews.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>📅</span> Upcoming Interviews
        </h3>
        <div className="text-center py-6">
          <div className="text-4xl mb-2">🎉</div>
          <p className="text-gray-600">No interviews scheduled this week.</p>
          <button
            onClick={() => navigate("/add")}
            className="mt-3 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            + Add an interview
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <span>📅</span> Upcoming Interviews
        <span className="ml-auto text-sm font-normal text-gray-500">
          Next 7 days
        </span>
      </h3>

      <div className="space-y-3">
        {interviews.map((interview) => {
          const date = parseISO(interview.interview_date);
          const timeUntil = formatDistanceToNow(date, { addSuffix: true });
          
          // Determine urgency color based on how soon the interview is
          const hoursUntil = (date.getTime() - Date.now()) / (1000 * 60 * 60);
          let urgencyColor = "bg-gray-100 text-gray-700"; // > 3 days
          if (hoursUntil < 24) {
            urgencyColor = "bg-red-100 text-red-700"; // < 1 day - urgent!
          } else if (hoursUntil < 72) {
            urgencyColor = "bg-amber-100 text-amber-700"; // < 3 days
          }

          return (
            <button
              key={interview.id}
              onClick={() => navigate(`/edit/${interview.id}`)}
              className="w-full text-left p-3 rounded-lg border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all group"
            >
              <div className="flex items-start gap-3">
                {/* Countdown badge */}
                <div
                  className={`${urgencyColor} px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap`}
                >
                  {timeUntil}
                </div>

                {/* Interview details */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate group-hover:text-indigo-700">
                    {interview.company_name}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {interview.position}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                    <span>{typeLabels[interview.interview_type] || interview.interview_type}</span>
                    <span>•</span>
                    <span>{locationIcons[interview.location] || ""} {interview.location}</span>
                  </div>
                </div>

                {/* Arrow indicator */}
                <span className="text-gray-300 group-hover:text-indigo-400 transition-colors">
                  →
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {interviews.length >= 5 && (
        <button
          onClick={() => navigate("/")}
          className="mt-4 w-full text-center text-sm text-indigo-600 hover:text-indigo-800 font-medium"
        >
          View all interviews →
        </button>
      )}
    </div>
  );
}
