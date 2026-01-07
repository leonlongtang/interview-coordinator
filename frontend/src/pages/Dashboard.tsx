import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { Interview, PipelineStage } from "../types";
import { PIPELINE_STAGE_OPTIONS } from "../types";
import interviewService from "../services/interviewService";
import { InterviewCard, Button, StatusBadge } from "../components";

/**
 * Dashboard page - displays all interviews in a grid.
 * Includes pipeline stage filtering and count badges.
 */

export default function Dashboard() {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStage, setSelectedStage] = useState<PipelineStage | "all">("all");

  // Fetch interviews on mount
  useEffect(() => {
    fetchInterviews();
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Interviews</h2>
          <p className="text-gray-600">
            {interviews.length} interview{interviews.length !== 1 ? "s" : ""} tracked
          </p>
        </div>
        <Button onClick={() => navigate("/add")}>+ Add Interview</Button>
      </div>

      {/* Pipeline Stage Filter */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Filter by Pipeline Stage</h3>
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

