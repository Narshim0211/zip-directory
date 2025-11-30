import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import HeaderBar from "../components/HeaderBar";
import HairGoalsErrorBoundary from "../components/HairGoalsErrorBoundary";
import { HairGoalsProvider, useHairGoals } from "../context/HairGoalsContext";
import WeeklyProgressModal from "../components/WeeklyProgressModal";
import PhotoCompareModal from "../components/PhotoCompareModal";
import HairTwinInsights from "../components/HairTwinInsights";
import JourneyNameModal from "../components/JourneyNameModal";
import { getReports, saveWeeklyReport } from "../../../api/hairGoalsReportsApi";
import { getHairWord, getFeelingEmoji } from "../utils/hairGoalsReportGenerator";
import {
	loadField,
	saveField,
	loadPhotos,
	savePhotos,
	appendJourneyHistoryEntry,
	loadJourneyHistory,
	getChecklistForWeek,
	updateChecklistItem,
	generateJourneyName
} from "../utils/hairGoalsStorage";
import "../toolkit.css";
import "./hairGoals.css";
import "../styles/hairGoalsDiary.css";

// Goal options with beautiful cards
const GOALS = [
	{ id: 'length', emoji: '📏', title: 'Grow Length', description: 'Reach your dream length with patience and care' },
	{ id: 'volume', emoji: '💨', title: 'Add Volume', description: 'Get fuller, thicker-looking hair' },
	{ id: 'repair', emoji: '💪', title: 'Repair Damage', description: 'Heal breakage and restore strength' },
	{ id: 'curls', emoji: '🌀', title: 'Define Curls', description: 'Enhance your natural curl pattern' },
	{ id: 'scalp', emoji: '🌱', title: 'Scalp Health', description: 'Nourish from the roots up' },
	{ id: 'color', emoji: '🎨', title: 'Maintain Color', description: 'Keep color vibrant and healthy' },
];

// Days for routine
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const STEP_TYPES = ['Wash', 'Deep Condition', 'Oil Treatment', 'Scalp Massage', 'Protein Treatment', 'Leave-in', 'Style', 'Trim', 'Other'];

// Motivational quotes
const QUOTES = [
	"Every strand tells a story of growth.",
	"Consistency is the secret to transformation.",
	"Your hair journey is uniquely yours.",
	"Small steps lead to big changes.",
	"Trust the process, celebrate the progress.",
	"You're doing amazing things for your hair.",
	"Each week brings you closer to your goal.",
];

// Main page component (wrapped in provider below)
function HairGoalsPageContent() {
	const navigate = useNavigate();
	const {
		resetAllData,
		addOrUpdateWeeklyEntry,
		getCurrentWeekNumber,
		getWeekInfo,
		getEntryByWeek,
		weeklyEntries,
		startDate,
		currentStreak,
		initializeJourney
	} = useHairGoals();

	// View states: 'goal', 'routine', 'dashboard', 'compare'
	const [currentView, setCurrentView] = useState('goal');

	// Goal state
	const [selectedGoal, setSelectedGoal] = useState(null);
	const [goalNote, setGoalNote] = useState('');

	// Routine state
	const [routineSteps, setRoutineSteps] = useState([]);

	// Dashboard state
	const [photos, setPhotos] = useState([]);
	const [checkedItems, setCheckedItems] = useState({});
	const [quote] = useState(QUOTES[Math.floor(Math.random() * QUOTES.length)]);

	// Modal states
	const [progressModalOpen, setProgressModalOpen] = useState(false);
	const [progressModalDefaults, setProgressModalDefaults] = useState({});
	const [compareData, setCompareData] = useState(null);
	const [toastMessage, setToastMessage] = useState(null);

	// Journey naming modal states
	const [nameModalOpen, setNameModalOpen] = useState(false);
	const [journeyToArchive, setJourneyToArchive] = useState(null);

	// Reports from API
	const [reports, setReports] = useState([]);
	const [products, setProducts] = useState([]);

	// Load data on mount
	useEffect(() => {
		try {
			const savedGoal = loadField("GOAL");
			const savedRoutine = loadField("ROUTINE_STEPS") || [];
			const savedProducts = loadField("PRODUCTS") || [];
			const savedPhotos = loadPhotos() || [];

			if (savedGoal) {
				setSelectedGoal(savedGoal);
				// If goal exists and routine exists, go to dashboard
				if (savedRoutine.length > 0) {
					setCurrentView('dashboard');
				} else {
					setCurrentView('routine');
				}
			}

			setRoutineSteps(savedRoutine);
			setProducts(savedProducts);
			setPhotos(savedPhotos);
		} catch (error) {
			console.error("Failed to load Hair Goals data:", error);
		}
	}, []);

	// Get current week - must be before useEffects that depend on it
	const currentWeek = getCurrentWeekNumber();

	// Calculate streak from weekly entries
	const streak = currentStreak || 0;

	// Load checked items when current week changes
	useEffect(() => {
		if (currentWeek && routineSteps.length > 0) {
			const savedChecklist = getChecklistForWeek(currentWeek);
			const checkedState = {};
			routineSteps.forEach((item) => {
				checkedState[item.id] = savedChecklist[item.id] || false;
			});
			setCheckedItems(checkedState);
		}
	}, [currentWeek, routineSteps]);

	// Fetch reports from API
	useEffect(() => {
		let mounted = true;
		getReports()
			.then((data) => {
				if (mounted) {
					setReports(Array.isArray(data) ? data : []);
				}
			})
			.catch((err) => {
				console.error("Failed to load weekly reports", err);
			});
		return () => { mounted = false; };
	}, []);

	// ==================== GOAL PAGE ====================
	const handleGoalSelect = (goal) => {
		setSelectedGoal(goal);
	};

	const handleGoalContinue = () => {
		if (!selectedGoal) return;
		saveField("GOAL", selectedGoal);
		if (goalNote) {
			saveField("GOAL_NOTE", goalNote);
		}
		setCurrentView('routine');
	};

	// ==================== ROUTINE PAGE ====================
	const handleAddRoutineStep = () => {
		setRoutineSteps([...routineSteps, { id: Date.now(), day: '', type: '', product: '' }]);
	};

	const handleUpdateRoutineStep = (index, field, value) => {
		const newSteps = [...routineSteps];
		newSteps[index] = { ...newSteps[index], [field]: value };
		setRoutineSteps(newSteps);
	};

	const handleDeleteRoutineStep = (index) => {
		if (routineSteps.length <= 1) {
			setRoutineSteps([{ id: Date.now(), day: '', type: '', product: '' }]);
			return;
		}
		setRoutineSteps(routineSteps.filter((_, i) => i !== index));
	};

	const handleStartJourney = () => {
		const validSteps = routineSteps.filter((s) => s.day && s.type);
		if (validSteps.length === 0) {
			setToastMessage('Please add at least one routine step with a day and activity.');
			return;
		}
		saveField("ROUTINE_STEPS", validSteps);
		setRoutineSteps(validSteps);
		// Initialize the journey start date when user starts
		if (!startDate) {
			initializeJourney();
		}
		setCurrentView('dashboard');
	};

	// ==================== DASHBOARD ====================
	const handleCheckItem = (stepId) => {
		const newValue = !checkedItems[stepId];
		setCheckedItems((prev) => ({
			...prev,
			[stepId]: newValue,
		}));
		// Persist to localStorage in real-time
		updateChecklistItem(currentWeek, stepId, newValue);
	};

	const handleOpenCheckin = (defaults = {}) => {
		const targetWeek = defaults.weekNumber || currentWeek;
		const existingEntry = defaults.existingEntry || getEntryByWeek(targetWeek);
		setProgressModalDefaults({
			weekNumber: targetWeek,
			defaultPhoto: defaults.photoUri || existingEntry?.photoUri || null,
			existingEntry
		});
		setProgressModalOpen(true);
	};

	const handleSaveWeeklyProgress = async (entry) => {
		const steps = routineSteps.map((step) => ({
			id: step.id,
			label: step.type,
			done: entry.completedSteps?.includes(step.id) ? 1 : 0,
			target: 1
		}));

		const payload = {
			week: entry.weekNumber,
			dates: { start: entry.date, end: entry.date },
			feeling: getHairWord(entry.hairFeeling),
			emoji: getFeelingEmoji(entry.hairFeeling),
			note: entry.progressNote,
			steps,
			photos: entry.photoUri ? [{ url: entry.photoUri, type: "progress" }] : [],
			goal: selectedGoal?.id || null // Include goal for anonymous community stats
		};

		try {
			await saveWeeklyReport(payload);
		} catch (err) {
			console.error("Failed to save weekly report to API", err);
		}

		// Sync photo to photos array for timeline display
		if (entry.photoUri) {
			const existingPhotoIndex = photos.findIndex((p) => p.weekNumber === entry.weekNumber);
			const newPhoto = {
				weekNumber: entry.weekNumber,
				data: entry.photoUri,
				date: entry.date || new Date().toISOString()
			};
			let updatedPhotos;
			if (existingPhotoIndex >= 0) {
				// Update existing photo for this week
				updatedPhotos = [...photos];
				updatedPhotos[existingPhotoIndex] = newPhoto;
			} else {
				// Add new photo
				updatedPhotos = [...photos, newPhoto];
			}
			setPhotos(updatedPhotos);
			savePhotos(updatedPhotos);
		}

		const success = addOrUpdateWeeklyEntry({
			...entry,
			goal: selectedGoal?.id || null
		});
		if (success) {
			setToastMessage("Weekly progress saved - keep the glow-up going!");
		}
		return success;
	};

	const handleCompare = () => {
		const sorted = [...photos].sort((a, b) => a.weekNumber - b.weekNumber);
		if (sorted.length < 1) {
			setToastMessage("Add photos to compare your journey.");
			return;
		}
		// Pass all photos so user can select which weeks to compare
		setCompareData({
			allPhotos: sorted,
			before: sorted[0],
			after: sorted.length > 1 ? sorted[sorted.length - 1] : sorted[0]
		});
	};

	// Prepare journey data and open naming modal
	const handleRestartJourney = () => {
		const sortedEntries = [...weeklyEntries].sort((a, b) => a.weekNumber - b.weekNumber);
		const finalEntry = sortedEntries[sortedEntries.length - 1];
		const historyLength = loadJourneyHistory().length;

		const hasData = selectedGoal || routineSteps.length || photos.length || weeklyEntries.length;

		if (!hasData) {
			// Nothing to archive, just reset
			resetAllData();
			setCurrentView('goal');
			return;
		}

		// Prepare journey data for the naming modal
		const journeyData = {
			id: `journey-${Date.now()}`,
			sequence: historyLength + 1,
			savedAt: new Date().toISOString(),
			startDate: startDate || sortedEntries[0]?.date || new Date().toISOString(),
			endDate: finalEntry?.date || new Date().toISOString(),
			goal: selectedGoal,
			routineSteps,
			products,
			weeklyEntries,
			photos,
			summary: {
				finalFeeling: finalEntry?.hairFeeling || null,
				weeksLogged: sortedEntries.length,
				streak: currentStreak
			}
		};

		// Open the naming modal
		setJourneyToArchive(journeyData);
		setNameModalOpen(true);
	};

	// Save journey with name/tagline and reset
	const handleSaveJourneyWithName = ({ name, tagline }) => {
		try {
			const journeyWithName = {
				...journeyToArchive,
				name: name || generateJourneyName(journeyToArchive.goal, journeyToArchive.startDate, journeyToArchive.endDate),
				tagline: tagline || ''
			};

			const result = appendJourneyHistoryEntry(journeyWithName);

			if (!result.success) {
				console.error("Validation errors:", result.errors);
				setToastMessage("Unable to save: " + result.errors.join(", "));
				return;
			}

			// Reset everything
			resetAllData();
			savePhotos([]);
			saveField("GOAL", null);
			saveField("GOAL_NOTE", null);
			saveField("ROUTINE_STEPS", []);
			saveField("PRODUCTS", []);
			setSelectedGoal(null);
			setGoalNote('');
			setRoutineSteps([]);
			setProducts([]);
			setPhotos([]);
			setJourneyToArchive(null);
			setNameModalOpen(false);
			setCurrentView('goal');
			setToastMessage("Your journey has been saved to history!");
		} catch (error) {
			console.error("Failed to archive journey", error);
			setToastMessage("Unable to save history. Please try again.");
		}
	};

	// Get completion count for this week
	const completedCount = Object.values(checkedItems).filter(Boolean).length;
	const totalSteps = routineSteps.length;

	// Generate week thumbnails
	const weekCount = Math.max(currentWeek, 8);
	const weeks = Array.from({ length: weekCount }, (_, i) => i + 1);

	// ==================== RENDER ====================
	return (
		<HairGoalsErrorBoundary>
			<PageShell fullWidth>
				<HeaderBar
					title="Hair Glow-Up Diary"
					subtitle="Track your transformation"
					onBack={() => {
						if (currentView === 'routine') {
							setCurrentView('goal');
						} else if (currentView === 'dashboard' || currentView === 'compare') {
							// Stay on dashboard, don't go back
							navigate("/visitor/toolkit");
						} else {
							navigate("/visitor/toolkit");
						}
					}}
				/>

				<div className="hg-wrapper">
					{/* ==================== GOAL SELECTION VIEW ==================== */}
					{currentView === 'goal' && (
						<div className="hg-goal-view">
							{/* Progress Stepper */}
							<div className="hg-stepper">
								<div className="hg-stepper__step hg-stepper__step--active">
									<div className="hg-stepper__circle">1</div>
									<div className="hg-stepper__line"></div>
								</div>
								<div className="hg-stepper__step">
									<div className="hg-stepper__circle">2</div>
									<div className="hg-stepper__line"></div>
								</div>
								<div className="hg-stepper__step">
									<div className="hg-stepper__circle">3</div>
								</div>
							</div>

							<div className="hg-goal-header">
								<h1 className="hg-goal-title">Choose Your Hair Goal</h1>
								<p className="hg-goal-subtitle">
									Every big transformation starts with one brave decision.
								</p>
							</div>

							<div className="hg-goal-cards">
								{GOALS.map((goal) => (
									<div
										key={goal.id}
										className={`hg-goal-card ${selectedGoal?.id === goal.id ? 'hg-goal-card--selected' : ''}`}
										onClick={() => handleGoalSelect(goal)}
									>
										<span className="hg-goal-card__emoji">{goal.emoji}</span>
										<h3 className="hg-goal-card__title">{goal.title}</h3>
										<p className="hg-goal-card__description">{goal.description}</p>
									</div>
								))}
							</div>

							{selectedGoal && (
								<div className="hg-goal-note-section">
									<label className="hg-goal-note-label">
										Why does this matter to you? (optional)
									</label>
									<textarea
										className="hg-goal-note-input"
										placeholder="E.g., For my wedding in June... or just because I deserve to glow!"
										value={goalNote}
										onChange={(e) => setGoalNote(e.target.value)}
										rows={3}
										maxLength={200}
									/>
								</div>
							)}

							<div className="hg-goal-actions">
								<button
									className="hg-continue-btn"
									onClick={handleGoalContinue}
									disabled={!selectedGoal}
								>
									Save & Continue
								</button>
							</div>
						</div>
					)}

					{/* ==================== ROUTINE BUILDER VIEW ==================== */}
					{currentView === 'routine' && (
						<div className="hg-routine-view">
							{/* Progress Stepper */}
							<div className="hg-stepper">
								<div className="hg-stepper__step hg-stepper__step--completed">
									<div className="hg-stepper__circle">&#10003;</div>
									<div className="hg-stepper__line hg-stepper__line--completed"></div>
								</div>
								<div className="hg-stepper__step hg-stepper__step--active">
									<div className="hg-stepper__circle">2</div>
									<div className="hg-stepper__line"></div>
								</div>
								<div className="hg-stepper__step">
									<div className="hg-stepper__circle">3</div>
								</div>
							</div>

							<div className="hg-routine-header">
								<h1 className="hg-routine-title">Build Your Weekly Routine</h1>
								<p className="hg-routine-subtitle">
									Your goal: <strong>{selectedGoal?.title}</strong> {selectedGoal?.emoji}
								</p>
							</div>

							<div className="hg-routine-steps">
								{routineSteps.length === 0 && (
									<div className="hg-routine-empty">
										<p>No steps yet. Add your first routine step!</p>
									</div>
								)}
								{routineSteps.map((step, index) => (
									<div key={step.id} className="hg-routine-step">
										<div className="hg-routine-step__header">
											<span className="hg-routine-step__number">Step {index + 1}</span>
											<button
												className="hg-routine-step__delete"
												onClick={() => handleDeleteRoutineStep(index)}
											>
												&times;
											</button>
										</div>
										<div className="hg-routine-step__fields">
											<div className="hg-routine-step__field">
												<label>Day</label>
												<select
													value={step.day}
													onChange={(e) => handleUpdateRoutineStep(index, 'day', e.target.value)}
												>
													<option value="">Select day...</option>
													{DAYS.map((day) => (
														<option key={day} value={day}>{day}</option>
													))}
												</select>
											</div>
											<div className="hg-routine-step__field">
												<label>Activity</label>
												<select
													value={step.type}
													onChange={(e) => handleUpdateRoutineStep(index, 'type', e.target.value)}
												>
													<option value="">Select activity...</option>
													{STEP_TYPES.map((type) => (
														<option key={type} value={type}>{type}</option>
													))}
												</select>
											</div>
											<div className="hg-routine-step__field">
												<label>Product (optional)</label>
												<input
													type="text"
													value={step.product || ''}
													onChange={(e) => handleUpdateRoutineStep(index, 'product', e.target.value)}
													placeholder="e.g., Olaplex No. 3"
												/>
											</div>
										</div>
									</div>
								))}

								<button className="hg-add-step-btn" onClick={handleAddRoutineStep}>
									<span>+</span> Add Another Step
								</button>
							</div>

							<div className="hg-routine-actions">
								<button className="hg-back-btn" onClick={() => setCurrentView('goal')}>
									Back
								</button>
								<button className="hg-start-btn" onClick={handleStartJourney}>
									Start My Journey
								</button>
							</div>
						</div>
					)}

					{/* ==================== DASHBOARD VIEW ==================== */}
					{currentView === 'dashboard' && (() => {
						const weekInfo = getWeekInfo();
						return (
						<div className="hg-dashboard-view">
							{/* Week Info Card - Clear timing display */}
							<div className="hg-week-info-card">
								<div className="hg-week-info-card__header">
									<div className="hg-week-info-card__title">
										<span className="hg-week-info-card__week">Week {currentWeek}</span>
										<span className="hg-week-info-card__goal">{selectedGoal?.emoji} {selectedGoal?.title}</span>
									</div>
									{streak > 0 && (
										<div className="hg-week-info-card__streak">
											{streak} <span role="img" aria-label="fire">&#128293;</span>
										</div>
									)}
								</div>

								<div className="hg-week-info-card__dates">
									<span>Started: {weekInfo.startFormatted}</span>
									<span className="hg-week-info-card__arrow">&#8594;</span>
									<span>Ends: {weekInfo.endFormatted}</span>
								</div>

								<div className="hg-week-info-card__progress">
									<div className="hg-week-info-card__progress-bar">
										<div
											className="hg-week-info-card__progress-fill"
											style={{ width: `${weekInfo.progressPercent}%` }}
										/>
									</div>
									<span className="hg-week-info-card__days-left">
										{weekInfo.daysRemaining === 0
											? "Last day!"
											: weekInfo.daysRemaining === 1
												? "1 day left"
												: `${weekInfo.daysRemaining} days left`}
									</span>
								</div>
							</div>

							{/* Motivational Quote */}
							<p className="hg-dashboard-quote">"{quote}"</p>

							{/* Weekly Checklist */}
							<div className="hg-weekly-checklist">
								<h2 className="hg-weekly-checklist__title">
									<span role="img" aria-label="clipboard">&#128203;</span> This Week's Routine
									{totalSteps > 0 && (
										<span className={`hg-weekly-checklist__count ${completedCount === totalSteps ? 'hg-weekly-checklist__count--complete' : ''}`}>
											{completedCount}/{totalSteps}
										</span>
									)}
								</h2>

								{routineSteps.length === 0 ? (
									<div className="hg-empty-checklist">
										<p>No routine steps yet</p>
									</div>
								) : (
									routineSteps.map((step) => (
										<div
											key={step.id}
											className="hg-checklist-item"
											onClick={() => handleCheckItem(step.id)}
										>
											<div className={`hg-checklist-item__checkbox ${checkedItems[step.id] ? 'hg-checklist-item__checkbox--checked' : ''}`}>
												{checkedItems[step.id] && '\u2713'}
											</div>
											<span className={`hg-checklist-item__text ${checkedItems[step.id] ? 'hg-checklist-item__text--checked' : ''}`}>
												{step.type}
												{step.product && <span className="hg-checklist-item__product"> - {step.product}</span>}
											</span>
											<span className="hg-checklist-item__day">{step.day}</span>
										</div>
									))
								)}
							</div>

							{/* Hair Twin Insights - Community Comparison */}
							<HairTwinInsights
								goalName={selectedGoal?.title}
								weekNumber={currentWeek}
								completedCount={completedCount}
								totalSteps={totalSteps}
							/>

							{/* Photo Timeline */}
							<div className="hg-photo-timeline">
								<h2 className="hg-photo-timeline__title"><span role="img" aria-label="camera">&#128248;</span> Your Progress Photos</h2>
								<p className="hg-photo-timeline__hint">Tap a week to add or view photo</p>
								<div className="hg-photo-timeline__scroll">
									{weeks.map((weekNum) => {
										const photo = photos.find((p) => p.weekNumber === weekNum);
										return (
											<div
												key={weekNum}
												className={`hg-week-thumbnail ${photo ? 'hg-week-thumbnail--filled' : ''}`}
												onClick={() => handleOpenCheckin({ weekNumber: weekNum, photoUri: photo?.data })}
											>
												{photo ? (
													<img src={photo.data} alt={`Week ${weekNum}`} className="hg-week-thumbnail__image" />
												) : (
													<div className="hg-week-thumbnail__empty">
														<span>+</span>
													</div>
												)}
												<span className="hg-week-thumbnail__label">W{weekNum}</span>
											</div>
										);
									})}
								</div>
							</div>

							{/* Action Buttons */}
							<div className="hg-dashboard-actions">
								<button className="hg-checkin-btn" onClick={() => handleOpenCheckin()}>
									<span role="img" aria-label="memo">&#128221;</span> Log Weekly Progress
								</button>
								<button className="hg-compare-btn" onClick={handleCompare}>
									<span role="img" aria-label="arrows">&#128260;</span> Compare Photos
								</button>
								<button className="hg-history-btn" onClick={() => navigate("/visitor/toolkit/goals/history")}>
									<span role="img" aria-label="scroll">&#128220;</span> View History
								</button>
							</div>

							{/* Report Card Link */}
							<div className="hg-report-card-link">
								<button
									className="hg-report-card-btn"
									onClick={() => navigate("/visitor/toolkit/hair-goals/report-card")}
								>
									<span role="img" aria-label="chart">&#128202;</span> View My Report Card
								</button>
								<p className="hg-report-card-hint">See lifetime insights from all your check-ins</p>
							</div>

							{/* Restart Journey */}
							<div className="hg-restart-section">
								<button className="hg-restart-btn" onClick={handleRestartJourney}>
									<span role="img" aria-label="refresh">&#128260;</span> Start New Journey
								</button>
							</div>
						</div>
					);})()}

					{/* Toast Message */}
					{toastMessage && (
						<div className="hg-toast">
							<span>{toastMessage}</span>
							<button onClick={() => setToastMessage(null)}>&times;</button>
						</div>
					)}

					{/* Weekly Progress Modal */}
					{progressModalOpen && (
						<WeeklyProgressModal
							isOpen={progressModalOpen}
							onClose={() => setProgressModalOpen(false)}
							onSave={handleSaveWeeklyProgress}
							weekNumber={progressModalDefaults.weekNumber}
							defaultPhoto={progressModalDefaults.defaultPhoto}
							existingEntry={progressModalDefaults.existingEntry}
							routineSteps={routineSteps}
							products={products}
							userGoal={selectedGoal?.id || "repair"}
						/>
					)}

					{/* Photo Compare Modal */}
					{compareData && (
						<PhotoCompareModal
							before={compareData.before}
							after={compareData.after}
							allPhotos={compareData.allPhotos || []}
							onClose={() => setCompareData(null)}
						/>
					)}

					{/* Journey Naming Modal */}
					{nameModalOpen && journeyToArchive && (
						<JourneyNameModal
							isOpen={nameModalOpen}
							onClose={() => {
								setNameModalOpen(false);
								setJourneyToArchive(null);
							}}
							onSave={handleSaveJourneyWithName}
							journeyData={journeyToArchive}
						/>
					)}
				</div>
			</PageShell>
		</HairGoalsErrorBoundary>
	);
}

// Wrap with provider
export default function HairGoalsPage() {
	return (
		<HairGoalsProvider>
			<HairGoalsPageContent />
		</HairGoalsProvider>
	);
}
