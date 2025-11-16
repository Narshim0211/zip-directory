import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import HeaderBar from "../components/HeaderBar";
import HairGoalsErrorBoundary from "../components/HairGoalsErrorBoundary";
import { HairGoalsProvider, useHairGoals } from "../context/HairGoalsContext";
import HairGoalsSummaryCard from "../components/HairGoalsSummaryCard";
import WeeklyCheckinForm from "../components/WeeklyCheckinForm";
import WeeklyReportPopup from "../components/WeeklyReportPopup";
import "../toolkit.css";
import "./hairGoals.css";
import "../styles/hairGoalsDiary.css";

// Universal goal - no need for multiple options
const UNIVERSAL_GOAL = {
	id: "glowup",
	icon: "✨💇‍♀️",
	label: "Start Your Glow-Up",
	subtitle: "Track growth, health, or color—all in one place"
};

// Local storage keys
const STORAGE_KEYS = {
	GOAL: "hairGoals_selectedGoal",
	PHOTOS: "hairGoals_photos"
};

// Main page component (wrapped in provider below)
function HairGoalsPageContent() {
	const navigate = useNavigate();
	const { 
		getCurrentWeekNumber, 
		getCurrentWeekEntry, 
		addOrUpdateWeeklyEntry 
	} = useHairGoals();
	
	// State
	const [step, setStep] = useState("goal"); // goal | upload | progress
	const [selectedGoal, setSelectedGoal] = useState(null);
	const [photos, setPhotos] = useState([]);
	
	// Weekly diary states
	const [showCheckinForm, setShowCheckinForm] = useState(false);
	const [showGoalEdit, setShowGoalEdit] = useState(false);
	const [showReportPopup, setShowReportPopup] = useState(false);
	const [reportWeekNumber, setReportWeekNumber] = useState(null);

	// Load from localStorage on mount
	useEffect(() => {
		const savedGoal = localStorage.getItem(STORAGE_KEYS.GOAL);
		const savedPhotos = localStorage.getItem(STORAGE_KEYS.PHOTOS);

		if (savedGoal) {
			setSelectedGoal(savedGoal);
			setStep(savedPhotos ? "progress" : "upload");
		}
		if (savedPhotos) setPhotos(JSON.parse(savedPhotos));
	}, []);

	// Save to localStorage
	const saveToStorage = (key, value) => {
		localStorage.setItem(key, typeof value === "object" ? JSON.stringify(value) : value);
	};

	// Handle goal start
	const handleStartGlowUp = () => {
		setSelectedGoal(UNIVERSAL_GOAL.id);
		saveToStorage(STORAGE_KEYS.GOAL, UNIVERSAL_GOAL.id);
		setStep("upload");
	};

	// Handle photo upload
	const handlePhotoUpload = (event) => {
		const file = event.target.files[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			const currentWeek = getCurrentWeekNumber();
			const newPhoto = {
				id: Date.now(),
				dataUrl: e.target.result,
				date: new Date().toISOString(),
				weekNumber: currentWeek
			};

			const updatedPhotos = [...photos, newPhoto];
			setPhotos(updatedPhotos);
			saveToStorage(STORAGE_KEYS.PHOTOS, updatedPhotos);

			// Add photo to weekly entry (if exists)
			addOrUpdateWeeklyEntry({
				weekNumber: currentWeek,
				photoUri: e.target.result,
			});

			// Check if weekly entry is complete - show popup if so
			const currentEntry = getCurrentWeekEntry();
			if (currentEntry && currentEntry.goal && currentEntry.hairFeeling) {
				setReportWeekNumber(currentWeek);
				setShowReportPopup(true);
			}

			// Move to progress view
			if (step === "upload") {
				setStep("progress");
			}
		};
		reader.readAsDataURL(file);
	};



	// Render goal selection screen
	const renderGoalSelection = () => (
		<div className="hg-container">
			<div className="hg-hero">
				<h2 className="hg-hero-title">Your Hair Glow-Up Starts Today</h2>
				<p className="hg-hero-subtitle">Watch your transformation unfold with weekly photo updates</p>
			</div>

			<div className="hg-universal-card-container">
				<button
					className="hg-universal-card"
					onClick={handleStartGlowUp}
				>
					<div className="hg-universal-icon">{UNIVERSAL_GOAL.icon}</div>
					<div className="hg-universal-content">
						<div className="hg-universal-label">{UNIVERSAL_GOAL.label}</div>
						<div className="hg-universal-subtitle">{UNIVERSAL_GOAL.subtitle}</div>
					</div>
				</button>
			</div>
		</div>
	);

	// Render upload screen
	const renderUploadScreen = () => (
		<div className="hg-container">
			<div className="hg-upload-section">
				<h2 className="hg-section-title">Add Your Starting Photo</h2>
				<p className="hg-section-subtitle">Upload a clear photo of your hair to begin tracking</p>

				<div className="hg-upload-preview">
					<div className="hg-silhouette">
						<span className="hg-silhouette-icon">📸</span>
						<p>Your starting photo will appear here</p>
					</div>
				</div>

				<label className="hg-upload-btn">
					<input
						type="file"
						accept="image/*"
						onChange={handlePhotoUpload}
						style={{ display: "none" }}
					/>
					<span className="hg-upload-btn-icon">📷</span>
					<span>Tap to Upload Photo</span>
				</label>

				<button className="hg-back-btn" onClick={() => setStep("goal")}>
					← Change Goal
				</button>
			</div>
		</div>
	);

	// Weekly diary handlers
	const handleEditGoal = () => {
		setShowGoalEdit(true);
	};

	const handleFinishCheckin = () => {
		setShowCheckinForm(true);
	};

	const handleAddPhoto = () => {
		// Trigger file input
		document.getElementById('weekly-photo-upload').click();
	};

	const handleGoalEditComplete = ({ hasPhoto, entryData, editMode }) => {
		setShowGoalEdit(false);
		// Just close, no popup needed for goal-only edit
	};

	const handleCheckinComplete = ({ hasPhoto, entryData, editMode }) => {
		setShowCheckinForm(false);
		
		if (hasPhoto) {
			// Show report popup immediately
			setReportWeekNumber(entryData.weekNumber);
			setShowReportPopup(true);
		} else {
			// Show success message
			alert('Check-in saved! Add this week\'s photo to see your full report.');
		}
	};

	const handleViewFullReport = () => {
		setShowReportPopup(false);
		navigate('/visitor/toolkit/goals/reports');
	};

	// Render progress tracker screen
	const renderProgressTracker = () => {
		return (
			<div className="hg-container">
				{/* Weekly Diary Summary Card */}
				<div className="hg-diary-section">
					<HairGoalsSummaryCard
						onEditGoal={handleEditGoal}
						onFinishCheckin={handleFinishCheckin}
						onAddPhoto={handleAddPhoto}
						onViewReport={handleViewFullReport}
					/>
					
					<div className="hg-diary-simple-actions">
						<button 
							className="hg-simple-link-btn"
							onClick={() => navigate('/visitor/toolkit/goals/reports')}
						>
							View Past Reports →
						</button>
					</div>
				</div>

				{/* Hidden file input for photo */}
				<input
					id="weekly-photo-upload"
					type="file"
					accept="image/*"
					onChange={handlePhotoUpload}
					style={{ display: 'none' }}
				/>

				{/* Timeline Section */}
				<div className="hg-timeline-header">
					<h3>Your Timeline</h3>
				</div>

				<div className="hg-timeline-section">
					<div className="hg-timeline-grid">
						{photos.map((photo, idx) => (
							<div key={idx} className="hg-photo-card" onClick={() => {/* could add lightbox later */}}>
								<img src={photo.dataUrl} alt={`Week ${photo.weekNumber}`} className="hg-photo-img" />
								<div className="hg-photo-label">Week {photo.weekNumber}</div>
							</div>
						))}
					</div>
				</div>


			</div>
		);
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
					{/* Goal Edit Modal (Quick) */}
					{showGoalEdit && (
						<div className="hgd-modal-overlay" onClick={() => setShowGoalEdit(false)}>
							<div className="hgd-modal-content compact" onClick={(e) => e.stopPropagation()}>
								<WeeklyCheckinForm
									editMode="goal"
									onComplete={handleGoalEditComplete}
									onCancel={() => setShowGoalEdit(false)}
								/>
							</div>
						</div>
					)}

					{/* Full Check-In Form Modal */}
					{showCheckinForm && (
						<div className="hgd-modal-overlay" onClick={() => setShowCheckinForm(false)}>
							<div className="hgd-modal-content" onClick={(e) => e.stopPropagation()}>
								<WeeklyCheckinForm
									editMode="full"
									onComplete={handleCheckinComplete}
									onCancel={() => setShowCheckinForm(false)}
								/>
							</div>
						</div>
					)}

					{/* Weekly Report Popup */}
					{showReportPopup && (
						<WeeklyReportPopup
							weekNumber={reportWeekNumber}
							onClose={() => setShowReportPopup(false)}
							onViewFullReport={handleViewFullReport}
						/>
					)}

					{step === "goal" && renderGoalSelection()}
					{step === "upload" && renderUploadScreen()}
					{step === "progress" && renderProgressTracker()}
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
