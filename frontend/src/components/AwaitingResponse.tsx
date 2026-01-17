import { useNavigate } from "react-router-dom";
import type { AwaitingInterview } from "../services/interviewService";

/**
 * AwaitingResponse widget displays applications that don't have an interview scheduled yet.
 * Shows how long you've been waiting for a response from each company.
 */

interface AwaitingResponseProps {
  interviews: AwaitingInterview[];
  isLoading?: boolean;
}

export default function AwaitingResponse({
  interviews,
  isLoading = false,
}: AwaitingResponseProps) {
  const navigate = useNavigate();

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>⏳</span> Awaiting Response
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
          <span>⏳</span> Awaiting Response
        </h3>
        <div className="text-center py-6">
          <div className="text-4xl mb-2">✨</div>
          <p className="text-gray-600">All caught up! No pending applications.</p>
          <button
            onClick={() => navigate("/add")}
            className="mt-3 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            + Track a new application
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <span>⏳</span> Awaiting Response
        <span className="ml-auto text-sm font-normal text-gray-500">
          {interviews.length} pending
        </span>
      </h3>

      <div className="space-y-3">
        {interviews.map((interview) => {
          // Determine waiting status color
          const daysWaiting = interview.days_waiting ?? 0;
          let waitingColor = "bg-gray-100 text-gray-700"; // < 7 days
          let waitingText = daysWaiting === 0 ? "Today" : `${daysWaiting}d ago`;
          
          if (daysWaiting >= 14) {
            waitingColor = "bg-amber-100 text-amber-700"; // > 2 weeks - might want to follow up
            waitingText = `${daysWaiting}d ago`;
          } else if (daysWaiting >= 7) {
            waitingColor = "bg-blue-100 text-blue-700"; // > 1 week
          }

          return (
            <button
              key={interview.id}
              onClick={() => navigate(`/edit/${interview.id}`)}
              className="w-full text-left p-3 rounded-lg border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all group"
            >
              <div className="flex items-start gap-3">
                {/* Days waiting badge */}
                <div
                  className={`${waitingColor} px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap min-w-[60px] text-center`}
                >
                  {interview.application_date ? waitingText : "No date"}
                </div>

                {/* Application details */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate group-hover:text-indigo-700">
                    {interview.company_name}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {interview.position}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                    <span className="capitalize">{interview.interview_stage.replace("_", " ")}</span>
                    {daysWaiting >= 14 && (
                      <>
                        <span>•</span>
                        <span className="text-amber-600">Consider following up</span>
                      </>
                    )}
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
          View all applications →
        </button>
      )}
    </div>
  );
}
