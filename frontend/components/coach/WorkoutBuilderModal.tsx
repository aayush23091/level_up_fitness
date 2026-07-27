"use client";

import React, { useState, useEffect } from "react";
import { workoutPlanAPI, WorkoutPlan, WorkoutPlanExercise } from "@/lib/api";

interface WorkoutBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editWorkoutPlan?: WorkoutPlan | null;
}

interface ExerciseFormData {
  exerciseName: string;
  category: string;
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
  // Can be either an existing URL/base64 string (editing) OR the selected File (new upload)
  coverImage: "" as string | File | undefined,
};

const INITIAL_EXERCISE_FORM: ExerciseFormData = {
  exerciseName: "",
  category: "Chest",
  sets: 3,
  reps: "10-12",
  restSeconds: 60,
  notes: "",
};

export default function WorkoutBuilderModal({ isOpen, onClose, onSuccess, editWorkoutPlan }: WorkoutBuilderModalProps) {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof typeof INITIAL_FORM_DATA, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manual exercise form
  const [exerciseForm, setExerciseForm] = useState<ExerciseFormData>(INITIAL_EXERCISE_FORM);
  const [showExerciseForm, setShowExerciseForm] = useState(false);

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
        coverImage: editWorkoutPlan.coverImage || "",
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
    if (!exerciseForm.exerciseName.trim()) {
      alert("Please enter an exercise name");
      return;
    }

    const newExercise: WorkoutPlanExercise = {
      exerciseName: exerciseForm.exerciseName,
      category: exerciseForm.category,
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
    setExerciseForm(INITIAL_EXERCISE_FORM);
    setShowExerciseForm(false);
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

  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Keep File for upload and create preview URL separately
    const previewUrl = URL.createObjectURL(file);
    // store preview URL on the File object for rendering
    (file as any).__previewUrl = previewUrl;
    setFormData({ ...formData, coverImage: file });
  };

  const handleRemoveCoverImage = () => {
    setFormData({ ...formData, coverImage: "" });
  };

  const handleSave = async (status: "Draft" | "Published") => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      
      // Add basic fields
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("difficulty", formData.difficulty);
      formDataToSend.append("estimatedDuration", formData.estimatedDuration.toString());
      formDataToSend.append("status", status);
      
      // Add exercises as JSON
      formDataToSend.append("exercises", JSON.stringify(formData.exercises.map(ex => ({
        exerciseName: ex.exerciseName,
        category: ex.category,
        sets: ex.sets,
        reps: ex.reps,
        restSeconds: ex.restSeconds,
        notes: ex.notes,
        order: ex.order,
      }))));

      // Add cover image
      // - If it's an existing string (URL/base64), backend may already handle it (previous behavior)
      // - If it's a File, append directly
      if (formData.coverImage) {
        if (typeof formData.coverImage === "string") {
          // Existing base64 data URL
          if (formData.coverImage.startsWith("data:")) {
            const response = await fetch(formData.coverImage);
            const blob = await response.blob();
            formDataToSend.append("coverImage", blob);
          }
        } else {
          // Newly selected file
          formDataToSend.append("coverImage", formData.coverImage);
        }
      }

      if (editWorkoutPlan) {
        await workoutPlanAPI.updateWorkoutPlan(editWorkoutPlan._id || editWorkoutPlan.id || "", formDataToSend as any);
      } else {
        await workoutPlanAPI.createWorkoutPlan(formDataToSend as any);
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
      <div className="bg-card-secondary border border-border rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">
            {editWorkoutPlan ? "Edit Workout Plan" : "Create Workout Plan"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-muted hover:text-foreground hover:bg-card-secondary rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Cover Image */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-accent uppercase tracking-wider">Workout Cover Image</h3>
            
            {formData.coverImage ? (
              <div className="relative group">
                <img
                  src={
                    typeof formData.coverImage === "string"
                      ? formData.coverImage
                      : (formData.coverImage as any).__previewUrl || URL.createObjectURL(formData.coverImage as File)
                  }
                  alt="Workout cover"
                  className="w-full h-48 object-cover rounded-xl border border-border"
                />
                <button
                  onClick={handleRemoveCoverImage}
                  className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-600 text-foreground rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-accent/40 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageUpload}
                  className="hidden"
                  id="coverImageInput"
                />
                <label
                  htmlFor="coverImageInput"
                  className="cursor-pointer flex flex-col items-center gap-3"
                >
                  <svg className="w-8 h-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-muted">Click to upload cover image</span>
                  <span className="text-xs text-muted">PNG, JPG up to 5MB</span>
                </label>
              </div>
            )}
          </div>

          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-accent uppercase tracking-wider">Basic Information</h3>
            
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={`w-full bg-background border ${formErrors.title ? 'border-red-500' : 'border-border'} focus:border-accent text-sm text-foreground rounded-xl px-4 py-2.5 focus:outline-none transition-all`}
                placeholder="Enter workout title"
              />
              {formErrors.title && <p className="text-red-400 text-xs mt-1">{formErrors.title}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className={`w-full bg-background border ${formErrors.description ? 'border-red-500' : 'border-border'} focus:border-accent text-sm text-foreground rounded-xl px-4 py-2.5 focus:outline-none transition-all resize-none`}
                placeholder="Enter workout description"
              />
              {formErrors.description && <p className="text-red-400 text-xs mt-1">{formErrors.description}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Difficulty</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                  className={`w-full bg-background border ${formErrors.difficulty ? 'border-red-500' : 'border-border'} focus:border-accent text-sm text-foreground rounded-xl px-4 py-2.5 focus:outline-none transition-all cursor-pointer`}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Estimated Duration (minutes)</label>
                <input
                  type="number"
                  value={formData.estimatedDuration}
                  onChange={(e) => setFormData({ ...formData, estimatedDuration: parseInt(e.target.value) || 0 })}
                  min="1"
                  className={`w-full bg-background border ${formErrors.estimatedDuration ? 'border-red-500' : 'border-border'} focus:border-accent text-sm text-foreground rounded-xl px-4 py-2.5 focus:outline-none transition-all`}
                  placeholder="30"
                />
                {formErrors.estimatedDuration && <p className="text-red-400 text-xs mt-1">{formErrors.estimatedDuration}</p>}
              </div>
            </div>
          </div>

          {/* Exercise Form */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-accent uppercase tracking-wider">Add Exercises</h3>

            {!showExerciseForm ? (
              <button
                onClick={() => setShowExerciseForm(true)}
                className="w-full px-4 py-3 bg-background border border-border hover:border-accent/40 text-muted hover:text-foreground text-sm font-semibold rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Exercise
              </button>
            ) : (
              <div className="bg-background border border-border rounded-xl p-4 space-y-4">
                {/* Exercise Name */}
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Exercise Name</label>
                  <input
                    type="text"
                    value={exerciseForm.exerciseName}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, exerciseName: e.target.value })}
                    className="w-full bg-card-secondary border border-border focus:border-accent text-sm text-foreground rounded-xl px-4 py-2.5 focus:outline-none transition-all"
                    placeholder="e.g., Bench Press"
                  />
                </div>

                {/* Category Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Category</label>
                  <select
                    value={exerciseForm.category}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, category: e.target.value })}
                    className="w-full bg-card-secondary border border-border focus:border-accent text-sm text-foreground rounded-xl px-4 py-2.5 focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="Chest">Chest</option>
                    <option value="Back">Back</option>
                    <option value="Legs">Legs</option>
                    <option value="Shoulders">Shoulders</option>
                    <option value="Arms">Arms</option>
                    <option value="Core">Core</option>
                    <option value="Cardio">Cardio</option>
                    <option value="Full Body">Full Body</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Sets, Reps, Rest */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">Sets</label>
                    <input
                      type="number"
                      value={exerciseForm.sets}
                      onChange={(e) => setExerciseForm({ ...exerciseForm, sets: parseInt(e.target.value) || 1 })}
                      min="1"
                      className="w-full bg-card-secondary border border-border focus:border-accent text-sm text-foreground rounded-lg px-3 py-2 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">Reps</label>
                    <input
                      type="text"
                      value={exerciseForm.reps}
                      onChange={(e) => setExerciseForm({ ...exerciseForm, reps: e.target.value })}
                      className="w-full bg-card-secondary border border-border focus:border-accent text-sm text-foreground rounded-lg px-3 py-2 focus:outline-none transition-all"
                      placeholder="10-12"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">Rest (sec)</label>
                    <input
                      type="number"
                      value={exerciseForm.restSeconds}
                      onChange={(e) => setExerciseForm({ ...exerciseForm, restSeconds: parseInt(e.target.value) || 0 })}
                      min="0"
                      className="w-full bg-card-secondary border border-border focus:border-accent text-sm text-foreground rounded-lg px-3 py-2 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">Notes (optional)</label>
                  <textarea
                    value={exerciseForm.notes}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, notes: e.target.value })}
                    rows={2}
                    className="w-full bg-card-secondary border border-border focus:border-accent text-sm text-foreground rounded-lg px-3 py-2 focus:outline-none transition-all resize-none"
                    placeholder="Form cues, tips, etc."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={handleAddExercise}
                    className="flex-1 px-4 py-2 bg-accent hover:bg-accent/90 text-gray-900 text-xs font-bold rounded-lg uppercase tracking-wider transition-colors"
                  >
                    Add to Workout
                  </button>
                  <button
                    onClick={() => {
                      setExerciseForm(INITIAL_EXERCISE_FORM);
                      setShowExerciseForm(false);
                    }}
                    className="px-4 py-2 bg-card-secondary hover:bg-card-secondary text-muted hover:text-foreground text-xs font-bold rounded-lg uppercase tracking-wider transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Exercise List */}
          {formData.exercises.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-accent uppercase tracking-wider">
                Exercises ({formData.exercises.length})
              </h3>
              <div className="space-y-3">
                {formData.exercises.map((exercise, index) => (
                  <div key={index} className="bg-background border border-border rounded-xl p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-accent/20 text-accent text-xs font-bold flex items-center justify-center">
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-semibold text-foreground text-sm">{exercise.exerciseName}</p>
                            <p className="text-xs text-muted">
                              {exercise.category}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-3">
                          <div>
                            <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">Sets</label>
                            <input
                              type="number"
                              value={exercise.sets}
                              onChange={(e) => handleUpdateExercise(index, "sets", parseInt(e.target.value) || 1)}
                              min="1"
                              className="w-full bg-card-secondary border border-border focus:border-accent text-xs text-foreground rounded-lg px-2 py-1.5 focus:outline-none transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">Reps</label>
                            <input
                              type="text"
                              value={exercise.reps}
                              onChange={(e) => handleUpdateExercise(index, "reps", e.target.value)}
                              className="w-full bg-card-secondary border border-border focus:border-accent text-xs text-foreground rounded-lg px-2 py-1.5 focus:outline-none transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">Rest (sec)</label>
                            <input
                              type="number"
                              value={exercise.restSeconds}
                              onChange={(e) => handleUpdateExercise(index, "restSeconds", parseInt(e.target.value) || 0)}
                              min="0"
                              className="w-full bg-card-secondary border border-border focus:border-accent text-xs text-foreground rounded-lg px-2 py-1.5 focus:outline-none transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">Notes</label>
                            <input
                              type="text"
                              value={exercise.notes || ""}
                              onChange={(e) => handleUpdateExercise(index, "notes", e.target.value)}
                              className="w-full bg-card-secondary border border-border focus:border-accent text-xs text-foreground rounded-lg px-2 py-1.5 focus:outline-none transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => handleMoveExercise(index, "up")}
                          disabled={index === 0}
                          className="p-1.5 text-muted hover:text-foreground hover:bg-card-secondary rounded-lg transition-colors disabled:opacity-30 disabled:hover:text-muted disabled:hover:bg-transparent"
                          title="Move Up"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleMoveExercise(index, "down")}
                          disabled={index === formData.exercises.length - 1}
                          className="p-1.5 text-muted hover:text-foreground hover:bg-card-secondary rounded-lg transition-colors disabled:opacity-30 disabled:hover:text-muted disabled:hover:bg-transparent"
                          title="Move Down"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleRemoveExercise(index)}
                          className="p-1.5 text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
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
        <div className="p-6 border-t border-border flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-background border border-border hover:border-accent/40 text-muted hover:text-foreground text-xs font-bold rounded-xl uppercase tracking-wider transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => handleSave("Draft")}
            disabled={isSubmitting || formData.exercises.length === 0}
            className="flex-1 px-4 py-2.5 bg-card-secondary hover:bg-card-secondary text-foreground text-xs font-bold rounded-xl uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Saving..." : "Save as Draft"}
          </button>
          <button
            onClick={() => handleSave("Published")}
            disabled={isSubmitting || formData.exercises.length === 0}
            className="flex-1 px-4 py-2.5 bg-accent hover:bg-accent/90 text-gray-900 text-xs font-bold rounded-xl uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Publishing..." : "Publish Workout"}
          </button>
        </div>
      </div>
    </div>
  );
}
