import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../../api/axios";

export default function useToolkitAccess() {
	const [status, setStatus] = useState({
		loading: true,
		subscriptionStatus: "inactive",
		subscriptionPlan: "free",
	});
	const [toast, setToast] = useState("");

	useEffect(() => {
		let mounted = true;
		api
			.get("/visitor/toolkit/subscription")
			.then(({ data }) => {
				if (!mounted) return;
				setStatus({
					loading: false,
					subscriptionStatus: data.subscriptionStatus || "inactive",
					subscriptionPlan: data.subscriptionPlan || "free",
				});
			})
			.catch(() => {
				if (!mounted) return;
				setStatus((prev) => ({ ...prev, loading: false }));
			});
		return () => {
			mounted = false;
		};
	}, []);

	const triggerPaywall = useCallback(async () => {
		setToast("Redirecting to checkout…");
		try {
			const { data } = await api.post("/visitor/toolkit/subscription/checkout");
			if (data?.url) {
				window.location.assign(data.url);
				return;
			}
			throw new Error(data?.message || "Checkout could not be created");
		} catch (error) {
			setToast(error.response?.data?.message || error.message || "Unable to start checkout.");
			setTimeout(() => setToast(""), 3200);
		}
	}, []);

	const isSubscribed = useMemo(
		() => status.subscriptionStatus === "active",
		[status.subscriptionStatus]
	);

	return {
		isSubscribed,
		plan: status.subscriptionPlan,
		loading: status.loading,
		toastMessage: toast,
		triggerPaywall,
	};
}
