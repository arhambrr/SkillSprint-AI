import React, { useState, useEffect, useCallback } from 'react';
import { Rocket, Shield, Award, User, Zap, Trophy, Lock, Share2, ChevronRight, CheckCircle2, Loader2 } from 'lucide-react';
import Confetti from 'react-confetti';
import { AppView, CareerIntent, UserProfile, SkillRecommendation, SprintState, Project } from './types';
import { GeminiService } from './services/gemini';

// --- Subcomponents ---
// Placed in same file to meet constraints, but logically separated.

const Header = () => (
  <header className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
    <div className="flex items-center gap-2 text-primary font-black text-xl tracking-tight">
      <Zap className="w-6 h-6 fill-current" />
      <span>SKILLSPRINT AI</span>
    </div>
    <div className="flex gap-4">
        {/* Placeholder for user menu */}
        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
            <User className="w-4 h-4 text-slate-400" />
        </div>
    </div>
  </header>
);

const Onboarding = ({ onComplete }: { onComplete: (profile: UserProfile) => void }) => {
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [intent, setIntent] = useState<CareerIntent | null>(null);
    const [resumeText, setResumeText] = useState('');
    const [loading, setLoading] = useState(false);

    const handleFinalSubmit = async () => {
        setLoading(true);
        try {
            const analysis = await GeminiService.analyzeProfile(resumeText || "General professional interested in growth", intent || CareerIntent.EXPLORE);
            onComplete({
                name: name || 'Sprinter',
                intent,
                resumeText,
                currentSkills: analysis.currentSkills,
                recommendedPath: analysis.recommendedPath
            });
        } catch (e) {
            console.error(e);
            alert("AI Analysis failed. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6">
            {step === 1 && (
                <div className="space-y-6 animate-fadeIn">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        Ready to level up?
                    </h1>
                    <p className="text-slate-400">Let's tailor your sprint. What's your main goal right now?</p>
                    <div className="space-y-3">
                        {Object.values(CareerIntent).map((i) => (
                            <button key={i}
                                onClick={() => { setIntent(i as CareerIntent); setStep(2); }}
                                className="w-full p-4 text-left rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all flex justify-between group">
                                <span className="font-medium">{i}</span>
                                <ChevronRight className="text-slate-600 group-hover:text-primary" />
                            </button>
                        ))}
                    </div>
                </div>
            )}
            {step === 2 && (
                <div className="space-y-6 animate-fadeIn">
                     <h2 className="text-2xl font-bold">Tell us about you</h2>
                     <p className="text-slate-400 text-sm">Paste your LinkedIn 'About' section or a resume summary. The AI will extract your baseline skills.</p>
                     <input
                        type="text"
                        placeholder="Your First Name"
                        className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 focus:border-primary outline-none"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                     />
                     <textarea
                        placeholder="Paste resume summary here..."
                        className="w-full h-32 p-3 rounded-lg bg-slate-800 border border-slate-700 focus:border-primary outline-none resize-none"
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                     ></textarea>
                     <button
                        disabled={loading || !resumeText.trim()}
                        onClick={handleFinalSubmit}
                        className="w-full py-3 bg-primary hover:bg-indigo-500 disabled:opacity-50 rounded-lg font-bold flex justify-center items-center gap-2 transition-colors">
                        {loading ? <Loader2 className="animate-spin" /> : <span>Analyze Profile <Rocket className="inline w-4 h-4 ml-1"/></span>}
                     </button>
                </div>
            )}
        </div>
    );
};

const Roulette = ({ profile, onSkillSelected }: { profile: UserProfile, onSkillSelected: (skill: SkillRecommendation) => void }) => {
    const [skills, setSkills] = useState<SkillRecommendation[]>([]);
    const [spinning, setSpinning] = useState(false);
    const [selected, setSelected] = useState<SkillRecommendation | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        GeminiService.getSkillRecommendations(profile.currentSkills, profile.intent!, profile.recommendedPath)
            .then(setSkills)
            .finally(() => setLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSpin = () => {
        if (spinning || skills.length === 0) return;
        setSpinning(true);
        setSelected(null);

        // Simulate spin duration
        setTimeout(() => {
            const randomIndex = Math.floor(Math.random() * skills.length);
            setSelected(skills[randomIndex]);
            setSpinning(false);
        }, 3000);
    };

    if (loading) {
        return <div className="flex h-96 items-center justify-center flex-col gap-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin"/>
            <p className="text-slate-400 animate-pulse">AI is finding your best opportunities...</p>
        </div>;
    }

    return (
        <div className="max-w-2xl mx-auto mt-10 p-6 text-center space-y-8">
            {!selected && !spinning && (
                <div className="space-y-4 animate-fadeIn">
                    <h2 className="text-3xl font-bold">Your Top 3 Recommended Sprints</h2>
                    <p className="text-slate-400">Based on your goal to <span className="text-primary">{profile.intent}</span>.</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                        {skills.map(s => (
                            <div key={s.id} className={`p-4 rounded-xl bg-slate-800 border-t-4 ${s.color.replace('bg-', 'border-')} text-left`}>
                                <h3 className="font-bold text-lg">{s.name}</h3>
                                <span className="text-xs uppercase tracking-wider opacity-70">{s.category}</span>
                                <p className="text-sm text-slate-400 mt-2">{s.rationale}</p>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={handleSpin}
                        className="mt-8 px-8 py-4 bg-gradient-to-r from-primary to-secondary rounded-full text-xl font-black tracking-wide hover:scale-105 transition-transform shadow-lg shadow-primary/25">
                        SPIN THE WHEEL
                    </button>
                </div>
            )}

            {spinning && (
                 <div className="flex flex-col items-center justify-center h-96 space-y-8">
                    <div className="relative">
                         {/* Visual Wheel Simulation */}
                        <div className="w-64 h-64 rounded-full border-8 border-slate-800 relative overflow-hidden animate-spin-slow" style={{ animationDuration: '0.5s' }}>
                            {skills.map((s, i) => (
                                <div key={s.id} className={`absolute w-full h-full ${s.color} opacity-80`} style={{ clipPath: `polygon(50% 50%, ${100 * Math.cos(2 * Math.PI * i / 3)}% ${100 * Math.sin(2 * Math.PI * i / 3)}%, ${100 * Math.cos(2 * Math.PI * (i + 1) / 3)}% ${100 * Math.sin(2 * Math.PI * (i + 1) / 3)}%)` }}></div>
                            ))}
                        </div>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-2 text-white text-4xl">▼</div>
                    </div>
                    <p className="text-2xl font-bold animate-pulse">FATE IS DECIDING...</p>
                 </div>
            )}

            {selected && !spinning && (
                <div className="animate-fadeIn space-y-6 bg-slate-800/50 p-8 rounded-2xl border border-primary/30">
                    <Confetti recycle={false} numberOfPieces={200} />
                    <h3 className="text-slate-400 uppercase tracking-widest">Your Sprint Skill</h3>
                    <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent py-2">
                        {selected.name}
                    </h1>
                    <p className="text-xl text-slate-300 max-w-md mx-auto">{selected.rationale}</p>
                    <div className="pt-6">
                         <button
                            onClick={() => onSkillSelected(selected)}
                            className="w-full md:w-auto px-8 py-3 bg-primary hover:bg-indigo-500 rounded-lg font-bold flex items-center justify-center gap-2 mx-auto">
                            Start 14-Day Sprint <Rocket className="w-5 h-5"/>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const Dashboard = ({ sprint, onOpenProject }: { sprint: SprintState, onOpenProject: (p: Project) => void }) => {
    const totalProjects = sprint.projects.length;
    const completedProjects = sprint.projects.filter(p => p.status === 'graded').length;
    const progress = (completedProjects / totalProjects) * 100;

    // Simulate Rival Progress: Rival is always slightly ahead or behind to motivate
    const rivalProgress = Math.min(sprint.currentDay * 7 + (Math.random() * 10 - 5), 100);

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6">
            {/* Header Status */}
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 text-slate-400 text-sm uppercase font-semibold tracking-wider">
                        <Zap className="w-4 h-4 text-accent" /> Active Sprint • Day {sprint.currentDay} of 14
                    </div>
                    <h2 className="text-3xl font-black mt-1">{sprint.skill?.name}</h2>
                </div>
                <div className="flex items-center gap-4 bg-slate-900/50 p-3 rounded-xl">
                    <div className="text-center">
                         <div className="text-xs text-slate-400 uppercase font-bold">Your Score</div>
                         <div className="text-2xl font-black text-primary">{sprint.userScore}</div>
                    </div>
                    <div className="h-8 w-px bg-slate-700"></div>
                    <div className="text-center">
                         <div className="text-xs text-slate-400 uppercase font-bold">{sprint.rivalName}</div>
                         <div className="text-2xl font-black text-rose-500">{sprint.rivalScore}</div>
                    </div>
                </div>
            </div>

            {/* Rivalry Track */}
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-4">
                <h3 className="font-bold flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-500" /> Rival Sprint Race
                </h3>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-primary">You</span>
                            <span>{progress.toFixed(0)}%</span>
                        </div>
                        <div className="h-3 bg-slate-900 rounded-full overflow-hidden">
                            <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                             <span className="font-medium text-rose-500">{sprint.rivalName} (Rival)</span>
                             <span>{rivalProgress.toFixed(0)}%</span>
                        </div>
                        <div className="h-3 bg-slate-900 rounded-full overflow-hidden">
                            <div className="h-full bg-rose-500 transition-all duration-1000" style={{ width: `${rivalProgress}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Project Map */}
            <div className="grid gap-4 md:grid-cols-3">
                {sprint.projects.map((project, idx) => (
                    <button
                        key={project.id}
                        disabled={project.status === 'locked'}
                        onClick={() => onOpenProject(project)}
                        className={`p-5 rounded-xl border-2 text-left transition-all relative overflow-hidden group
                            ${project.status === 'locked' ? 'border-slate-800 bg-slate-800/50 opacity-70 cursor-not-allowed' :
                              project.status === 'graded' ? 'border-accent/50 bg-accent/5 hover:bg-accent/10' :
                              'border-primary bg-slate-800 hover:bg-slate-700' }`}>
                        {project.status === 'graded' && <div className="absolute top-0 right-0 p-1 bg-accent text-dark"><CheckCircle2 className="w-4 h-4"/></div>}
                        {project.status === 'locked' && <Lock className="absolute top-4 right-4 text-slate-600 w-5 h-5"/>}

                        <div className="text-xs uppercase tracking-wider font-bold mb-2 opacity-60">
                            Day {project.dayDue} • {project.difficulty}
                        </div>
                        <h4 className="font-bold text-lg leading-tight mb-4">{project.title}</h4>

                        {project.status === 'graded' ? (
                             <div className="inline-block px-3 py-1 bg-accent text-dark font-bold rounded-full text-sm">
                                Score: {project.score}
                             </div>
                        ) : project.status === 'active' ? (
                            <div className="inline-flex items-center text-primary font-semibold text-sm group-hover:underline">
                                Start Project <ChevronRight className="w-4 h-4 ml-1"/>
                            </div>
                        ) : (
                             <div className="text-sm text-slate-500">Locked</div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

const ProjectDetails = ({ project, skillName, onClose, onComplete }: { project: Project, skillName: string, onClose: () => void, onComplete: (p: Project, score: number) => void }) => {
    const [submission, setSubmission] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<{score: number, feedback: string} | null>(null);

    const handleSubmit = async () => {
        if (!submission.trim()) return;
        setSubmitting(true);
        try {
            const res = await GeminiService.scoreSubmission(project, submission, skillName);
            setResult(res);
            // Wait a moment so they can see the result before auto-closing or offering a close button
        } catch (e) {
            alert("Scoring failed. Try again.");
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <div className="bg-slate-800 w-full max-w-2xl rounded-2xl border border-slate-700 max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-700 flex justify-between items-start sticky top-0 bg-slate-800 z-10">
                    <div>
                        <div className="text-primary text-sm font-bold uppercase tracking-wider mb-1">{project.difficulty} Project</div>
                        <h2 className="text-2xl font-bold">{project.title}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full">✕</button>
                </div>

                <div className="p-6 space-y-6">
                    {!result ? (
                        <>
                            <div className="prose prose-invert">
                                <h3 className="text-lg font-bold text-white">Brief</h3>
                                <p className="text-slate-300">{project.description}</p>
                                <div className="bg-slate-900/50 p-4 rounded-lg mt-4 border border-slate-700">
                                    <span className="text-sm font-bold text-slate-400 uppercase">Deliverable</span>
                                    <p className="text-white">{project.deliverableType}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="font-bold block">Your Submission</label>
                                <textarea
                                    className="w-full h-40 bg-slate-900 border border-slate-700 rounded-lg p-4 focus:border-primary outline-none font-mono text-sm"
                                    placeholder="Paste code, write your response, or add a link here..."
                                    value={submission}
                                    onChange={(e) => setSubmission(e.target.value)}
                                ></textarea>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-6 animate-fadeIn">
                             <Confetti recycle={false} numberOfPieces={100} gravity={0.2} />
                             <div className="text-center py-6">
                                 <div className="text-6xl font-black text-accent mb-2">{result.score}</div>
                                 <div className="text-sm uppercase tracking-widest text-slate-400">Project Score</div>
                             </div>
                             <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-700">
                                 <h4 className="font-bold mb-2 flex items-center gap-2"><Shield className="w-4 h-4 text-primary"/> Mentor Feedback</h4>
                                 <p className="text-slate-300 leading-relaxed">{result.feedback}</p>
                             </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-slate-700 bg-slate-800/50 sticky bottom-0">
                    {!result ? (
                        <button
                            disabled={submitting || !submission}
                            onClick={handleSubmit}
                            className="w-full py-3 bg-primary hover:bg-indigo-500 disabled:opacity-50 rounded-lg font-bold flex justify-center items-center gap-2">
                            {submitting ? <Loader2 className="animate-spin"/> : "Submit for AI Grading"}
                        </button>
                    ) : (
                        <button
                            onClick={() => onComplete({...project, score: result.score, feedback: result.feedback, userSubmission: submission}, result.score)}
                            className="w-full py-3 bg-accent hover:bg-green-500 text-dark rounded-lg font-bold">
                            Continue Sprint
                        </button>
                    )}
                </div>
             </div>
        </div>
    );
};

const SprintSummary = ({ sprint, onFinish }: { sprint: SprintState, onFinish: () => void }) => {
    // Simple winner logic: if user av > 70 they win against standard rival bot
    const userWin = sprint.userScore >= sprint.rivalScore;

    const handleShare = () => {
        const text = `I just ${userWin ? 'won' : 'completed'} a 14-day ${sprint.skill?.name} sprint on SkillSprint AI! Final Score: ${sprint.userScore}. #SkillSprint #AI`;
        navigator.clipboard.writeText(text);
        alert("Share text copied to clipboard!");
    };

    return (
        <div className="max-w-2xl mx-auto mt-10 p-6 text-center space-y-8 animate-fadeIn">
            {userWin && <Confetti recycle={false} numberOfPieces={500} />}
            <div className="inline-flex p-4 bg-slate-800 rounded-full mb-4">
                {userWin ? <Trophy className="w-16 h-16 text-amber-400" /> : <Award className="w-16 h-16 text-primary" />}
            </div>
            <h1 className="text-4xl font-black">
                {userWin ? 'SPRINT CHAMPION!' : 'SPRINT COMPLETE!'}
            </h1>
            <p className="text-xl text-slate-400">
                You've successfully finished the 14-day <strong>{sprint.skill?.name}</strong> foundation.
            </p>

            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto py-8">
                <div className="bg-slate-800 p-6 rounded-2xl border-2 border-primary">
                    <div className="text-sm text-slate-400 uppercase font-bold">Your Score</div>
                    <div className="text-5xl font-black text-primary mt-2">{sprint.userScore}</div>
                </div>
                <div className="bg-slate-800 p-6 rounded-2xl border-2 border-rose-900/50 opacity-80">
                    <div className="text-sm text-slate-400 uppercase font-bold">{sprint.rivalName}</div>
                    <div className="text-5xl font-black text-rose-900 mt-2">{sprint.rivalScore}</div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-center">
                 <button onClick={handleShare} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg font-bold flex items-center justify-center gap-2">
                    <Share2 className="w-5 h-5"/> Share Achievement
                </button>
                 <button onClick={onFinish} className="px-6 py-3 bg-primary hover:bg-indigo-500 rounded-lg font-bold">
                    Claim Badge & Continue
                </button>
            </div>
        </div>
    );
};

const PremiumGate = ({ onRestart }: { onRestart: () => void }) => (
    <div className="max-w-md mx-auto mt-20 p-8 bg-slate-800 rounded-3xl border border-amber-500/30 text-center space-y-6 animate-fadeIn shadow-2xl shadow-amber-900/20">
        <Lock className="w-16 h-16 text-amber-500 mx-auto" />
        <h2 className="text-3xl font-bold text-white">Unlock Your Next Sprint</h2>
        <p className="text-slate-400">
            Free tier users must wait 4 weeks before starting another skill sprint.
        </p>
        <div className="bg-slate-900 p-4 rounded-xl text-left space-y-3">
            <h4 className="font-bold text-amber-500">Premium Benefits:</h4>
            <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-accent"/> Instant access to all sprints</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-accent"/> Advanced AI mentor feedback</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-accent"/> Verified certificates</li>
            </ul>
        </div>
        <button className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl font-black text-dark hover:scale-105 transition-transform">
            UPGRADE NOW - $9.99/mo
        </button>
        <button onClick={onRestart} className="text-sm text-slate-500 hover:text-slate-300 underline">
            Wait 4 weeks (Restart Demo)
        </button>
    </div>
);

// --- Main App Component ---

export default function App() {
    const [view, setView] = useState<AppView>(AppView.ONBOARDING);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [sprint, setSprint] = useState<SprintState>({
        skill: null,
        rivalName: 'Alex_Bot_92',
        rivalScore: 0,
        userScore: 0,
        currentDay: 1,
        projects: []
    });
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    const handleOnboardingComplete = (profile: UserProfile) => {
        setUserProfile(profile);
        setView(AppView.ROULETTE);
    };

    const handleSkillSelected = async (skill: SkillRecommendation) => {
        // Initialize sprint
        const projects = await GeminiService.generateSprintProjects(skill.name);
        setSprint(prev => ({
            ...prev,
            skill,
            rivalScore: Math.floor(Math.random() * 50) + 100, // Initial random baseline for rival
            currentDay: 1,
            projects
        }));
        setView(AppView.DASHBOARD);
    };

    const handleProjectComplete = (completedProject: Project, score: number) => {
        const updatedProjects = sprint.projects.map(p =>
            p.id === completedProject.id ? { ...completedProject, status: 'graded' as const } : p
        );

        // Unlock next project if available
        const nextProjectIdx = updatedProjects.findIndex(p => p.id === completedProject.id) + 1;
        if (nextProjectIdx < updatedProjects.length) {
            updatedProjects[nextProjectIdx].status = 'active';
        }

        // Update scores and time
        const newTotalScore = sprint.userScore + score;
        const newDay = Math.min(completedProject.dayDue + 1, 14);
        // Rival advances too when user completes something
        const newRivalScore = sprint.rivalScore + Math.floor(Math.random() * 40) + 60; // Rival gets 60-100 points per project

        setSprint(prev => ({
            ...prev,
            projects: updatedProjects,
            userScore: newTotalScore,
            currentDay: newDay,
            rivalScore: newRivalScore
        }));

        setSelectedProject(null);

        // Check if sprint finished
        if (updatedProjects.every(p => p.status === 'graded')) {
            setView(AppView.SPRINT_SUMMARY);
        }
    };

    const restart = () => {
        setView(AppView.ONBOARDING);
        setUserProfile(null);
        setSprint({
             skill: null,
             rivalName: 'Alex_Bot_92',
             rivalScore: 0,
             userScore: 0,
             currentDay: 1,
             projects: []
        });
    };

    return (
        <div className="min-h-screen bg-dark text-slate-100 flex flex-col">
            <Header />
            <main className="flex-1 overflow-y-auto pb-20">
                {view === AppView.ONBOARDING && <Onboarding onComplete={handleOnboardingComplete} />}
                {view === AppView.ROULETTE && userProfile && <Roulette profile={userProfile} onSkillSelected={handleSkillSelected} />}
                {view === AppView.DASHBOARD && <Dashboard sprint={sprint} onOpenProject={setSelectedProject} />}
                {view === AppView.SPRINT_SUMMARY && <SprintSummary sprint={sprint} onFinish={() => setView(AppView.PREMIUM_GATE)} />}
                {view === AppView.PREMIUM_GATE && <PremiumGate onRestart={restart} />}
            </main>

            {selectedProject && sprint.skill && (
                <ProjectDetails
                    project={selectedProject}
                    skillName={sprint.skill.name}
                    onClose={() => setSelectedProject(null)}
                    onComplete={handleProjectComplete}
                />
            )}
        </div>
    );
}
