import { useNavigate } from "react-router-dom";
import InterviewForm from "../components/InterviewForm";
import interviewService from "../services/interviewService";
import type { InterviewFormData } from "../types";

/**
 * Page for creating a new interview.
 * Wraps InterviewForm with create logic and navigation.
 */

export default function AddInterview() {
  const navigate = useNavigate();

  const handleSubmit = async (data: InterviewFormData) => {
    await interviewService.createInterview(data);
    navigate("/"); // Go back to dashboard on success
  };

  const handleCancel = () => {
    navigate("/");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Add New Interview
      </h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <InterviewForm onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    </div>
  );
}

