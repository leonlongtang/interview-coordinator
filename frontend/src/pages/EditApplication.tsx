import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ApplicationForm from "../components/ApplicationForm";
import applicationService from "../services/applicationService";
import type { JobApplicationFormData, JobApplicationWithInterviews, Interview } from "../types";
import { Button, Interviews } from "../components";

/**
 * Page for editing an existing job application.
 * Fetches application data and pre-populates the form.
 * Also displays interview history for the application.
 */

export default function EditApplication() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [application, setApplication] = useState<JobApplicationWithInterviews | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplication = async () => {
      if (!id) return;

      try {
        const data = await applicationService.getApplication(Number(id));
        setApplication(data);
      } catch (err) {
        setError("Application not found");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplication();
  }, [id]);

  const handleSubmit = async (data: JobApplicationFormData) => {
    if (!id) return;
    await applicationService.updateApplication(Number(id), data);
    const refreshed = await applicationService.getApplication(Number(id));
    setApplication(refreshed);
    navigate("/");
  };

  const handleCancel = () => {
    navigate("/");
  };

  const handleInterviewsChange = (interviews: Interview[]) => {
    if (application) {
      setApplication({ ...application, interviews });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">?</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Application Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          The application you're looking for doesn't exist or has been deleted.
        </p>
        <Button onClick={() => navigate("/")}>Back to Dashboard</Button>
      </div>
    );
  }

  const initialData = {
    ...application,
    application_date: application.application_date || "",
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Edit Application</h2>
        <p className="text-gray-600">
          {application.company_name} - {application.position}
        </p>
      </div>

      {/* Application Details Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Details</h3>
        <ApplicationForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isEditing
        />
      </div>

      {/* Interviews History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <Interviews
          applicationId={application.id}
          interviews={application.interviews || []}
          onInterviewsChange={handleInterviewsChange}
        />
      </div>
    </div>
  );
}
