import React from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import HeaderBar from "../components/HeaderBar";
import StyleAdvisorErrorBoundary from "../../styleAdvisor/components/StyleAdvisorErrorBoundary";
import StyleAdvisorIntro from "../../styleAdvisor/components/StyleAdvisorIntro";
import HairTryOnCard from "../../styleAdvisor/components/HairTryOnCard";
import OutfitTryOnCard from "../../styleAdvisor/components/OutfitTryOnCard";
import StyleQACard from "../../styleAdvisor/components/StyleQACard";
import BeautyProfileCard from "../../styleAdvisor/components/BeautyProfileCard";
import "../../styleAdvisor/styleAdvisor.css";

export default function StyleAdvisorPage() {
	const navigate = useNavigate();
	return (
		<PageShell fullWidth>
			<HeaderBar
				title="AI Style Advisor"
				subtitle="Hair try-ons, outfits, and smart advice"
				onBack={() => navigate("/visitor/toolkit")}
			/>
			<StyleAdvisorErrorBoundary>
				<StyleAdvisorIntro />
				<div className="style-advisor-grid">
					<HairTryOnCard />
					<OutfitTryOnCard />
					<StyleQACard />
					<BeautyProfileCard />
				</div>
			</StyleAdvisorErrorBoundary>
		</PageShell>
	);
}
