import { useNavigate } from "react-router-dom";
import type { AwaitingApplication } from "../services/applicationService";

/**
 * AwaitingResponse widget displays applications that don't have an interview scheduled yet.
 * Shows how long you've been waiting for a response from each company.
 */

interface AwaitingResponseProps {
  interviews: AwaitingApplication[];
  isLoading?: boolean;
}

export default function AwaitingResponse({
  interviews,
  isLoading = false,
}: AwaitingResponseProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>Awaiting Response</span>
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

  if (interviews.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>Awaiting Response</span>
        </h3>
        <div className="text-center py-6">
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
        <span>Awaiting Response</span>
        <span className="ml-auto text-sm font-normal text-gray-500">
          {interviews.length} pending
        </span>
      </h3>

      <div className="space-y-3">
        {interviews.map((application) => {
          const daysWaiting = application.days_waiting ?? 0;
          let waitingColor = "bg-gray-100 text-gray-700";
          let waitingText = daysWaiting === 0 ? "Today" : `${daysWaiting}d ago`;

          if (daysWaiting >= 14) {
            waitingColor = "bg-amber-100 text-amber-700";
            waitingText = `${daysWaiting}d ago`;
          } else if (daysWaiting >= 7) {
            waitingColor = "bg-blue-100 text-blue-700";
          }

          return (
            <button
              key={application.id}
              onClick={() => navigate(`/edit/${application.id}`)}
              className="w-full text-left p-3 rounded-lg border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all group"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`${waitingColor} px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap min-w-[60px] text-center`}
                >
                  {application.application_date ? waitingText : "No date"}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate group-hover:text-indigo-700">
                    {application.company_name}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {application.position}
                  </p>
                  {daysWaiting >= 14 && (
                    <p className="text-xs text-amber-600 mt-1">
                      Consider following up
                    </p>
                  )}
                </div>

                <span className="text-gray-300 group-hover:text-indigo-400 transition-colors">
                  View
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
          View all applications
        </button>
      )}
    </div>
  );
}
