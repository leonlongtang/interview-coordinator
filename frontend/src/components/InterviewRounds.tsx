import { useState } from "react";
import type { InterviewRound, RoundStage, RoundOutcome } from "../types";
import { ROUND_STAGE_OPTIONS, ROUND_OUTCOME_OPTIONS } from "../types";
import { Button, Input, Textarea, Select } from "./ui";
import interviewService from "../services/interviewService";

/**
 * Component to display and manage interview rounds history.
 * Shows a timeline of all interview stages with their outcomes and notes.
 * Allows adding new rounds and updating existing ones.
 */

interface InterviewRoundsProps {
  interviewId: number;
  rounds: InterviewRound[];
  onRoundsChange: (rounds: InterviewRound[]) => void;
  currentStage: string;
}

// Outcome badge colors
const OUTCOME_COLORS: Record<RoundOutcome, string> = {
  pending: "bg-gray-100 text-gray-700",
  passed: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  cancelled: "bg-orange-100 text-orange-700",
};

// Stage icons
const STAGE_ICONS: Record<RoundStage, string> = {
  screening: "📞",
  technical: "💻",
  onsite: "🏢",
  final: "🎯",
};

export default function InterviewRounds({
  interviewId,
  rounds,
  onRoundsChange,
  currentStage,
}: InterviewRoundsProps) {
  const [isAddingRound, setIsAddingRound] = useState(false);
  const [editingRoundId, setEditingRoundId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state for new/editing round
  const [formData, setFormData] = useState<{
    stage: RoundStage;
    scheduled_date: string;
    completed_date: string;
    duration_minutes: string;
    notes: string;
    outcome: RoundOutcome;
  }>({
    stage: "screening",
    scheduled_date: "",
    completed_date: "",
    duration_minutes: "",
    notes: "",
    outcome: "pending",
  });

  const resetForm = () => {
    setFormData({
      stage: "screening",
      scheduled_date: "",
      completed_date: "",
      duration_minutes: "",
      notes: "",
      outcome: "pending",
    });
    setIsAddingRound(false);
    setEditingRoundId(null);
    setError(null);
  };

  const handleEditRound = (round: InterviewRound) => {
    setFormData({
      stage: round.stage,
      scheduled_date: round.scheduled_date?.slice(0, 16) || "",
      completed_date: round.completed_date?.slice(0, 16) || "",
      duration_minutes: round.duration_minutes?.toString() || "",
      notes: round.notes || "",
      outcome: round.outcome,
    });
    setEditingRoundId(round.id);
    setIsAddingRound(false);
  };

  const handleSaveRound = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = {
        interview: interviewId,
        stage: formData.stage,
        scheduled_date: formData.scheduled_date || null,
        completed_date: formData.completed_date || null,
        duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
        notes: formData.notes || null,
        outcome: formData.outcome,
      };

      if (editingRoundId) {
        // Update existing round
        const updated = await interviewService.updateRound(editingRoundId, data);
        onRoundsChange(rounds.map((r) => (r.id === editingRoundId ? updated : r)));
      } else {
        // Create new round
        const created = await interviewService.createRound(data);
        onRoundsChange([...rounds, created]);
      }
      resetForm();
    } catch (err) {
      setError("Failed to save round. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRound = async (roundId: number) => {
    if (!confirm("Are you sure you want to delete this round?")) return;

    setIsLoading(true);
    try {
      await interviewService.deleteRound(roundId);
      onRoundsChange(rounds.filter((r) => r.id !== roundId));
    } catch (err) {
      setError("Failed to delete round. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not scheduled";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <span>📋</span> Interview Rounds
        </h3>
        {!isAddingRound && !editingRoundId && (
          <Button
            variant="secondary"
            onClick={() => setIsAddingRound(true)}
            className="text-sm"
          >
            + Add Round
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Rounds Timeline */}
      {rounds.length === 0 && !isAddingRound ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No interview rounds recorded yet.</p>
          <button
            onClick={() => setIsAddingRound(true)}
            className="mt-2 text-indigo-600 hover:text-indigo-800 font-medium text-sm"
          >
            Add your first round
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {rounds.map((round, index) => (
            <div
              key={round.id}
              className={`relative pl-8 pb-4 ${
                index < rounds.length - 1 ? "border-l-2 border-gray-200 ml-3" : "ml-3"
              }`}
            >
              {/* Timeline dot */}
              <div
                className={`absolute left-0 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                  round.outcome === "passed"
                    ? "bg-green-100"
                    : round.outcome === "failed"
                    ? "bg-red-100"
                    : round.outcome === "cancelled"
                    ? "bg-orange-100"
                    : "bg-gray-100"
                }`}
              >
                {STAGE_ICONS[round.stage]}
              </div>

              {editingRoundId === round.id ? (
                // Edit form
                <div className="bg-white border border-indigo-200 rounded-lg p-4 shadow-sm">
                  <RoundForm
                    formData={formData}
                    setFormData={setFormData}
                    onSave={handleSaveRound}
                    onCancel={resetForm}
                    isLoading={isLoading}
                    isEditing
                  />
                </div>
              ) : (
                // Display round
                <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {round.stage_display}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            OUTCOME_COLORS[round.outcome]
                          }`}
                        >
                          {round.outcome_display}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDate(round.scheduled_date)}
                        {round.duration_minutes && (
                          <span className="ml-2">• {round.duration_minutes} min</span>
                        )}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditRound(round)}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteRound(round.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  {round.notes && (
                    <p className="mt-2 text-sm text-gray-600 bg-gray-50 rounded p-2">
                      {round.notes}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add new round form */}
      {isAddingRound && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Add Interview Round</h4>
          <RoundForm
            formData={formData}
            setFormData={setFormData}
            onSave={handleSaveRound}
            onCancel={resetForm}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  );
}

// Extracted form component for reuse
interface RoundFormProps {
  formData: {
    stage: RoundStage;
    scheduled_date: string;
    completed_date: string;
    duration_minutes: string;
    notes: string;
    outcome: RoundOutcome;
  };
  setFormData: React.Dispatch<React.SetStateAction<RoundFormProps["formData"]>>;
  onSave: () => void;
  onCancel: () => void;
  isLoading: boolean;
  isEditing?: boolean;
}

function RoundForm({
  formData,
  setFormData,
  onSave,
  onCancel,
  isLoading,
  isEditing = false,
}: RoundFormProps) {
  const stageOptions = ROUND_STAGE_OPTIONS.map(({ value, label }) => ({ value, label }));
  const outcomeOptions = ROUND_OUTCOME_OPTIONS.map(({ value, label }) => ({ value, label }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Stage"
          value={formData.stage}
          onChange={(e) => setFormData({ ...formData, stage: e.target.value as RoundStage })}
          options={stageOptions}
        />
        <Select
          label="Outcome"
          value={formData.outcome}
          onChange={(e) => setFormData({ ...formData, outcome: e.target.value as RoundOutcome })}
          options={outcomeOptions}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Scheduled Date"
          type="datetime-local"
          value={formData.scheduled_date}
          onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
        />
        <Input
          label="Completed Date"
          type="datetime-local"
          value={formData.completed_date}
          onChange={(e) => setFormData({ ...formData, completed_date: e.target.value })}
        />
      </div>

      <Input
        label="Duration (minutes)"
        type="number"
        value={formData.duration_minutes}
        onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
        placeholder="e.g., 45"
      />

      <Textarea
        label="Notes"
        value={formData.notes}
        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        placeholder="How did it go? What questions were asked? Any feedback?"
        rows={3}
      />

      <div className="flex gap-2 justify-end">
        <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={onSave} isLoading={isLoading}>
          {isEditing ? "Update Round" : "Add Round"}
        </Button>
      </div>
    </div>
  );
}
