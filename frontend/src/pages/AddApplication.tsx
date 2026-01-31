import { useNavigate } from "react-router-dom";
import ApplicationForm from "../components/ApplicationForm";
import applicationService from "../services/applicationService";
import type { JobApplicationFormData } from "../types";

/**
 * Page for creating a new job application.
 * Wraps ApplicationForm with create logic and navigation.
 */

export default function AddApplication() {
  const navigate = useNavigate();

  const handleSubmit = async (data: JobApplicationFormData) => {
    await applicationService.createApplication(data);
    navigate("/");
  };

  const handleCancel = () => {
    navigate("/");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Add New Application
      </h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <ApplicationForm onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    </div>
  );
}
