"use client";

import React, { useState, useEffect } from "react";
import { workoutPlanAPI, WorkoutPlan, WorkoutPlanExercise, exerciseAPI, Exercise } from "@/lib/api";

interface WorkoutBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editWorkoutPlan?: WorkoutPlan | null;
}

interface ExerciseFormData {
  exerciseId: string;
  sets: number;
  reps: string;
  restSeconds: number;
  notes: string;
}

const INITIAL_FORM_DATA = {
  title: "",
  description: "",
  difficulty: "Beginner",
  estimatedDuration: 30,
  status: "Draft",
  exercises: [] as WorkoutPlanExercise[],
};

const INITIAL_EXERCISE_FORM: ExerciseFormData = {
  exerciseId: "",
  sets: 3,
  reps: "10-12",
  restSeconds: 60,
  notes: "",
};

export default function WorkoutBuilderModal({ isOpen, onClose, onSuccess, editWorkoutPlan }: WorkoutBuilderModalProps) {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof typeof INITIAL_FORM_DATA, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Exercise search
  const [exerciseSearchTerm, setExerciseSearchTerm] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [exercisesLoading, setExercisesLoading] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [exerciseForm, setExerciseForm] = useState<ExerciseFormData>(INITIAL_EXERCISE_FORM);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);

  // Load exercises when search changes
  useEffect(() => {
    const fetchExercises = async () => {
      if (exerciseSearchTerm.length < 2) {
        setExercises([]);
        return;
      }
      
      setExercisesLoading(true);
      try {
        const response = await exerciseAPI.getExercises(1, 20, exerciseSearchTerm);
        if (response.success) {
          setExercises(response.data);
        }
      } catch (err: any) {
        console.error("Failed to fetch exercises:", err);
      } finally {
        setExercisesLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchExercises, 300);
    return () => clearTimeout(debounceTimer);
  }, [exerciseSearchTerm]);

  // Load edit data if editing
  useEffect(() => {
    if (editWorkoutPlan) {
      setFormData({
        title: editWorkoutPlan.title,
        description: editWorkoutPlan.description,
        difficulty: editWorkoutPlan.difficulty,
        estimatedDuration: editWorkoutPlan.estimatedDuration,
        status: editWorkoutPlan.status,
        exercises: editWorkoutPlan.exercises || [],
      });
    } else {
      setFormData(INITIAL_FORM_DATA);
    }
  }, [editWorkoutPlan, isOpen]);

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof typeof INITIAL_FORM_DATA, string>> = {};

    if (!formData.title.trim()) errors.title = "Title is required";
    if (formData.title.length < 2) errors.title = "Title must be at least 2 characters";
    if (!formData.description.trim()) errors.description = "Description is required";
    if (formData.description.length < 5) errors.description = "Description must be at least 5 characters";
    if (formData.estimatedDuration < 1) errors.estimatedDuration = "Duration must be at least 1 minute";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddExercise = () => {
    if (!selectedExerciseId) {
      alert("Please select an exercise");
      return;
    }

    const selectedExercise = exercises.find(ex => ex._id === selectedExerciseId);
    if (!selectedExercise) return;

    const newExercise: WorkoutPlanExercise = {
      exerciseId: selectedExerciseId,
      exerciseName: selectedExercise.name,
      exerciseCategory: selectedExercise.category,
      exerciseBodyPart: selectedExercise.bodyPart,
      exerciseEquipment: selectedExercise.equipment,
      exerciseDifficulty: selectedExercise.difficulty,
      sets: exerciseForm.sets,
      reps: exerciseForm.reps,
      restSeconds: exerciseForm.restSeconds,
      notes: exerciseForm.notes,
      order: formData.exercises.length,
    };

    setFormData({
      ...formData,
      exercises: [...formData.exercises, newExercise],
    });

    // Reset exercise form
    setSelectedExerciseId("");
    setExerciseForm(INITIAL_EXERCISE_FORM);
    setExerciseSearchTerm("");
    setExercises([]);
    setShowExerciseSelector(false);
  };

  const handleRemoveExercise = (index: number) => {
    const newExercises = formData.exercises.filter((_, i) => i !== index);
    // Reorder remaining exercises
    const reorderedExercises = newExercises.map((ex, i) => ({ ...ex, order: i }));
    setFormData({ ...formData, exercises: reorderedExercises });
  };

  const handleMoveExercise = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === formData.exercises.length - 1) return;

    const newExercises = [...formData.exercises];
    const temp = newExercises[index];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    newExercises[index] = newExercises[targetIndex];
    newExercises[targetIndex] = temp;

    // Update order
    const reorderedExercises = newExercises.map((ex, i) => ({ ...ex, order: i }));
    setFormData({ ...formData, exercises: reorderedExercises });
  };

  const handleUpdateExercise = (index: number, field: keyof WorkoutPlanExercise, value: any) => {
    const newExercises = [...formData.exercises];
    newExercises[index] = { ...newExercises[index], [field]: value };
    setFormData({ ...formData, exercises: newExercises });
  };

  const handleSave = async (status: "Draft" | "Published") => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const dataToSubmit = {
        ...formData,
        status,
        exercises: formData.exercises.map(ex => ({
          exerciseId: ex.exerciseId,
          sets: ex.sets,
          reps: ex.reps,
          restSeconds: ex.restSeconds,
          notes: ex.notes,
          order: ex.order,
        })),
      };

      if (editWorkoutPlan) {
        await workoutPlanAPI.updateWorkoutPlan(editWorkoutPlan._id || editWorkoutPlan.id || "", dataToSubmit);
      } else {
        await workoutPlanAPI.createWorkoutPlan(dataToSubmit);
      }

      onSuccess();
      onClose();
      setFormData(INITIAL_FORM_DATA);
      setFormErrors({});
    } catch (err: any) {
      alert(err.message || "Failed to save workout plan");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">
            {editWorkoutPlan ? "Edit Workout Plan" : "Create Workout Plan"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-yellow-400 uppercase tracking-wider">Basic Information</h3>
            
            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={`w-full bg-zinc-950 border ${formErrors.title ? 'border-red-500' : 'border-zinc-800'} focus:border-yellow-500 text-sm text-white rounded-xl px-4 py-2.5 focus:outline-none transition-all`}
                placeholder="Enter workout title"
              />
              {formErrors.title && <p className="text-red-400 text-xs mt-1">{formErrors.title}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className={`w-full bg-zinc-950 border ${formErrors.description ? 'border-red-500' : 'border-zinc-800'} focus:border-yellow-500 text-sm text-white rounded-xl px-4 py-2.5 focus:outline-none transition-all resize-none`}
                placeholder="Enter workout description"
              />
              {formErrors.description && <p className="text-red-400 text-xs mt-1">{formErrors.description}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Difficulty</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                  className={`w-full bg-zinc-950 border ${formErrors.difficulty ? 'border-red-500' : 'border-zinc-800'} focus:border-yellow-500 text-sm text-white rounded-xl px-4 py-2.5 focus:outline-none transition-all cursor-pointer`}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Estimated Duration (minutes)</label>
                <input
                  type="number"
                  value={formData.estimatedDuration}
                  onChange={(e) => setFormData({ ...formData, estimatedDuration: parseInt(e.target.value) || 0 })}
                  min="1"
                  className={`w-full bg-zinc-950 border ${formErrors.estimatedDuration ? 'border-red-500' : 'border-zinc-800'} focus:border-yellow-500 text-sm text-white rounded-xl px-4 py-2.5 focus:outline-none transition-all`}
                  placeholder="30"
                />
                {formErrors.estimatedDuration && <p className="text-red-400 text-xs mt-1">{formErrors.estimatedDuration}</p>}
              </div>
            </div>
          </div>

          {/* Exercise Selector */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-yellow-400 uppercase tracking-wider">Add Exercises</h3>
            
            {!showExerciseSelector ? (
              <button
                onClick={() => setShowExerciseSelector(true)}
                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 hover:border-yellow-500/40 text-zinc-400 hover:text-white text-sm font-semibold rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Exercise
              </button>
            ) : (
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-4">
                {/* Exercise Search */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Search exercises..."
                    value={exerciseSearchTerm}
                    onChange={(e) => setExerciseSearchTerm(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 focus:border-yellow-500 text-sm text-white rounded-xl pl-10 pr-4 py-2.5 focus:outline-none transition-all"
                  />
                </div>

                {/* Exercise List */}
                {exercisesLoading ? (
                  <div className="text-center py-4 text-zinc-500 text-sm">Loading exercises...</div>
                ) : exercises.length === 0 ? (
                  <div className="text-center py-4 text-zinc-500 text-sm">
                    {exerciseSearchTerm.length < 2 ? "Type at least 2 characters to search" : "No exercises found"}
                  </div>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {exercises.map((exercise) => (
                      <button
                        key={exercise._id}
                        onClick={() => {
                          setSelectedExerciseId(exercise._id || "");
                          setExerciseSearchTerm(exercise.name);
                          setExercises([]);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                          selectedExerciseId === exercise._id
                            ? "bg-yellow-500/20 border border-yellow-500/40 text-white"
                            : "bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-sm">{exercise.name}</p>
                            <p className="text-xs text-zinc-500 mt-1">
                              {exercise.category} • {exercise.bodyPart} • {exercise.difficulty}
                            </p>
                          </div>
                          {selectedExerciseId === exercise._id && (
                            <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Exercise Configuration */}
                {selectedExerciseId && (
                  <div className="border-t border-zinc-800 pt-4 space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Sets</label>
                        <input
                          type="number"
                          value={exerciseForm.sets}
                          onChange={(e) => setExerciseForm({ ...exerciseForm, sets: parseInt(e.target.value) || 1 })}
                          min="1"
                          className="w-full bg-zinc-900 border border-zinc-700 focus:border-yellow-500 text-sm text-white rounded-lg px-3 py-2 focus:outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Reps</label>
                        <input
                          type="text"
                          value={exerciseForm.reps}
                          onChange={(e) => setExerciseForm({ ...exerciseForm, reps: e.target.value })}
                          className="w-full bg-zinc-900 border border-zinc-700 focus:border-yellow-500 text-sm text-white rounded-lg px-3 py-2 focus:outline-none transition-all"
                          placeholder="10-12"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Rest (sec)</label>
                        <input
                          type="number"
                          value={exerciseForm.restSeconds}
                          onChange={(e) => setExerciseForm({ ...exerciseForm, restSeconds: parseInt(e.target.value) || 0 })}
                          min="0"
                          className="w-full bg-zinc-900 border border-zinc-700 focus:border-yellow-500 text-sm text-white rounded-lg px-3 py-2 focus:outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Notes (optional)</label>
                      <input
                        type="text"
                        value={exerciseForm.notes}
                        onChange={(e) => setExerciseForm({ ...exerciseForm, notes: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-700 focus:border-yellow-500 text-sm text-white rounded-lg px-3 py-2 focus:outline-none transition-all"
                        placeholder="Form cues, tips, etc."
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddExercise}
                        className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black text-xs font-bold rounded-lg uppercase tracking-wider transition-colors"
                      >
                        Add to Workout
                      </button>
                      <button
                        onClick={() => {
                          setSelectedExerciseId("");
                          setExerciseForm(INITIAL_EXERCISE_FORM);
                          setExerciseSearchTerm("");
                          setExercises([]);
                          setShowExerciseSelector(false);
                        }}
                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white text-xs font-bold rounded-lg uppercase tracking-wider transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Exercise List */}
          {formData.exercises.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-yellow-400 uppercase tracking-wider">
                Exercises ({formData.exercises.length})
              </h3>
              <div className="space-y-3">
                {formData.exercises.map((exercise, index) => (
                  <div key={index} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-bold flex items-center justify-center">
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-semibold text-white text-sm">{exercise.exerciseName}</p>
                            <p className="text-xs text-zinc-500">
                              {exercise.exerciseCategory} • {exercise.exerciseBodyPart}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-3">
                          <div>
                            <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Sets</label>
                            <input
                              type="number"
                              value={exercise.sets}
                              onChange={(e) => handleUpdateExercise(index, "sets", parseInt(e.target.value) || 1)}
                              min="1"
                              className="w-full bg-zinc-900 border border-zinc-700 focus:border-yellow-500 text-xs text-white rounded-lg px-2 py-1.5 focus:outline-none transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Reps</label>
                            <input
                              type="text"
                              value={exercise.reps}
                              onChange={(e) => handleUpdateExercise(index, "reps", e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 focus:border-yellow-500 text-xs text-white rounded-lg px-2 py-1.5 focus:outline-none transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Rest (sec)</label>
                            <input
                              type="number"
                              value={exercise.restSeconds}
                              onChange={(e) => handleUpdateExercise(index, "restSeconds", parseInt(e.target.value) || 0)}
                              min="0"
                              className="w-full bg-zinc-900 border border-zinc-700 focus:border-yellow-500 text-xs text-white rounded-lg px-2 py-1.5 focus:outline-none transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">Notes</label>
                            <input
                              type="text"
                              value={exercise.notes || ""}
                              onChange={(e) => handleUpdateExercise(index, "notes", e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-700 focus:border-yellow-500 text-xs text-white rounded-lg px-2 py-1.5 focus:outline-none transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => handleMoveExercise(index, "up")}
                          disabled={index === 0}
                          className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-30 disabled:hover:text-zinc-500 disabled:hover:bg-transparent"
                          title="Move Up"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleMoveExercise(index, "down")}
                          disabled={index === formData.exercises.length - 1}
                          className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-30 disabled:hover:text-zinc-500 disabled:hover:bg-transparent"
                          title="Move Down"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleRemoveExercise(index)}
                          className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Remove"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-zinc-800 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white text-xs font-bold rounded-xl uppercase tracking-wider transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => handleSave("Draft")}
            disabled={isSubmitting || formData.exercises.length === 0}
            className="flex-1 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-xl uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Saving..." : "Save as Draft"}
          </button>
          <button
            onClick={() => handleSave("Published")}
            disabled={isSubmitting || formData.exercises.length === 0}
            className="flex-1 px-4 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-black text-xs font-bold rounded-xl uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Publishing..." : "Publish Workout"}
          </button>
        </div>
      </div>
    </div>
  );
}
