// ============================================================================
// AP VIDYACONNECT — PERFORMANCE EVALUATIONS
// Weighted multi-criteria performance assessment engine (1-10 scales)
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import { db } from '../../services/dbStore';
import { PerformanceEvaluation } from '../../types/database';
import {
  Award,
  Users,
  CheckCircle2,
  Save,
  Star,
  Sparkles,
  TrendingUp,
  FileCheck2
} from 'lucide-react';

export const EvaluationsPage: React.FC = () => {
  const { currentRole, currentUser } = useAuth();
  const { showAlert } = useModal();
  const [evaluations, setEvaluations] = useState<PerformanceEvaluation[]>(db.evaluations);
  const [selectedStudentId, setSelectedStudentId] = useState(db.students[0]?.id || '');

  // 9 Configurable Criteria (1-10 scale)
  const [tech, setTech] = useState(10);
  const [comm, setComm] = useState(9);
  const [teamwork, setTeamwork] = useState(10);
  const [problemSolving, setProblemSolving] = useState(9);
  const [discipline, setDiscipline] = useState(10);
  const [attendance, setAttendance] = useState(10);
  const [taskComp, setTaskComp] = useState(9);
  const [learning, setLearning] = useState(10);
  const [professionalism, setProfessionalism] = useState(10);

  const [feedback, setFeedback] = useState('Outstanding performance across all core milestones. Highly recommended for direct placement.');
  const [recommendation, setRecommendation] = useState('Recommended for Direct Hire (PPO)');

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setEvaluations([...db.evaluations]);
    });
    return unsub;
  }, []);

  const isEvaluator = currentRole === 'company_admin' || (currentRole as string) === 'mentor' || currentRole === 'super_admin';

  // Calculate Weighted Overall (out of 100)
  const calculateOverall = () => {
    const sum = (tech * 1.5) + (comm * 1.0) + (teamwork * 1.0) + (problemSolving * 1.5) +
                (discipline * 1.0) + (attendance * 1.0) + (taskComp * 1.5) + (learning * 0.75) + (professionalism * 0.75);
    // Max sum is 100
    return Math.min(100, Math.round(sum * 10) / 10);
  };

  const weightedOverall = calculateOverall();

  const handleSaveEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const stu = db.students.find(s => s.id === selectedStudentId);

    db.saveEvaluation({
      batch_id: 'batch-001',
      student_id: selectedStudentId,
      student: stu,
      evaluated_by: currentUser.id,
      evaluated_by_name: currentUser.full_name,
      evaluation_type: 'final',
      technical_skills_score: tech,
      communication_score: comm,
      teamwork_score: teamwork,
      problem_solving_score: problemSolving,
      discipline_score: discipline,
      attendance_score: attendance,
      task_completion_score: taskComp,
      learning_ability_score: learning,
      professionalism_score: professionalism,
      weighted_overall_score: weightedOverall,
      written_feedback: feedback,
      mentor_recommendation: recommendation,
    }, currentUser);

    await showAlert({
      title: 'Performance Evaluation Saved!',
      subtitle: `Candidate: ${stu?.full_name || 'Selected Student'}`,
      type: 'success',
      badge: `Overall Score: ${weightedOverall}%`,
      confirmText: 'Done',
      message: 'The comprehensive 9-factor appraisal assessment has been signed and permanently recorded for state certification eligibility.',
      details: [
        { label: 'Student Roll', value: stu?.roll_number || '2023-CS-042' },
        { label: 'Recommendation', value: recommendation.replace(/_/g, ' ').toUpperCase() },
        { label: 'Evaluator', value: currentUser.full_name },
        { label: 'Certification Status', value: 'Ready for Issuance' }
      ]
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl border border-[#E3E6EB] p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0E2350]">
            Performance Evaluations
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Formal 9-factor weighted criteria evaluation for internship milestone appraisals and certification.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Scoring Matrix Form */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E3E6EB] p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="text-sm font-bold text-[#0E2350] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#F07421]" />
              Evaluation Matrix
            </h3>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded">
              Weighted Score: {weightedOverall}%
            </span>
          </div>

          <form onSubmit={handleSaveEvaluation} className="space-y-5 text-xs">
            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1">Select Candidate Student</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg font-bold text-[#0E2350]"
              >
                {db.students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name} ({s.roll_number}) — {s.cgpa} CGPA
                  </option>
                ))}
              </select>
            </div>

            {/* 9 Weighted Criteria Sliders */}
            <div className="space-y-3 pt-2">
              <p className="text-[10px] uppercase font-bold text-gray-400">Core Performance Criteria (Scale 1 to 10)</p>

              {[
                { label: '1. Technical Proficiency & Code Quality (Weight: 15%)', val: tech, set: setTech },
                { label: '2. Problem Solving & Algorithmic Thinking (Weight: 15%)', val: problemSolving, set: setProblemSolving },
                { label: '3. Task Completion & On-Time Delivery (Weight: 15%)', val: taskComp, set: setTaskComp },
                { label: '4. Communication & Presentation (Weight: 10%)', val: comm, set: setComm },
                { label: '5. Teamwork & Cross-functional Collaboration (Weight: 10%)', val: teamwork, set: setTeamwork },
                { label: '6. Work Discipline & SOP Adherence (Weight: 10%)', val: discipline, set: setDiscipline },
                { label: '7. Attendance & Punctuality Compliance (Weight: 10%)', val: attendance, set: setAttendance },
                { label: '8. Learning Agility & Adaptability (Weight: 7.5%)', val: learning, set: setLearning },
                { label: '9. Professional Demeanor & Ethics (Weight: 7.5%)', val: professionalism, set: setProfessionalism },
              ].map(({ label, val, set }, idx) => (
                <div key={idx} className="bg-[#F6F7F9] p-3 rounded-lg flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{label}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={val}
                      disabled={!isEvaluator}
                      onChange={(e) => set(Number(e.target.value))}
                      className="w-24 accent-[#0E2350]"
                    />
                    <span className="font-mono font-bold text-[#0E2350] w-6 text-right text-sm">
                      {val}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1">Company Evaluator Written Feedback</label>
              <textarea
                rows={3}
                required
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1">Corporate Recommendation</label>
              <input
                type="text"
                value={recommendation}
                onChange={(e) => setRecommendation(e.target.value)}
                className="w-full px-3 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg font-semibold text-[#0E2350]"
              />
            </div>

            {isEvaluator && (
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#0E2350] hover:bg-[#14336F] text-white rounded-lg font-bold shadow transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4 text-[#F07421]" />
                  Save Performance Evaluation
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Right 1 Col: Evaluation History Roster */}
        <div className="bg-white rounded-xl border border-[#E3E6EB] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h3 className="text-sm font-bold text-[#0E2350] flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[#1C8A3C]" />
              Completed Evaluations ({evaluations.length})
            </h3>
          </div>

          <div className="space-y-3">
            {evaluations.map((ev) => (
              <div
                key={ev.id}
                className="p-3.5 rounded-lg border border-gray-100 bg-[#F6F7F9]/70 space-y-2 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-gray-900">{ev.student?.full_name || 'Rahul Sharma'}</p>
                    <p className="text-[10px] text-gray-500 font-mono">By: {ev.evaluated_by_name}</p>
                  </div>
                  <span className="font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-xs border border-emerald-200">
                    {ev.weighted_overall_score}%
                  </span>
                </div>

                <p className="text-[11px] text-gray-600 line-clamp-2 italic">"{ev.written_feedback}"</p>
                <p className="text-[10px] font-bold text-[#F07421]">{ev.mentor_recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
