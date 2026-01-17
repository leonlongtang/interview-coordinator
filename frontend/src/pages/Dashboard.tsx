import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { Interview, InterviewStage, ApplicationStatus } from "../types";
import { INTERVIEW_STAGE_OPTIONS, APPLICATION_STATUS_OPTIONS } from "../types";
import interviewService from "../services/interviewService";
import type { DashboardStats } from "../services/interviewService";
import {
  InterviewCard,
  Button,
  InterviewStageBadge,
  ApplicationStatusBadge,
  StatsCard,
  UpcomingInterviews,
  AwaitingResponse,
  NeedsReview,
} from "../components";

/**
 * Dashboard page - displays stats overview, upcoming interviews, and full interview list.
 * Features dual filtering: by interview stage (where in process) and application status (outcome).
 */

// Simple SVG icons for stats cards
const icons = {
  total: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  active: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  offers: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  rate: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Split filters for interview stage and application status
  const [selectedInterviewStage, setSelectedInterviewStage] = useState<InterviewStage | "all">("all");
  const [selectedAppStatus, setSelectedAppStatus] = useState<ApplicationStatus | "all">("all");

  // Fetch interviews and stats on mount
  useEffect(() => {
    fetchInterviews();
    fetchStats();
  }, []);

  const fetchInterviews = async () => {
    try {
      setIsLoading(true);
      const data = await interviewService.getAllInterviews();
      setInterviews(data);
      setError(null);
    } catch (err) {
      setError("Failed to load interviews. Is the backend running?");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setIsStatsLoading(true);
      const data = await interviewService.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to load stats:", err);
      // Don't show error for stats - the interviews list is the main content
    } finally {
      setIsStatsLoading(false);
    }
  };

  // Calculate counts per interview stage
  const interviewStageCounts = useMemo(() => {
    const counts: Record<string, number> = { all: interviews.length };
    INTERVIEW_STAGE_OPTIONS.forEach(({ value }) => {
      counts[value] = interviews.filter((i) => i.interview_stage === value).length;
    });
    return counts;
  }, [interviews]);

  // Calculate counts per application status
  const appStatusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: interviews.length };
    APPLICATION_STATUS_OPTIONS.forEach(({ value }) => {
      counts[value] = interviews.filter((i) => i.application_status === value).length;
    });
    return counts;
  }, [interviews]);

  // Filter interviews based on selected filters
  const filteredInterviews = useMemo(() => {
    let filtered = interviews;
    if (selectedInterviewStage !== "all") {
      filtered = filtered.filter((i) => i.interview_stage === selectedInterviewStage);
    }
    if (selectedAppStatus !== "all") {
      filtered = filtered.filter((i) => i.application_status === selectedAppStatus);
    }
    return filtered;
  }, [interviews, selectedInterviewStage, selectedAppStatus]);

  // Navigate to edit page
  const handleEdit = (id: number) => {
    navigate(`/edit/${id}`);
  };

  // Delete with confirmation
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this interview?")) {
      return;
    }

    try {
      await interviewService.deleteInterview(id);
      // Remove from local state immediately for snappy UX
      setInterviews((prev) => prev.filter((i) => i.id !== id));
      // Refresh stats after delete
      fetchStats();
    } catch (err) {
      alert("Failed to delete interview. Please try again.");
      console.error(err);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchInterviews}>Try Again</Button>
      </div>
    );
  }

  // Empty state
  if (interviews.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📅</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          No interviews yet
        </h2>
        <p className="text-gray-600 mb-6">
          Start tracking your job interviews by adding your first one.
        </p>
        <Button onClick={() => navigate("/add")}>Add Your First Interview</Button>
      </div>
    );
  }

  // Main content
  return (
    <div>
      {/* Stats Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total Interviews"
          value={stats?.total ?? "-"}
          icon={icons.total}
          color="indigo"
          subtitle="All time"
        />
        <StatsCard
          title="Active"
          value={stats?.active ?? "-"}
          icon={icons.active}
          color="sky"
          subtitle="In pipeline"
        />
        <StatsCard
          title="Offers"
          value={stats?.offers ?? "-"}
          icon={icons.offers}
          color="green"
          subtitle="Received or accepted"
        />
        <StatsCard
          title="Success Rate"
          value={stats ? `${stats.success_rate}%` : "-"}
          icon={icons.rate}
          color="amber"
          subtitle="Offers / completed"
        />
      </div>

      {/* Needs Review Alert - shows at top if there are past interviews to update */}
      {(stats?.needs_review_count ?? 0) > 0 && (
        <div className="mb-6">
          <NeedsReview
            interviews={stats?.needs_review ?? []}
            isLoading={isStatsLoading}
          />
        </div>
      )}

      {/* Widgets Row: Upcoming + Awaiting Response */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Upcoming Interviews Widget */}
        <UpcomingInterviews
          interviews={stats?.upcoming_interviews ?? []}
          isLoading={isStatsLoading}
        />

        {/* Awaiting Response Widget */}
        <AwaitingResponse
          interviews={stats?.awaiting_response ?? []}
          isLoading={isStatsLoading}
        />
      </div>

      {/* Quick Actions + Stage Overview */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Interview Stages</h2>
            <p className="text-sm text-gray-500">Where you are in the interview process</p>
          </div>
          <Button onClick={() => navigate("/add")}>+ Add Interview</Button>
        </div>

        {/* Interview Stage Buttons */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {INTERVIEW_STAGE_OPTIONS.map(({ value, label }) => {
            const count = stats?.by_interview_stage?.[value] ?? 0;
            return (
              <button
                key={value}
                onClick={() => setSelectedInterviewStage(value)}
                className={`p-3 rounded-lg text-center transition-all ${
                  selectedInterviewStage === value
                    ? "bg-indigo-100 border-2 border-indigo-300"
                    : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                }`}
              >
                <InterviewStageBadge stage={value} size="sm" />
                <p className="text-2xl font-bold text-gray-900 mt-1">{count}</p>
                <p className="text-xs text-gray-500 truncate">{label}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Application Status Overview */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm mb-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Application Status</h2>
          <p className="text-sm text-gray-500">Outcome of your applications</p>
        </div>

        {/* Application Status Buttons */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {APPLICATION_STATUS_OPTIONS.map(({ value, label }) => {
            const count = stats?.by_application_status?.[value] ?? 0;
            return (
              <button
                key={value}
                onClick={() => setSelectedAppStatus(value)}
                className={`p-3 rounded-lg text-center transition-all ${
                  selectedAppStatus === value
                    ? "bg-indigo-100 border-2 border-indigo-300"
                    : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                }`}
              >
                <ApplicationStatusBadge status={value} size="sm" />
                <p className="text-2xl font-bold text-gray-900 mt-1">{count}</p>
                <p className="text-xs text-gray-500 truncate">{label}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interview List Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">All Interviews</h2>
          <p className="text-gray-600">
            {interviews.length} interview{interviews.length !== 1 ? "s" : ""} tracked
          </p>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="mb-6 space-y-3">
        {/* Interview Stage Filter */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium text-gray-700 mr-2">Stage:</span>
          <button
            onClick={() => setSelectedInterviewStage("all")}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedInterviewStage === "all"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All ({interviewStageCounts.all})
          </button>
          {INTERVIEW_STAGE_OPTIONS.map(({ value, label }) => {
            const count = interviewStageCounts[value] || 0;
            const isSelected = selectedInterviewStage === value;
            return (
              <button
                key={value}
                onClick={() => setSelectedInterviewStage(value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {!isSelected && <InterviewStageBadge stage={value} size="sm" />}
                {isSelected && label}
                <span className={isSelected ? "text-indigo-200" : "text-gray-500"}>
                  ({count})
                </span>
              </button>
            );
          })}
        </div>

        {/* Application Status Filter */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium text-gray-700 mr-2">Status:</span>
          <button
            onClick={() => setSelectedAppStatus("all")}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedAppStatus === "all"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All ({appStatusCounts.all})
          </button>
          {APPLICATION_STATUS_OPTIONS.map(({ value, label }) => {
            const count = appStatusCounts[value] || 0;
            const isSelected = selectedAppStatus === value;
            return (
              <button
                key={value}
                onClick={() => setSelectedAppStatus(value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {!isSelected && <ApplicationStatusBadge status={value} size="sm" />}
                {isSelected && label}
                <span className={isSelected ? "text-indigo-200" : "text-gray-500"}>
                  ({count})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filtered results info */}
      {(selectedInterviewStage !== "all" || selectedAppStatus !== "all") && (
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-600">
            Showing {filteredInterviews.length} interview{filteredInterviews.length !== 1 ? "s" : ""}
          </span>
          {selectedInterviewStage !== "all" && (
            <InterviewStageBadge stage={selectedInterviewStage} size="sm" />
          )}
          {selectedAppStatus !== "all" && (
            <ApplicationStatusBadge status={selectedAppStatus} size="sm" />
          )}
          <button
            onClick={() => {
              setSelectedInterviewStage("all");
              setSelectedAppStatus("all");
            }}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Interview Grid */}
      {filteredInterviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInterviews.map((interview) => (
            <InterviewCard
              key={interview.id}
              interview={interview}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No interviews match the current filters.</p>
          <button
            onClick={() => {
              setSelectedInterviewStage("all");
              setSelectedAppStatus("all");
            }}
            className="mt-2 text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
