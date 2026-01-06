import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import InterviewForm from "../components/InterviewForm";
import interviewService from "../services/interviewService";
import type { Interview, InterviewFormData } from "../types";
import { formatForInput } from "../utils/dateUtils";
import { Button } from "../components";

/**
 * Page for editing an existing interview.
 * Fetches interview data and pre-populates the form.
 */

export default function EditInterview() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch interview on mount
  useEffect(() => {
    const fetchInterview = async () => {
      if (!id) return;

      try {
        const data = await interviewService.getInterview(Number(id));
        setInterview(data);
      } catch (err) {
        setError("Interview not found");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterview();
  }, [id]);

  const handleSubmit = async (data: InterviewFormData) => {
    if (!id) return;
    await interviewService.updateInterview(Number(id), data);
    navigate("/"); // Go back to dashboard on success
  };

  const handleCancel = () => {
    navigate("/");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Error / Not found state
  if (error || !interview) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Interview Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          The interview you're looking for doesn't exist or has been deleted.
        </p>
        <Button onClick={() => navigate("/")}>Back to Dashboard</Button>
      </div>
    );
  }

  // Prepare initial data for form (convert date format for input)
  const initialData = {
    ...interview,
    interview_date: formatForInput(interview.interview_date),
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Interview</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <InterviewForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isEditing
        />
      </div>
    </div>
  );
}

