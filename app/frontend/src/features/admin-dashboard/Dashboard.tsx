import React, { useCallback, useState, lazy, Suspense } from "react";
import { Brain, FileText, LayoutDashboard, LogOut, Settings, Sparkles, User, UserCog, Users, Zap, type LucideIcon } from "lucide-react";
import { useTranslation } from "@/i18n";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLogout } from "@/hooks/useLogout";
import { useAuth } from "@/providers/auth-provider";
import { Authorized } from "@/middleware/authorized";
import { Tooltip, TooltipTrigger, TooltipContent } from "@spatialhub/ui";
import { useAdminUsersCount } from "./hooks/useAdminUsersCount";
import { useAdminModelActions } from "./hooks/useAdminModelActions";
import { getDashboardTabs } from "./utils/dashboardHelpers";
import { AdminMobileNav, AdminSidebar, type AdminSection } from "./components/AdminSidebar";
import { AdminOverview } from "./components/AdminOverview";

// Lazy-loaded panels.
const WebservicesManagement = lazy(() => import("./WebservicesManagement"));
const UserManagement = lazy(() => import("./UserManagement").then(m => ({ default: m.UserManagement })));
const ModelsManagement = lazy(() => import("./ModelsManagement").then(m => ({ default: m.ModelsManagement })));
const FeedbackManagement = lazy(() => import("./FeedbackManagement").then(m => ({ default: m.FeedbackManagement })));

// Lazy-load fallback.
const TabLoadingFallback = () => {
	const { t } = useTranslation();
	return (
	<div className="flex items-center justify-center py-16">
		<div className="flex flex-col items-center gap-4">
			<div className="relative">
				<div className="w-12 h-12 rounded-full border-4 border-gray-200"></div>
				<div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-gray-600 border-t-transparent animate-spin"></div>
			</div>
			<span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{t('adminDashboard.loadingContent')}</span>
		</div>
	</div>
);
};

type SectionKey = "overview" | "models" | "webservices" | "feedback" | "users";

const SECTION_ICONS: Record<SectionKey, LucideIcon> = {
	overview: LayoutDashboard,
	models: Brain,
	webservices: Zap,
	feedback: FileText,
	users: Users,
};

const COLLAPSED_KEY = "adminSidebar.collapsed";

const readCollapsed = () => {
	try {
		return localStorage.getItem(COLLAPSED_KEY) === "1";
	} catch {
		return false;
	}
};

export const Dashboard: React.FC = () => {
	const { t } = useTranslation();
	useDocumentTitle(t("adminDashboard.title"));

	const handleLogout = useLogout();
	const { user } = useAuth();
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	const [collapsed, setCollapsed] = useState(readCollapsed);

	const isExpert = user?.access_level === "expert";
	const isManager = user?.access_level === "manager";
	const canManageUsers = isExpert || isManager;
	const { usersCount, usersCountLoading, onlineCount, refreshUsersCount } = useAdminUsersCount(canManageUsers);
	const handleModelAction = useAdminModelActions();

	const sections: AdminSection<SectionKey>[] = getDashboardTabs(t, canManageUsers, isExpert)
		.filter((tab) => tab.show)
		.map((tab) => ({ key: tab.key, label: tab.label, icon: SECTION_ICONS[tab.key] }));

	// Deep-linkable section.
	const requested = searchParams.get("section") as SectionKey | null;
	const active: SectionKey = sections.some((section) => section.key === requested) ? (requested as SectionKey) : "overview";

	const selectSection = useCallback(
		(key: SectionKey) => {
			setSearchParams(key === "overview" ? {} : { section: key }, { replace: true });
		},
		[setSearchParams],
	);

	const toggleCollapsed = () => {
		setCollapsed((prev) => {
			try {
				localStorage.setItem(COLLAPSED_KEY, prev ? "0" : "1");
			} catch {
				// Storage blocked.
			}
			return !prev;
		});
	};

	const headerButton = "rounded-lg border border-white/10 bg-white/10 p-2 transition-colors duration-150 hover:bg-white/20";

	return (
		<div className="flex min-h-screen bg-background">
			<AdminSidebar sections={sections} active={active} onSelect={selectSection} collapsed={collapsed} onToggleCollapsed={toggleCollapsed} />

			<div className="min-w-0 flex-1">
				<AdminMobileNav sections={sections} active={active} onSelect={selectSection} />

				<div className="space-y-4 p-4 md:p-6">
					{/* Header. */}
					<div className="md-rise relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-800 via-gray-900 to-black px-4 py-4 text-white shadow-lg md:px-5">
						<div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
							<div className="space-y-1">
								<div className="flex items-center gap-2 text-xs text-gray-300">
									<Sparkles className="h-3.5 w-3.5" />
									<span>{sections.find((section) => section.key === active)?.label}</span>
								</div>
								<h1 className="text-lg font-bold tracking-tight md:text-xl">{t("adminDashboard.welcomeBack", { name: user?.name })}</h1>
								{canManageUsers && (
									<span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-[11px] font-medium">
										<UserCog className="h-3.5 w-3.5" />
										{t("adminDashboard.administrator")}
									</span>
								)}
							</div>
							<div className="flex items-center gap-2">
								<Tooltip>
									<TooltipTrigger asChild>
										<button type="button" onClick={() => navigate("/app/profile", { state: { from: "admin" } })} className={headerButton} aria-label={t("adminDashboard.profile")}>
											<User className="h-4 w-4" />
										</button>
									</TooltipTrigger>
									<TooltipContent side="bottom">{t("adminDashboard.profile")}</TooltipContent>
								</Tooltip>
								<Tooltip>
									<TooltipTrigger asChild>
										<button type="button" onClick={() => navigate("/app/settings", { state: { from: "admin" } })} className={headerButton} aria-label={t("adminDashboard.settings")}>
											<Settings className="h-4 w-4" />
										</button>
									</TooltipTrigger>
									<TooltipContent side="bottom">{t("adminDashboard.settings")}</TooltipContent>
								</Tooltip>
								<button
									type="button"
									onClick={handleLogout}
									className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm font-medium transition-colors duration-150 hover:border-red-400/50 hover:bg-red-500/80"
								>
									<LogOut className="h-4 w-4" />
									<span className="hidden sm:inline">{t("adminDashboard.logout")}</span>
								</button>
							</div>
						</div>
					</div>

					<div className="md-rise" style={{ animationDelay: "60ms" }}>
						{active === "overview" && (
							<AdminOverview
								canManageUsers={canManageUsers}
								usersCount={usersCount}
								onlineCount={onlineCount}
								usersLoading={usersCountLoading}
								onOpenSection={selectSection}
							/>
						)}

						{active === "models" && (
							<Authorized access={["expert", "manager"]}>
								<Suspense fallback={<TabLoadingFallback />}>
									<ModelsManagement onModelAction={handleModelAction} />
								</Suspense>
							</Authorized>
						)}

						{/* Expert-editable. */}
						{active === "webservices" && (
							<Suspense fallback={<TabLoadingFallback />}>
								<WebservicesManagement readOnly={!isExpert} />
							</Suspense>
						)}

						{active === "feedback" && (
							<Authorized access={["expert"]}>
								<Suspense fallback={<TabLoadingFallback />}>
									<FeedbackManagement />
								</Suspense>
							</Authorized>
						)}

						{active === "users" && (
							<Authorized access={["expert", "manager"]}>
								<Suspense fallback={<TabLoadingFallback />}>
									<UserManagement onUsersMutated={refreshUsersCount} />
								</Suspense>
							</Authorized>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};
