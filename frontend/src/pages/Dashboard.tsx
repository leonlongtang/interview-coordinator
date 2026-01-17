import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { Interview, PipelineStage } from "../types";
import { PIPELINE_STAGE_OPTIONS } from "../types";
import interviewService from "../services/interviewService";
import type { DashboardStats } from "../services/interviewService";
import {
  InterviewCard,
  Button,
  StatusBadge,
  StatsCard,
  UpcomingInterviews,
} from "../components";

/**
 * Dashboard page - displays stats overview, upcoming interviews, and full interview list.
 * Includes pipeline stage filtering and count badges.
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
  const [selectedStage, setSelectedStage] = useState<PipelineStage | "all">("all");

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

  // Calculate counts per pipeline stage
  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = { all: interviews.length };
    PIPELINE_STAGE_OPTIONS.forEach(({ value }) => {
      counts[value] = interviews.filter((i) => i.pipeline_stage === value).length;
    });
    return counts;
  }, [interviews]);

  // Filter interviews based on selected stage
  const filteredInterviews = useMemo(() => {
    if (selectedStage === "all") return interviews;
    return interviews.filter((i) => i.pipeline_stage === selectedStage);
  }, [interviews, selectedStage]);

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

      {/* Two Column Layout: Upcoming Interviews + Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Upcoming Interviews Widget */}
        <div className="lg:col-span-1">
          <UpcomingInterviews
            interviews={stats?.upcoming_interviews ?? []}
            isLoading={isStatsLoading}
          />
        </div>

        {/* Quick Actions + Header */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm h-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
                <p className="text-sm text-gray-500">Manage your job search</p>
              </div>
              <Button onClick={() => navigate("/add")}>+ Add Interview</Button>
            </div>

            {/* Pipeline Overview */}
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Pipeline Overview</h3>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {PIPELINE_STAGE_OPTIONS.slice(0, 5).map(({ value, label }) => {
                  const count = stats?.by_stage?.[value] ?? 0;
                  return (
                    <button
                      key={value}
                      onClick={() => setSelectedStage(value)}
                      className={`p-3 rounded-lg text-center transition-all ${
                        selectedStage === value
                          ? "bg-indigo-100 border-2 border-indigo-300"
                          : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      <StatusBadge stage={value} size="sm" />
                      <p className="text-2xl font-bold text-gray-900 mt-1">{count}</p>
                      <p className="text-xs text-gray-500 truncate">{label}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
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

      {/* Pipeline Stage Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {/* All filter button */}
          <button
            onClick={() => setSelectedStage("all")}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedStage === "all"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All ({stageCounts.all})
          </button>

          {/* Stage filter buttons */}
          {PIPELINE_STAGE_OPTIONS.map(({ value, label }) => {
            const count = stageCounts[value] || 0;
            const isSelected = selectedStage === value;

            return (
              <button
                key={value}
                onClick={() => setSelectedStage(value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {!isSelected && <StatusBadge stage={value} size="sm" />}
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
      {selectedStage !== "all" && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-gray-600">
            Showing {filteredInterviews.length} interview{filteredInterviews.length !== 1 ? "s" : ""} in
          </span>
          <StatusBadge stage={selectedStage} size="sm" />
          <button
            onClick={() => setSelectedStage("all")}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Clear filter
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
          <p className="text-gray-600">No interviews in this stage.</p>
          <button
            onClick={() => setSelectedStage("all")}
            className="mt-2 text-indigo-600 hover:text-indigo-800 font-medium"
          >
            View all interviews
          </button>
        </div>
      )}
    </div>
  );
}
