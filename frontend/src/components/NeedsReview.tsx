import { useNavigate } from "react-router-dom";
import type { NeedsReviewInterview } from "../services/applicationService";

/**
 * NeedsReview widget displays past interviews that need status updates.
 * Prompts users to record how the interview went and update the outcome.
 */

interface NeedsReviewProps {
  interviews: NeedsReviewInterview[];
  isLoading?: boolean;
}

// Map interview types to display labels
const typeLabels: Record<string, string> = {
  phone_screening: "Phone Screen",
  recruiter_call: "Recruiter Call",
  technical: "Technical",
  coding: "Coding",
  system_design: "System Design",
  behavioral: "Behavioral",
  hiring_manager: "Hiring Manager",
  team_fit: "Team Fit",
  onsite: "Onsite",
  final: "Final Round",
  hr_final: "HR Final",
  offer_call: "Offer Call",
};

export default function NeedsReview({
  interviews,
  isLoading = false,
}: NeedsReviewProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-amber-200 p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>Needs Review</span>
        </h3>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse flex gap-3">
              <div className="w-16 h-12 bg-gray-200 rounded-lg" />
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
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
        <span>Needs Review</span>
        <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-amber-200 text-amber-800 rounded-full">
          {interviews.length} pending
        </span>
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        These interviews have passed. Update the outcome!
      </p>

      <div className="space-y-3">
        {interviews.map((interview) => {
          const daysAgo = interview.days_ago;

          let urgencyColor = "bg-amber-100 text-amber-700";
          if (daysAgo >= 7) {
            urgencyColor = "bg-red-100 text-red-700";
          } else if (daysAgo >= 3) {
            urgencyColor = "bg-orange-100 text-orange-700";
          }

          return (
            <button
              key={interview.id}
              onClick={() => navigate(`/edit/${interview.application_id}`)}
              className="w-full text-left p-3 rounded-lg bg-white border border-amber-100 hover:border-amber-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`${urgencyColor} px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap`}
                >
                  {daysAgo === 0 ? "Today" : daysAgo === 1 ? "Yesterday" : `${daysAgo}d ago`}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate group-hover:text-amber-700">
                    {interview.company_name}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {interview.position}
                  </p>
                  {interview.interview_type && (
                    <p className="text-xs text-gray-400 mt-1">
                      {interview.interview_type_display ||
                        typeLabels[interview.interview_type] ||
                        interview.interview_type}
                    </p>
                  )}
                </div>

                <span className="text-amber-500 group-hover:text-amber-600 text-sm font-medium whitespace-nowrap">
                  Update
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {interviews.length >= 5 && (
        <button
          onClick={() => navigate("/")}
          className="mt-4 w-full text-center text-sm text-amber-700 hover:text-amber-900 font-medium"
        >
          View all pending reviews
        </button>
      )}
    </div>
  );
}
