// ============================================================================
// AP VIDYACONNECT — TASKS & MILESTONE SUBMISSIONS
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import { db } from '../../services/dbStore';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Task, TaskSubmission } from '../../types/database';
import {
  CheckSquare,
  Plus,
  Clock,
  Github,
  ExternalLink,
  Award,
  CheckCircle2,
  FileText,
  X,
  MessageSquare
} from 'lucide-react';

export const TasksPage: React.FC = () => {
  const { currentRole, currentUser, currentStudent } = useAuth();
  const { showAlert } = useModal();
  const [tasks, setTasks] = useState<Task[]>(db.tasks);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTaskForSubmit, setSelectedTaskForSubmit] = useState<Task | null>(null);
  const [selectedSubmissionForGrade, setSelectedSubmissionForGrade] = useState<{ task: Task; submission: TaskSubmission } | null>(null);

  // New Task Form
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDeadline, setNewDeadline] = useState('2026-03-31T18:00');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('high');

  // Submit Task Form
  const [submitRepo, setSubmitRepo] = useState('https://github.com/rahul-sharma/kd-task-deliverable');
  const [submitLink, setSubmitLink] = useState('https://kd-demo.vercel.app');
  const [submitText, setSubmitText] = useState('Implemented all required state handlers and unit test suites.');

  // Grade Form
  const [gradeScore, setGradeScore] = useState(95);
  const [gradeFeedback, setGradeFeedback] = useState('Superb work on architecture and code comments.');

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setTasks([...db.tasks]);
    });
    return unsub;
  }, []);

  const isReviewer = currentRole === 'company_admin' || (currentRole as string) === 'mentor' || currentRole === 'super_admin';
  const isStudent = currentRole === 'student';

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    db.createTask('batch-001', {
      title: newTitle,
      description: newDesc,
      deadline: new Date(newDeadline).toISOString(),
      priority: newPriority,
      status: 'pending',
      expected_output: 'Working repository and test summary',
    }, currentUser);

    setShowCreateModal(false);
    setNewTitle('');
    setNewDesc('');
    showAlert({
      title: 'Milestone Task Published!',
      subtitle: 'Broadcasted to Enrolled Cohort',
      type: 'success',
      badge: 'Task Pipeline Active',
      message: 'The new milestone task and technical deliverables have been broadcasted to all enrolled batch interns.'
    });
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskForSubmit) return;

    const stu = currentStudent || db.students[0];
    db.submitTask(selectedTaskForSubmit.id, {
      student_id: stu.id,
      student: stu,
      submission_text: submitText,
      github_repo_url: submitRepo,
      links: [submitLink],
    }, stu);

    setSelectedTaskForSubmit(null);
    await showAlert({
      title: 'Milestone Deliverable Submitted!',
      subtitle: 'Recorded in Mentor Evaluation Queue',
      type: 'success',
      badge: 'Deliverable Uploaded',
      message: 'Your project repository and implementation artifacts have been successfully dispatched to your corporate supervisor for review and scoring.'
    });
  };

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmissionForGrade) return;

    db.gradeTaskSubmission(
      selectedSubmissionForGrade.task.id,
      selectedSubmissionForGrade.submission.student_id,
      gradeScore,
      gradeFeedback,
      currentUser
    );

    setSelectedSubmissionForGrade(null);
    await showAlert({
      title: 'Evaluation & Score Finalized!',
      subtitle: 'Student Progress Metric Updated',
      type: 'success',
      badge: `Score: ${gradeScore}/100`,
      message: `Performance grade and detailed supervisor feedback have been authenticated and logged to the student's internship ledger.`
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0E2350]">
            Milestones, Tasks & Submissions
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Industry project task pipelines, GitHub repository linking, and milestone evaluations.
          </p>
        </div>

        {isReviewer && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-[#F07421] hover:bg-[#D96214] text-white rounded-lg text-xs font-bold shadow transition-all flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Create Milestone Task
          </button>
        )}
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {tasks.map((task) => {
          const mySubmission = task.submissions?.find(s => s.student_id === (currentStudent?.id || 'stu-001'));

          return (
            <div
              key={task.id}
              className="bg-white rounded-xl border border-[#E3E6EB] p-5 shadow-sm space-y-4 hover:border-[#2A4E96]/30 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      task.priority === 'high' ? 'bg-rose-50 text-rose-700' : 'bg-[#FFF3EA] text-[#F07421]'
                    }`}>
                      Priority: {task.priority}
                    </span>
                    <span className="text-[11px] text-gray-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Deadline: {new Date(task.deadline).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#0E2350]">{task.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{task.description}</p>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {isStudent && (
                    mySubmission ? (
                      mySubmission.score !== undefined ? (
                        <div className="text-right">
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded border border-emerald-200 block">
                            Score: {mySubmission.score} / 100
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1.5 rounded border border-amber-200">
                          Submitted (Review Pending)
                        </span>
                      )
                    ) : (
                      <button
                        onClick={() => setSelectedTaskForSubmit(task)}
                        className="px-4 py-2 bg-[#0E2350] hover:bg-[#14336F] text-white rounded-lg text-xs font-bold transition-all shadow"
                      >
                        Submit Deliverables
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Submissions Roster (For Company Admins / Reviewers) */}
              {isReviewer && task.submissions && task.submissions.length > 0 && (
                <div className="pt-3 border-t border-gray-100 space-y-2">
                  <p className="text-[11px] uppercase font-bold text-gray-500">Student Submissions ({task.submissions.length})</p>
                  <div className="divide-y divide-gray-50">
                    {task.submissions.map((sub) => (
                      <div key={sub.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-[#F6F7F9]/70 p-3 rounded-lg">
                        <div>
                          <p className="font-bold text-gray-900">{sub.student?.full_name}</p>
                          <p className="text-[11px] text-gray-600 mt-0.5">{sub.submission_text}</p>
                          {sub.github_repo_url && (
                            <a
                              href={sub.github_repo_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-[#2A4E96] font-mono hover:underline flex items-center gap-1 mt-1"
                            >
                              <Github className="w-3.5 h-3.5" />
                              {sub.github_repo_url}
                            </a>
                          )}
                        </div>

                        <div className="shrink-0 flex items-center gap-2">
                          {sub.score !== undefined ? (
                            <span className="font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                              Graded: {sub.score}/100
                            </span>
                          ) : (
                            <button
                              onClick={() => setSelectedSubmissionForGrade({ task, submission: sub })}
                              className="px-3 py-1 bg-[#1C8A3C] hover:bg-emerald-800 text-white rounded font-bold transition-all"
                            >
                              Grade & Feedback
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-[#0E2350] flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-[#F07421]" />
                Create New Milestone Task
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Milestone 3: Cloud Database Migration & Stress Test"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Description & Deliverables</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detailed task description and acceptance criteria..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Submission Deadline</label>
                  <input
                    type="datetime-local"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg font-bold"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0E2350] hover:bg-[#14336F] text-white rounded-lg font-bold shadow"
                >
                  Publish Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Submit Modal */}
      {selectedTaskForSubmit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-[#0E2350] flex items-center gap-2">
                <Github className="w-4 h-4 text-[#0E2350]" />
                Submit Task: {selectedTaskForSubmit.title}
              </h3>
              <button onClick={() => setSelectedTaskForSubmit(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStudentSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">GitHub / Code Repository URL</label>
                <input
                  type="url"
                  required
                  value={submitRepo}
                  onChange={(e) => setSubmitRepo(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Live Demo / Deployment Link</label>
                <input
                  type="url"
                  value={submitLink}
                  onChange={(e) => setSubmitLink(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Submission Notes</label>
                <textarea
                  rows={3}
                  value={submitText}
                  onChange={(e) => setSubmitText(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTaskForSubmit(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0E2350] hover:bg-[#14336F] text-white rounded-lg font-bold shadow"
                >
                  Submit Deliverables
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grade Modal */}
      {selectedSubmissionForGrade && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-[#0E2350] flex items-center gap-2">
                <Award className="w-4 h-4 text-[#F07421]" />
                Grade Submission: {selectedSubmissionForGrade.submission.student?.full_name}
              </h3>
              <button onClick={() => setSelectedSubmissionForGrade(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGradeSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Score (Out of 100)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  required
                  value={gradeScore}
                  onChange={(e) => setGradeScore(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg text-lg font-bold text-emerald-800"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Company Supervisor Feedback & Remarks</label>
                <textarea
                  rows={3}
                  required
                  value={gradeFeedback}
                  onChange={(e) => setGradeFeedback(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSubmissionForGrade(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1C8A3C] hover:bg-emerald-800 text-white rounded-lg font-bold shadow"
                >
                  Save Grade & Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
