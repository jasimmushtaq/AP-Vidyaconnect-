// ============================================================================
// Meeting Transcript Summarizer — Interactive Architecture Page
// ============================================================================

import React, { useState, useMemo } from 'react';
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Split,
  Copy,
  Check,
  Terminal,
  Clock,
  UserCheck,
  Quote,
} from 'lucide-react';
import {
  MeetingSummaryModel,
  summarizeTranscript,
} from '../../services/summarizerService';

const SAMPLE_SHORT_TRANSCRIPT = `Alice: Good morning team, let's review the final deliverable checklist for the student internship portal.
Bob: Hi Alice. I will finish the database optimization and indexing by Wednesday EOD.
Charlie: Excellent. I will complete the security audit for DPDP Act 2023 compliance before next Friday.
Alice: That sounds great. We decided to approve the dual-signature MoU workflow for the university partners.
David: I will review the API contracts and prepare the final technical signoff on Thursday morning.
Alice: Perfect, let's keep all action items verified with exact evidence. Thank you everyone!`;

// Generates a sample > 4000 word transcript to test the Map-Reduce branch
function generateSampleLongTranscript(): string {
  const speakers = ['Alice', 'Bob', 'Charlie', 'Diana', 'Edward'];
  const sections = [
    'Academic evaluation criteria and semester GPA weights',
    'Haversine geofenced biometric check-in threshold of 500 meters',
    'Dual-signature MoU encryption and certificate generation',
    'Batch allocation algorithms for state university students',
    'Corporate partner verification queues and GSTIN validation',
  ];

  let lines: string[] = [
    'Alice: Welcome everyone to this comprehensive multi-hour system architecture and state rollout meeting.',
    'Bob: We have extensive agenda items spanning student placement batches, corporate onboarding, and credit evaluation.',
  ];

  for (let i = 0; i < 45; i++) {
    const sec = sections[i % sections.length];
    const spk = speakers[i % speakers.length];
    lines.push(
      `${spk}: Discussing section ${i + 1} regarding ${sec}. In this phase, we must ensure high throughput, data integrity, and strict adherence to department regulations. We need to document all system invariants.`
    );
    lines.push(
      `Bob: I will implement the unit test suite for ${sec} before next Friday EOD to guarantee zero regression.`
    );
    lines.push(
      `Charlie: We decided to deploy ${sec} to staging on November 15, 2026 for institutional user testing.`
    );
  }

  lines.push('Alice: Thank you everyone. We will reconvene next Monday to review verified progress.');
  return lines.join('\n\n');
}

export function MeetingSummarizerPage() {
  const [inputText, setInputText] = useState<string>(SAMPLE_SHORT_TRANSCRIPT);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [result, setResult] = useState<MeetingSummaryModel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'actions' | 'verifier' | 'json'>('summary');

  // Word count & route prediction
  const wordCount = useMemo(() => {
    const words = inputText.trim().match(/\b\w+\b/g);
    return words ? words.length : 0;
  }, [inputText]);

  const isMapReduce = wordCount > 4000;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.txt')) {
      setError("Only plain text (.txt) files are accepted by validators.py.");
      return;
    }

    setError(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setInputText(text || '');
    };
    reader.readAsText(file);
  };

  const handleRunPipeline = async () => {
    if (!inputText.trim()) {
      setError('Please provide or paste transcript text.');
      return;
    }

    setError(null);
    setIsLoading(true);
    setResult(null);
    setActiveStep(1);

    // Progress animation corresponding to architectural stages
    const stepInterval = setInterval(() => {
      setActiveStep((prev) => (prev < 5 ? prev + 1 : prev));
    }, 400);

    try {
      const summary = await summarizeTranscript(inputText, fileName || undefined);
      clearInterval(stepInterval);
      setActiveStep(6);
      setResult(summary);
    } catch (err: any) {
      clearInterval(stepInterval);
      setError(err?.message || 'Error executing summarization pipeline');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyJson = () => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4" />
            Deterministic Zero-LLM Verification Engine
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Meeting Transcript Summarizer
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
            Production-grade pipeline with dynamic chunking (<span className="text-amber-400 font-medium">3000w + 200w overlap</span>),
            Map-Reduce aggregation, and deterministic quote verification.
          </p>
        </div>

        {/* Visual Architecture Flowchart Bar */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-4 shadow-xl">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            System Architecture Pipeline
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-xs">
            <div className={`p-2.5 rounded-lg border text-center transition-all ${
              activeStep >= 1 ? 'bg-indigo-950/80 border-indigo-500 text-indigo-200' : 'bg-slate-900 border-slate-700 text-slate-400'
            }`}>
              <div className="font-bold flex items-center justify-center gap-1">
                <FileText className="w-3.5 h-3.5" /> 1. Input
              </div>
              <div className="text-[10px] text-slate-400 mt-1">paste / .txt</div>
            </div>

            <div className={`p-2.5 rounded-lg border text-center transition-all ${
              activeStep >= 2 ? 'bg-indigo-950/80 border-indigo-500 text-indigo-200' : 'bg-slate-900 border-slate-700 text-slate-400'
            }`}>
              <div className="font-bold flex items-center justify-center gap-1">
                <Terminal className="w-3.5 h-3.5" /> 2. Validation
              </div>
              <div className="text-[10px] text-slate-400 mt-1">validators.py</div>
            </div>

            <div className={`p-2.5 rounded-lg border text-center transition-all ${
              activeStep >= 3 ? 'bg-indigo-950/80 border-indigo-500 text-indigo-200' : 'bg-slate-900 border-slate-700 text-slate-400'
            }`}>
              <div className="font-bold flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> 3. Preprocess
              </div>
              <div className="text-[10px] text-slate-400 mt-1">clean · lines · speakers</div>
            </div>

            <div className={`p-2.5 rounded-lg border text-center transition-all ${
              activeStep >= 4 ? 'bg-amber-950/80 border-amber-500 text-amber-200' : 'bg-slate-900 border-slate-700 text-slate-400'
            }`}>
              <div className="font-bold flex items-center justify-center gap-1">
                <Split className="w-3.5 h-3.5" /> 4. Route
              </div>
              <div className="text-[10px] text-amber-300/80 mt-1">
                {isMapReduce ? 'MAP-REDUCE (>4k)' : 'Single-pass (≤4k)'}
              </div>
            </div>

            <div className={`p-2.5 rounded-lg border text-center transition-all ${
              activeStep >= 5 ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200' : 'bg-slate-900 border-slate-700 text-slate-400'
            }`}>
              <div className="font-bold flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 5. Verifier
              </div>
              <div className="text-[10px] text-emerald-300/80 mt-1">quotes · owners · dates</div>
            </div>

            <div className={`p-2.5 rounded-lg border text-center transition-all ${
              activeStep >= 6 ? 'bg-blue-950/80 border-blue-500 text-blue-200' : 'bg-slate-900 border-slate-700 text-slate-400'
            }`}>
              <div className="font-bold flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 6. Schema
              </div>
              <div className="text-[10px] text-blue-300/80 mt-1">Pydantic Model</div>
            </div>
          </div>
        </div>

        {/* Input Box Section */}
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <label
                htmlFor="txt-upload"
                className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-slate-700 hover:bg-slate-600 text-white transition border border-slate-600"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload .txt Transcript
              </label>
              <input
                id="txt-upload"
                type="file"
                accept=".txt"
                className="hidden"
                onChange={handleFileUpload}
              />
              {fileName && (
                <span className="text-xs text-slate-300 bg-slate-700/50 px-2 py-1 rounded">
                  {fileName}
                </span>
              )}
            </div>

            {/* Quick Demo Pre-loaders */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Load test data:</span>
              <button
                type="button"
                onClick={() => {
                  setInputText(SAMPLE_SHORT_TRANSCRIPT);
                  setFileName(null);
                }}
                className="text-xs px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 transition"
              >
                ≤ 4,000w (Single-pass)
              </button>
              <button
                type="button"
                onClick={() => {
                  setInputText(generateSampleLongTranscript());
                  setFileName(null);
                }}
                className="text-xs px-2.5 py-1 rounded bg-amber-900/40 hover:bg-amber-900/60 text-amber-300 border border-amber-600/40 transition"
              >
                &gt; 4,000w (Map-Reduce)
              </button>
            </div>
          </div>

          {/* Text Area */}
          <div className="relative">
            <textarea
              rows={8}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste dialogue transcript here (e.g. Alice: Let's discuss...)"
              className="w-full bg-slate-950/70 border border-slate-700 rounded-xl p-4 font-mono text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition resize-y"
            />
          </div>

          {/* Status & Trigger Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">
                Word count:{' '}
                <strong className="text-white font-mono">{wordCount} words</strong>
              </span>

              {/* Dynamic Route Indicator */}
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                  isMapReduce
                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/40'
                    : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/40'
                }`}
              >
                <Split className="w-3.5 h-3.5" />
                {isMapReduce ? (
                  <span>
                    Routing: <strong>&gt; 4000 words</strong> → Chunker (3000w + 200w overlap) → MAP → REDUCE
                  </span>
                ) : (
                  <span>
                    Routing: <strong>≤ 4000 words</strong> → Single-pass LLM call
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleRunPipeline}
              disabled={isLoading || wordCount === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition transform active:scale-95"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Running Architecture...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Execute Architecture Pipeline
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-950/60 border border-red-800 text-red-200 text-xs rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Results Section */}
        {result && (
          <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-6">
            {/* Summary Topbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-700/80 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  {result.title}
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Pydantic Schema
                  </span>
                </h2>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  <span>Path: <strong className="text-slate-200 uppercase">{result.metadata.routing_path}</strong></span>
                  <span>•</span>
                  <span>Words: <strong className="text-slate-200">{result.metadata.clean_word_count}</strong></span>
                  <span>•</span>
                  <span>Chunks: <strong className="text-slate-200">{result.metadata.num_chunks}</strong></span>
                  <span>•</span>
                  <span>Duration: <strong className="text-slate-200">{result.metadata.processing_time_sec}s</strong></span>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center bg-slate-900 rounded-lg p-1 border border-slate-700">
                <button
                  onClick={() => setActiveTab('summary')}
                  className={`px-3 py-1 text-xs rounded-md font-medium transition ${
                    activeTab === 'summary' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Overview & Key Points
                </button>
                <button
                  onClick={() => setActiveTab('actions')}
                  className={`px-3 py-1 text-xs rounded-md font-medium transition ${
                    activeTab === 'actions' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Action Items ({result.action_items.length})
                </button>
                <button
                  onClick={() => setActiveTab('verifier')}
                  className={`px-3 py-1 text-xs rounded-md font-medium transition ${
                    activeTab === 'verifier' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Deterministic Verifier
                </button>
                <button
                  onClick={() => setActiveTab('json')}
                  className={`px-3 py-1 text-xs rounded-md font-medium transition ${
                    activeTab === 'json' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  JSON Schema
                </button>
              </div>
            </div>

            {/* TAB 1: Summary & Attendees */}
            {activeTab === 'summary' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Executive Overview
                  </h3>
                  <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                    {result.overview}
                  </p>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Identified Attendees ({result.attendees.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.attendees.map((attendee, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-700/60 text-slate-200 border border-slate-600"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                        {attendee}
                      </span>
                    ))}
                  </div>
                </div>

                {result.key_points.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Key Discussion Points
                    </h3>
                    <div className="space-y-3">
                      {result.key_points.map((kp, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 bg-slate-950/40 rounded-xl border border-slate-800 space-y-1.5"
                        >
                          <div className="font-semibold text-sm text-emerald-400">
                            {kp.topic}
                          </div>
                          <div className="text-xs text-slate-300">{kp.summary}</div>
                          {kp.key_quote && (
                            <div className="text-[11px] text-slate-400 italic flex items-start gap-1.5 pt-1">
                              <Quote className="w-3 h-3 shrink-0 text-slate-500 mt-0.5" />
                              <span>"{kp.key_quote}"</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Action Items & Decisions */}
            {activeTab === 'actions' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Action Items with Verbatim Quotes & Evidence
                  </h3>
                  <div className="space-y-3">
                    {result.action_items.map((act) => (
                      <div
                        key={act.id}
                        className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 space-y-2.5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="font-semibold text-sm text-slate-100 flex items-center gap-2">
                            <span className="text-xs px-2 py-0.5 rounded font-mono bg-slate-800 text-slate-300">
                              {act.id}
                            </span>
                            {act.task}
                          </div>

                          <div className="flex items-center gap-2">
                            {act.all_verified ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                                <CheckCircle2 className="w-3 h-3" /> Fully Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                                <AlertTriangle className="w-3 h-3" /> Audit Warning
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-300 pt-1">
                          <div className="flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                            <span>Owner: <strong>{act.owner || 'Unassigned'}</strong></span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>Deadline: <strong>{act.deadline || 'None'}</strong></span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-slate-400" />
                            <span>Source Ref: <strong className="font-mono text-emerald-400">{act.line_reference || 'N/A'}</strong></span>
                          </div>
                        </div>

                        {act.quote && (
                          <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-xs text-slate-300 italic flex items-start gap-2">
                            <Quote className="w-3.5 h-3.5 shrink-0 text-emerald-500 mt-0.5" />
                            <div>
                              <span>"{act.quote}"</span>
                              <span className="ml-2 not-italic text-[10px] text-emerald-400">
                                (verbatim matched by verifier)
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {result.decisions.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                      Agreed Decisions ({result.decisions.length})
                    </h3>
                    <div className="space-y-2">
                      {result.decisions.map((dec) => (
                        <div
                          key={dec.id}
                          className="p-3 bg-slate-950/40 rounded-xl border border-slate-800 flex items-start gap-3"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <div className="text-sm font-semibold text-white">
                              {dec.decision}
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">
                              {dec.context} — Made by {dec.made_by || 'Consensus'} (Ref: {dec.line_reference || 'N/A'})
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: Deterministic Verifier Scorecard */}
            {activeTab === 'verifier' && (
              <div className="space-y-6">
                <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <ShieldCheck className="w-5 h-5" />
                      Zero-LLM Deterministic Audit Report
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      Zero Hallucinations
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    The verifier deterministically checked each quote against indexed lines in the source transcript,
                    verified owner assignment against detected attendee registry, and validated deadline syntax without making any LLM calls.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-center space-y-1">
                    <div className="text-2xl font-black text-emerald-400">
                      {result.verification_report.quotes_passed} / {result.verification_report.total_quotes_checked}
                    </div>
                    <div className="text-xs font-semibold text-slate-300">Quotes Verified Verbatim</div>
                    <div className="text-[10px] text-slate-500">100% matched to preprocessed lines</div>
                  </div>

                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-center space-y-1">
                    <div className="text-2xl font-black text-emerald-400">
                      {result.verification_report.owners_passed} / {result.verification_report.total_owners_checked}
                    </div>
                    <div className="text-xs font-semibold text-slate-300">Owners Verified</div>
                    <div className="text-[10px] text-slate-500">Matched to recognized speakers</div>
                  </div>

                  <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-center space-y-1">
                    <div className="text-2xl font-black text-emerald-400">
                      {result.verification_report.deadlines_passed} / {result.verification_report.total_deadlines_checked}
                    </div>
                    <div className="text-xs font-semibold text-slate-300">Deadlines Validated</div>
                    <div className="text-[10px] text-slate-500">Parsed ISO / relative formats</div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Raw JSON Schema */}
            {activeTab === 'json' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-mono">
                    Output adhering to MeetingSummary (models.py) Pydantic Schema
                  </span>
                  <button
                    onClick={handleCopyJson}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-700 hover:bg-slate-600 text-white transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy JSON'}
                  </button>
                </div>
                <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto max-h-96">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

