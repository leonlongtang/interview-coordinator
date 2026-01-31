import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { JobApplication, ApplicationStatus } from "../types";
import { APPLICATION_STATUS_OPTIONS } from "../types";
import applicationService from "../services/applicationService";
import type { DashboardStats } from "../services/applicationService";
import {
  ApplicationCard,
  Button,
  ApplicationStatusBadge,
  StatsCard,
  UpcomingInterviews,
  AwaitingResponse,
  NeedsReview,
  LoadingSkeleton,
  EmptyState,
  ErrorMessage,
  ConfirmDialog,
} from "../components";

/**
 * Dashboard page - displays stats overview, upcoming interviews, and application list.
 * Features filtering by application status.
 */

// Simple SVG icons for stats cards
const icons = {
  total: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      />
    </svg>
  ),
  active: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    </svg>
  ),
  offers: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  rate: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
      />
    </svg>
  ),
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | "all">("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState<JobApplication | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchApplications();
    fetchStats();
  }, []);

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      const data = await applicationService.getAllApplications();
      setApplications(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError("Failed to load applications. Is the backend running?");
      console.error(err);
      setApplications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setIsStatsLoading(true);
      const data = await applicationService.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to load stats:", err);
    } finally {
      setIsStatsLoading(false);
    }
  };

  // Calculate counts per status
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: applications.length };
    APPLICATION_STATUS_OPTIONS.forEach(({ value }) => {
      counts[value] = applications.filter((a) => a.application_status === value).length;
    });
    return counts;
  }, [applications]);

  // Filter applications
  const filteredApplications = useMemo(() => {
    if (selectedStatus === "all") return applications;
    return applications.filter((a) => a.application_status === selectedStatus);
  }, [applications, selectedStatus]);

  const handleEdit = (id: number) => {
    navigate(`/edit/${id}`);
  };

  const handleDelete = (id: number) => {
    const application = applications.find((a) => a.id === id);
    if (application) {
      setApplicationToDelete(application);
      setDeleteDialogOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (!applicationToDelete) return;

    try {
      setIsDeleting(true);
      await applicationService.deleteApplication(applicationToDelete.id);
      setApplications((prev) => prev.filter((a) => a.id !== applicationToDelete.id));
      fetchStats();
      setDeleteDialogOpen(false);
      setApplicationToDelete(null);
    } catch (err) {
      setError("Failed to delete application. Please try again.");
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setApplicationToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
              <LoadingSkeleton variant="text" className="w-1/2 mb-2" />
              <LoadingSkeleton variant="text" className="w-1/4 h-8" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <LoadingSkeleton variant="card" count={3} />
        </div>
      </div>
    );
  }

  if (error && applications.length === 0) {
    return (
      <div className="py-12">
        <ErrorMessage message={error} onDismiss={() => setError(null)} className="mb-6" />
        <div className="text-center">
          <Button onClick={fetchApplications}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <EmptyState
        icon="Briefcase"
        title="No applications yet"
        message="Start tracking your job search by adding your first application."
        action={{
          label: "Add Your First Application",
          onClick: () => navigate("/add"),
        }}
      />
    );
  }

  return (
    <div>
      {/* Stats Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total Applications"
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
          subtitle="In progress"
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

      {/* Needs Review Alert */}
      {(stats?.needs_review_count ?? 0) > 0 && (
        <div className="mb-6">
          <NeedsReview interviews={stats?.needs_review ?? []} isLoading={isStatsLoading} />
        </div>
      )}

      {/* Widgets Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <UpcomingInterviews
          interviews={stats?.upcoming_interviews ?? []}
          isLoading={isStatsLoading}
        />
        <AwaitingResponse
          interviews={stats?.awaiting_response ?? []}
          isLoading={isStatsLoading}
        />
      </div>

      {/* Status Overview */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Application Status</h2>
            <p className="text-sm text-gray-500">Filter by status</p>
          </div>
          <Button onClick={() => navigate("/add")}>+ Add Application</Button>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {APPLICATION_STATUS_OPTIONS.map(({ value, label }) => {
            const count = stats?.by_application_status?.[value] ?? 0;
            return (
              <button
                key={value}
                onClick={() => setSelectedStatus(value)}
                className={`p-3 rounded-lg text-center transition-all ${
                  selectedStatus === value
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

      {/* Application List Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">All Applications</h2>
          <p className="text-gray-600">
            {applications.length} application{applications.length !== 1 ? "s" : ""} tracked
          </p>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium text-gray-700 mr-2">Status:</span>
          <button
            onClick={() => setSelectedStatus("all")}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedStatus === "all"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All ({statusCounts.all})
          </button>
          {APPLICATION_STATUS_OPTIONS.map(({ value, label }) => {
            const count = statusCounts[value] || 0;
            const isSelected = selectedStatus === value;
            return (
              <button
                key={value}
                onClick={() => setSelectedStatus(value)}
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
      {selectedStatus !== "all" && (
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-600">
            Showing {filteredApplications.length} application
            {filteredApplications.length !== 1 ? "s" : ""}
          </span>
          <ApplicationStatusBadge status={selectedStatus} size="sm" />
          <button
            onClick={() => setSelectedStatus("all")}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Clear filter
          </button>
        </div>
      )}

      {/* Error message */}
      {error && (
        <ErrorMessage message={error} onDismiss={() => setError(null)} className="mb-4" />
      )}

      {/* Application Grid */}
      {filteredApplications.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
          {filteredApplications.map((application) => (
            <div key={application.id} className="animate-slide-up h-full">
              <ApplicationCard
                application={application}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="Search"
          title="No applications match the current filter"
          message="Try adjusting your filter to see more results."
          action={{
            label: "Clear filter",
            onClick: () => setSelectedStatus("all"),
          }}
          className="bg-gray-50 rounded-lg"
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Delete Application"
        message={`Are you sure you want to delete the application at ${applicationToDelete?.company_name} for ${applicationToDelete?.position}? This will also delete all interviews for this application. This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
