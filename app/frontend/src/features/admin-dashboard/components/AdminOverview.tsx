import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import {
	Activity,
	AlertTriangle,
	CheckCircle2,
	ChevronRight,
	Clock,
	Eye,
	Loader2,
	Play,
	Server,
	ShieldCheck,
	UserCheck,
	Users,
	Wifi,
	WifiOff,
	XCircle,
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import { useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";
import { listAdminUsers } from "@/services/userManagement";
import { formatShortDateTime } from "@/utils/dateHelpers";
import { useModelsQuery } from "@/features/model-dashboard/hooks/useModelsQuery";
import type { Model } from "@/features/model-dashboard/services/modelService";
import { useWebservices } from "../hooks/useWebservices";
import type { WebserviceInstance } from "../types";

type AdminSectionKey = "overview" | "models" | "webservices" | "feedback" | "users";

interface AdminOverviewProps {
	canManageUsers: boolean;
	usersCount: number | null | undefined;
	onlineCount: number;
	usersLoading: boolean;
	onOpenSection: (key: AdminSectionKey) => void;
}

// Backend status groups.
const JOB_STATUSES = {
	running: "calculating,running,processing",
	queued: "queue",
	completed: "completed,published",
	failed: "failed",
} as const;

const ADMIN_LEVELS = new Set(["expert", "manager"]);

const isOffline = (engine: WebserviceInstance) => engine.status === "inactive";
const isBusy = (engine: WebserviceInstance) => engine.current_concurrency > 0;

function Metric({ icon: Icon, label, value, loading, tone }: { icon: LucideIcon; label: string; value?: number | null; loading?: boolean; tone?: string }) {
	return (
		<div className="flex items-center gap-2.5 rounded-lg bg-muted/50 px-3 py-2">
			<Icon className={cn("h-4 w-4 shrink-0 text-muted-foreground", tone)} />
			<div className="min-w-0">
				<p className="truncate text-[11px] text-muted-foreground">{label}</p>
				<p className="text-base font-semibold tabular-nums text-foreground">
					{loading ? <Loader2 className="mt-1 h-3.5 w-3.5 animate-spin text-muted-foreground" /> : (value ?? "—")}
				</p>
			</div>
		</div>
	);
}

function Panel({ title, icon: Icon, action, children }: { title: string; icon: LucideIcon; action?: ReactNode; children: ReactNode }) {
	return (
		<section className="rounded-xl border border-border bg-card shadow-sm">
			<div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
				<h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
					<Icon className="h-4 w-4 text-muted-foreground" />
					{title}
				</h3>
				{action}
			</div>
			<div className="p-4">{children}</div>
		</section>
	);
}

function OpenLink({ label, onClick }: { label: string; onClick: () => void }) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
		>
			{label}
			<ChevronRight className="h-3.5 w-3.5" />
		</button>
	);
}

/** Platform monitoring overview. */
export function AdminOverview({ canManageUsers, usersCount, onlineCount, usersLoading, onOpenSection }: AdminOverviewProps) {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { webservices: engines, loading: enginesLoading, error: enginesError } = useWebservices({}, { autoRefresh: true, refreshInterval: 30000 });

	// Totals from status-filtered lists.
	const countParams = (status: string) => (canManageUsers ? { limit: 1, offset: 0, status } : undefined);
	const running = useModelsQuery(countParams(JOB_STATUSES.running), { requireWorkspace: false });
	const queued = useModelsQuery(countParams(JOB_STATUSES.queued), { requireWorkspace: false });
	const completed = useModelsQuery(countParams(JOB_STATUSES.completed), { requireWorkspace: false });
	const failed = useModelsQuery(countParams(JOB_STATUSES.failed), { requireWorkspace: false });
	const recent = useModelsQuery(
		canManageUsers ? { limit: 6, offset: 0, sort_by: "last_activity", sort_order: "desc" } : undefined,
		{ requireWorkspace: false },
	);

	// Admins: only when the first page holds everyone.
	const { data: usersPage, isLoading: adminsLoading } = useQuery({
		queryKey: ["admin-overview-users"],
		queryFn: () => listAdminUsers({ page: 1, perPage: 100 }),
		enabled: canManageUsers,
		staleTime: 60_000,
	});
	const userRows = usersPage?.data?.data ?? [];
	const adminCount = usersPage?.data && userRows.length >= usersPage.data.total
		? userRows.filter((user) => ADMIN_LEVELS.has(user.access_level)).length
		: null;

	const online = engines.filter((engine) => engine.status === "active").length;
	const busy = engines.filter(isBusy).length;
	const offline = engines.filter(isOffline).length;
	const available = engines.filter((engine) => engine.available).length;
	const enginesPending = enginesLoading && engines.length === 0;
	const failedCount = failed.data?.total;
	const recentModels: Model[] = (recent.data?.data ?? []).slice(0, 6);

	// Real issues only.
	const alerts: { tone: "error" | "warning"; text: string; action?: () => void }[] = [];
	if (enginesError) alerts.push({ tone: "error", text: t("adminDashboard.overview.alerts.enginesError", "Simulation engines could not be loaded.") });
	if (!enginesPending && !enginesError && engines.length > 0 && available === 0) {
		alerts.push({ tone: "error", text: t("adminDashboard.overview.alerts.noEngine", "No simulation engine is available; new runs will wait in the queue."), action: () => onOpenSection("webservices") });
	}
	for (const engine of engines.filter(isOffline)) {
		alerts.push({
			tone: "warning",
			text: t("adminDashboard.overview.alerts.engineOffline", { name: engine.name || `${engine.ip}:${engine.port}`, defaultValue: "Engine {{name}} is offline." }),
			action: () => onOpenSection("webservices"),
		});
	}
	if (canManageUsers && failedCount) {
		alerts.push({
			tone: "error",
			text: t("adminDashboard.overview.alerts.failedRuns", { count: failedCount, defaultValue: "{{count}} simulations failed." }),
			action: () => onOpenSection("models"),
		});
	}
	const alertsReady = !enginesPending && (!canManageUsers || !failed.isLoading);

	return (
		<div className="space-y-4">
			{/* Summary cards. */}
			<div className={cn("grid gap-4", canManageUsers ? "lg:grid-cols-3" : "lg:grid-cols-1")}>
				<Panel title={t("adminDashboard.overview.engines", "Simulation engines")} icon={Server} action={<OpenLink label={t("adminDashboard.overview.manage", "Manage")} onClick={() => onOpenSection("webservices")} />}>
					<div className="grid grid-cols-2 gap-2">
						<Metric icon={Server} label={t("webservicesManagement.summary.total")} value={engines.length} loading={enginesPending} />
						<Metric icon={Wifi} label={t("webservicesManagement.summary.online")} value={online} loading={enginesPending} tone="text-emerald-600" />
						<Metric icon={Activity} label={t("webservicesManagement.summary.busy")} value={busy} loading={enginesPending} tone="text-amber-600" />
						<Metric icon={WifiOff} label={t("webservicesManagement.summary.offline")} value={offline} loading={enginesPending} tone={offline > 0 ? "text-red-600" : undefined} />
					</div>
				</Panel>

				{canManageUsers && (
					<Panel title={t("adminDashboard.overview.jobs", "Simulation jobs")} icon={Play} action={<OpenLink label={t("adminDashboard.overview.viewAll", "View all")} onClick={() => onOpenSection("models")} />}>
						<div className="grid grid-cols-2 gap-2">
							<Metric icon={Activity} label={t("adminDashboard.overview.running", "Running")} value={running.data?.total} loading={running.isLoading} tone="text-blue-600" />
							<Metric icon={Clock} label={t("adminDashboard.overview.queued", "Queued")} value={queued.data?.total} loading={queued.isLoading} tone="text-amber-600" />
							<Metric icon={CheckCircle2} label={t("adminDashboard.overview.completed", "Completed")} value={completed.data?.total} loading={completed.isLoading} tone="text-emerald-600" />
							<Metric icon={XCircle} label={t("adminDashboard.overview.failed", "Failed")} value={failedCount} loading={failed.isLoading} tone={failedCount ? "text-red-600" : undefined} />
						</div>
					</Panel>
				)}

				{canManageUsers && (
					<Panel title={t("adminDashboard.overview.users", "Users")} icon={Users} action={<OpenLink label={t("adminDashboard.overview.manage", "Manage")} onClick={() => onOpenSection("users")} />}>
						<div className="grid grid-cols-2 gap-2">
							<Metric icon={Users} label={t("adminDashboard.overview.registered", "Registered")} value={usersCount} loading={usersLoading && usersCount == null} />
							<Metric icon={UserCheck} label={t("adminDashboard.overview.online", "Online now")} value={onlineCount} loading={usersLoading} tone="text-emerald-600" />
							<Metric icon={ShieldCheck} label={t("adminDashboard.overview.admins", "Administrators")} value={adminCount} loading={adminsLoading} />
						</div>
					</Panel>
				)}
			</div>

			<div className={cn("grid gap-4", canManageUsers ? "xl:grid-cols-2" : "")}>
				{/* Engine health. */}
				<Panel title={t("adminDashboard.overview.engineHealth", "Simulation engine health")} icon={Activity}>
					{enginesPending ? (
						<div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
					) : engines.length === 0 ? (
						<p className="py-4 text-center text-sm text-muted-foreground">{t("adminDashboard.overview.noEngines", "No simulation engines registered.")}</p>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead>
									<tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
										<th className="pb-2 font-semibold">{t("webservicesManagement.table.service")}</th>
										<th className="pb-2 font-semibold">{t("adminDashboard.overview.state", "State")}</th>
										<th className="pb-2 font-semibold">{t("adminDashboard.overview.workload", "Jobs")}</th>
										<th className="pb-2 text-right font-semibold">{t("adminDashboard.overview.lastCheck", "Last check")}</th>
									</tr>
								</thead>
								<tbody>
									{engines.map((engine) => {
										const state = isOffline(engine)
											? { label: t("webservicesManagement.summary.offline"), dot: "bg-red-500" }
											: !engine.available
												? { label: t("webservicesManagement.status.unavailable"), dot: "bg-amber-500" }
												: isBusy(engine)
													? { label: t("webservicesManagement.summary.busy"), dot: "bg-amber-500" }
													: { label: t("webservicesManagement.summary.online"), dot: "bg-emerald-500" };
										return (
											<tr key={engine.id} className="border-t border-border transition-colors duration-150 hover:bg-muted/40">
												<td className="py-2 pr-3">
													<p className="font-medium text-foreground">{engine.name || t("webservicesManagement.table.service")}</p>
													<p className="font-mono text-[11px] text-muted-foreground">{engine.ip}:{engine.port}</p>
												</td>
												<td className="py-2 pr-3">
													<span className="inline-flex items-center gap-1.5 text-xs text-foreground">
														<span className={cn("h-2 w-2 rounded-full", state.dot)} />
														{state.label}
													</span>
												</td>
												<td className="py-2 pr-3 text-xs tabular-nums text-muted-foreground">
													{engine.current_concurrency}/{engine.max_concurrency}
												</td>
												<td className="py-2 text-right text-xs tabular-nums text-muted-foreground">
													{engine.last_check ? formatShortDateTime(engine.last_check) : "—"}
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					)}
				</Panel>

				{/* Recent activity. */}
				{canManageUsers && (
					<Panel title={t("adminDashboard.overview.recent", "Recent simulation activity")} icon={Clock} action={<OpenLink label={t("adminDashboard.overview.viewAll", "View all")} onClick={() => onOpenSection("models")} />}>
						{recent.isLoading ? (
							<div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
						) : recentModels.length === 0 ? (
							<p className="py-4 text-center text-sm text-muted-foreground">{t("adminDashboard.overview.noActivity", "No simulations yet.")}</p>
						) : (
							<ul className="divide-y divide-border">
								{recentModels.map((model) => (
									<li key={model.id} className="flex items-center gap-3 py-2">
										<div className="min-w-0 flex-1">
											<p className="truncate text-sm font-medium text-foreground">{model.title}</p>
											<p className="text-[11px] tabular-nums text-muted-foreground">
												{formatShortDateTime(model.calculation_completed_at || model.updated_at)}
											</p>
										</div>
										<StatusBadge status={model.status} size="small" />
										<button
											type="button"
											onClick={() => navigate(`/app/model-results/${model.id}`)}
											aria-label={t("model.view")}
											className="rounded-md p-1.5 text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
										>
											<Eye className="h-4 w-4" />
										</button>
									</li>
								))}
							</ul>
						)}
					</Panel>
				)}
			</div>

			{/* Alerts. */}
			<Panel title={t("adminDashboard.overview.alertsTitle", "Platform alerts")} icon={AlertTriangle}>
				{!alertsReady ? (
					<div className="flex justify-center py-3"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
				) : alerts.length === 0 ? (
					<p className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
						<CheckCircle2 className="h-4 w-4" />
						{t("adminDashboard.overview.alerts.none", "No issues detected.")}
					</p>
				) : (
					<ul className="space-y-2">
						{alerts.map((alert) => (
							<li
								key={alert.text}
								className={cn(
									"flex items-center gap-2.5 rounded-lg border px-3 py-2 text-sm",
									alert.tone === "error"
										? "border-red-500/30 bg-red-500/5 text-red-700 dark:text-red-400"
										: "border-amber-500/30 bg-amber-500/5 text-amber-800 dark:text-amber-400",
								)}
							>
								{alert.tone === "error" ? <XCircle className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
								<span className="flex-1">{alert.text}</span>
								{alert.action && <OpenLink label={t("adminDashboard.overview.open", "Open")} onClick={alert.action} />}
							</li>
						))}
					</ul>
				)}
			</Panel>
		</div>
	);
}
