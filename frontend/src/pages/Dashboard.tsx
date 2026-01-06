import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Interview } from "../types";
import interviewService from "../services/interviewService";
import { InterviewCard, Button } from "../components";

/**
 * Dashboard page - displays all interviews in a grid.
 * Handles loading, empty states, and delete confirmation.
 */

export default function Dashboard() {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      {/* Interview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {interviews.map((interview) => (
          <InterviewCard
            key={interview.id}
            interview={interview}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}

