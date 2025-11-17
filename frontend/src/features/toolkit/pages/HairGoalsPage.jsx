import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import HeaderBar from "../components/HeaderBar";
import HairGoalsErrorBoundary from "../components/HairGoalsErrorBoundary";
import { HairGoalsProvider, useHairGoals } from "../context/HairGoalsContext";
import HairGoalCard from "../components/HairGoalCard";
import HairGoalForm from "../components/HairGoalForm";
import RoutineProductsCard from "../components/RoutineProductsCard";
import ProgressReportsCard from "../components/ProgressReportsCard";
import WeeklyProgressModal from "../components/WeeklyProgressModal";
import PhotoCompareModal from "../components/PhotoCompareModal";
import { getReports, saveWeeklyReport } from "../../../api/hairGoalsReportsApi";
import { getHairWord, getFeelingEmoji } from "../utils/hairGoalsReportGenerator";
import {
	loadField,
	saveField,
	loadPhotos,
	savePhotos,
	appendJourneyHistoryEntry,
	loadJourneyHistory
} from "../utils/hairGoalsStorage";
import "../toolkit.css";
import "./hairGoals.css";
import "../styles/hairGoalsDiary.css";

// Main page component (wrapped in provider below)
function HairGoalsPageContent() {
	const navigate = useNavigate();
	const {
		resetAllData,
		addOrUpdateWeeklyEntry,
		getCurrentWeekNumber,
		getEntryByWeek,
		weeklyEntries,
		startDate,
		currentStreak
	} = useHairGoals();
	
	// State
	const [goalData, setGoalData] = useState(null);
	const [routineSteps, setRoutineSteps] = useState([]);
	const [products, setProducts] = useState([]);
	const [goalModalOpen, setGoalModalOpen] = useState(false);
	const [toastMessage, setToastMessage] = useState(null);
	const [progressModalOpen, setProgressModalOpen] = useState(false);
	const [progressModalDefaults, setProgressModalDefaults] = useState({});
	const [reports, setReports] = useState([]);
	const [reportsError, setReportsError] = useState(null);
	const [currentPhotos, setCurrentPhotos] = useState([]);
	const [compareData, setCompareData] = useState(null);

	// Load from localStorage on mount
		useEffect(() => {
			try {
				const savedGoal = loadField("GOAL");
				const savedRoutine = loadField("ROUTINE_STEPS") || [];
				const savedProducts = loadField("PRODUCTS") || [];

				if (savedGoal) setGoalData(savedGoal);
				if (savedRoutine.length) setRoutineSteps(savedRoutine);
				if (savedProducts.length) setProducts(savedProducts);
			} catch (error) {
				console.error("Failed to load Hair Goals dashboard:", error);
			}
		}, []);

	// Fetch reports from API
	useEffect(() => {
		let mounted = true;
		getReports()
			.then((data) => {
				if (mounted) {
					setReports(Array.isArray(data) ? data : []);
					setReportsError(null);
				}
			})
			.catch((err) => {
				console.error("Failed to load weekly reports", err);
				if (mounted) setReportsError("Unable to load weekly reports.");
			});
		return () => {
			mounted = false;
		};
	}, []);

	// Load current journey photos
	useEffect(() => {
		try {
			const photos = loadPhotos() || [];
			setCurrentPhotos(Array.isArray(photos) ? photos : []);
		} catch (error) {
			console.error("Failed to load photos for comparison", error);
		}
	}, []);

	// Handle goal start
	const handleSavePrimaryGoal = (data) => {
		setGoalData(data);
		saveField("GOAL", data);
		setGoalModalOpen(false);
	};

	const handleRoutineUpdate = (nextSteps) => {
		setRoutineSteps(nextSteps);
		saveField("ROUTINE_STEPS", nextSteps);
	};

	const handleProductUpdate = (nextProducts) => {
		setProducts(nextProducts);
		saveField("PRODUCTS", nextProducts);
	};

	const handleOpenCheckin = (defaults = {}) => {
		const targetWeek = defaults.weekNumber || getCurrentWeekNumber();
		const existingEntry = defaults.existingEntry || getEntryByWeek(targetWeek);
		setProgressModalDefaults({
			weekNumber: targetWeek,
			defaultPhoto: defaults.photoUri || existingEntry?.photoUri || null,
			existingEntry
		});
		setProgressModalOpen(true);
	};

	const handleRestartJourney = () => {
		const confirmed = window.confirm(
			"Restart your hair journey? We'll archive everything so far before resetting your goal, routine, products, photos, and weekly logs."
		);
		if (confirmed) {
			try {
				const photos = loadPhotos() || [];
				const sortedEntries = [...weeklyEntries].sort((a, b) => a.weekNumber - b.weekNumber);
				const finalEntry = sortedEntries[sortedEntries.length - 1];
				const historyLength = loadJourneyHistory().length;

				const hasData =
					(goalData && goalData.goalType) ||
					routineSteps.length ||
					products.length ||
					photos.length ||
					weeklyEntries.length;

				if (hasData) {
					appendJourneyHistoryEntry({
						id: `journey-${Date.now()}`,
						sequence: historyLength + 1,
						savedAt: new Date().toISOString(),
						startDate: startDate || sortedEntries[0]?.date || new Date().toISOString(),
						endDate: finalEntry?.date || new Date().toISOString(),
						goal: goalData,
						routineSteps,
						products,
						weeklyEntries,
						photos,
						summary: {
							finalFeeling: finalEntry?.hairFeeling || null,
							weeksLogged: sortedEntries.length,
							completedSteps: sortedEntries.reduce(
								(total, entry) => total + (entry.completedSteps?.length || 0),
								0
							),
							streak: currentStreak
						}
					});
				}

				resetAllData();
				savePhotos([]);
				saveField("GOAL", null);
				saveField("ROUTINE_STEPS", []);
				saveField("PRODUCTS", []);
				setGoalData(null);
				setRoutineSteps([]);
				setProducts([]);
				setToastMessage("Your previous journey has been saved to your Hair Goal History.");
			} catch (error) {
				console.error("Failed to archive journey", error);
				setToastMessage("Unable to save history right now. Please try again.");
			}
		}
	};

	const handleSaveWeeklyProgress = async (entry) => {
		const steps = routineSteps.map((step) => ({
			id: step.id,
			label: step.step,
			done: entry.completedSteps?.includes(step.id) ? 1 : 0,
			target: 1
		}));

		const highlightProduct = entry.highlightProductId
			? (() => {
					const match = products.find((p) => String(p.id) === String(entry.highlightProductId));
					return match ? { id: match.id, name: match.name } : null;
			  })()
			: null;

		const payload = {
			week: entry.weekNumber,
			dates: {
				start: entry.date,
				end: entry.date
			},
			feeling: getHairWord(entry.hairFeeling),
			emoji: getFeelingEmoji(entry.hairFeeling),
			note: entry.progressNote,
			steps,
			highlightProduct,
			photos: entry.photoUri
				? [
						{
							url: entry.photoUri,
							type: "progress"
						}
				  ]
				: []
		};

		try {
			await saveWeeklyReport(payload);
		} catch (err) {
			console.error("Failed to save weekly report to API", err);
		}

		const success = addOrUpdateWeeklyEntry({
			...entry,
			goal: goalData?.goalType || null
		});
		if (success) {
			setToastMessage("Weekly progress saved — keep the glow-up going!");
		}
		return success;
	};

	const handleCompareCurrentJourney = () => {
		const sorted = [...currentPhotos].sort((a, b) => a.weekNumber - b.weekNumber);
		if (sorted.length < 2) {
			setToastMessage("Add at least two photos to compare your journey.");
			return;
		}
		setCompareData({
			before: sorted[0],
			after: sorted[sorted.length - 1]
		});
	};

	return (
		<HairGoalsErrorBoundary>
			<PageShell fullWidth>
				<HeaderBar
					title="Hair Glow-Up Diary"
					subtitle="Track what's actually working for your hair"
					onBack={() => navigate("/visitor/toolkit")}
				/>

				<div className="hg-wrapper">
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
						/>
					)}
					{/* Primary Goal Modal */}
					{goalModalOpen && (
						<div className="hgd-modal-overlay" onClick={() => setGoalModalOpen(false)}>
							<div className="hgd-modal-content compact" onClick={(e) => e.stopPropagation()}>
								<HairGoalForm
									initialGoal={goalData}
									onSave={handleSavePrimaryGoal}
									onCancel={() => setGoalModalOpen(false)}
								/>
							</div>
						</div>
					)}

					<div className="hg-dashboard">
						<HairGoalCard goal={goalData} onEdit={() => setGoalModalOpen(true)} />
						<RoutineProductsCard
							routineSteps={routineSteps}
							products={products}
							onUpdateRoutine={handleRoutineUpdate}
							onUpdateProducts={handleProductUpdate}
						/>
						<ProgressReportsCard
							onOpenCheckin={handleOpenCheckin}
							onRestartJourney={handleRestartJourney}
							onOpenPhotos={() => navigate("/visitor/toolkit/goals/photos")}
							onViewHistory={() => navigate("/visitor/toolkit/goals/history")}
							onViewReport={(id) => navigate(`/visitor/toolkit/goals/report/${id}`)}
							reports={reports}
							onCompare={handleCompareCurrentJourney}
						/>
					</div>

					{toastMessage && (
						<div className="hg-coming-soon-banner">
							<span>{toastMessage}</span>
							<button type="button" onClick={() => setToastMessage(null)}>
								Close
							</button>
						</div>
					)}

					{compareData && (
						<PhotoCompareModal
							before={compareData.before}
							after={compareData.after}
							onClose={() => setCompareData(null)}
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
