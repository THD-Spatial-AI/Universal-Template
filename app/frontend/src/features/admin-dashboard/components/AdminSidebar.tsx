import type { LucideIcon } from "lucide-react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@spatialhub/ui";
import { useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";

export interface AdminSection<K extends string = string> {
	key: K;
	label: string;
	icon: LucideIcon;
}

interface AdminSidebarProps<K extends string> {
	sections: AdminSection<K>[];
	active: K;
	onSelect: (key: K) => void;
	collapsed: boolean;
	onToggleCollapsed: () => void;
}

/** Secondary admin navigation. */
export function AdminSidebar<K extends string>({ sections, active, onSelect, collapsed, onToggleCollapsed }: AdminSidebarProps<K>) {
	const { t } = useTranslation();
	const toggleLabel = collapsed ? t("adminDashboard.nav.expand", "Expand menu") : t("adminDashboard.nav.collapse", "Collapse menu");

	return (
		<aside
			className={cn(
				"hidden shrink-0 flex-col border-r border-border bg-card transition-[width] duration-200 md:flex",
				collapsed ? "w-14" : "w-60",
			)}
		>
			<div className={cn("border-b border-border", collapsed ? "px-2 py-4" : "px-5 py-5")}>
				{collapsed ? (
					<div className="flex h-8 items-center justify-center text-xs font-bold text-foreground" aria-hidden="true">
						A
					</div>
				) : (
					<>
						<h2 className="text-lg font-bold leading-tight text-foreground">{t("adminDashboard.title")}</h2>
						<p className="mt-1 text-xs leading-snug text-muted-foreground">{t("adminDashboard.managePlatform")}</p>
					</>
				)}
			</div>

			<nav className="flex-1 space-y-1 overflow-y-auto p-2" aria-label={t("adminDashboard.title")}>
				{sections.map(({ key, label, icon: Icon }) => {
					const isActive = key === active;
					const button = (
						<button
							key={key}
							type="button"
							onClick={() => onSelect(key)}
							aria-current={isActive ? "page" : undefined}
							className={cn(
								"flex w-full items-center gap-2.5 rounded-lg text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-ring",
								collapsed ? "justify-center p-2.5" : "px-3 py-2",
								isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground",
							)}
						>
							<Icon className="h-4 w-4 shrink-0" />
							{!collapsed && <span className="truncate">{label}</span>}
						</button>
					);
					return collapsed ? (
						<Tooltip key={key}>
							<TooltipTrigger asChild>{button}</TooltipTrigger>
							<TooltipContent side="right">{label}</TooltipContent>
						</Tooltip>
					) : (
						button
					);
				})}
			</nav>

			<div className="border-t border-border p-2">
				<Tooltip>
					<TooltipTrigger asChild>
						<button
							type="button"
							onClick={onToggleCollapsed}
							aria-label={toggleLabel}
							className={cn(
								"flex w-full items-center gap-2.5 rounded-lg text-xs text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground",
								collapsed ? "justify-center p-2.5" : "px-3 py-2",
							)}
						>
							{collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
							{!collapsed && <span>{toggleLabel}</span>}
						</button>
					</TooltipTrigger>
					{collapsed && <TooltipContent side="right">{toggleLabel}</TooltipContent>}
				</Tooltip>
			</div>
		</aside>
	);
}

/** Small-screen admin navigation. */
export function AdminMobileNav<K extends string>({ sections, active, onSelect }: Pick<AdminSidebarProps<K>, "sections" | "active" | "onSelect">) {
	return (
		<nav className="flex gap-1 overflow-x-auto border-b border-border bg-card px-3 py-2 scrollbar-hide md:hidden">
			{sections.map(({ key, label, icon: Icon }) => (
				<button
					key={key}
					type="button"
					onClick={() => onSelect(key)}
					aria-current={key === active ? "page" : undefined}
					className={cn(
						"flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-150",
						key === active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
					)}
				>
					<Icon className="h-4 w-4" />
					{label}
				</button>
			))}
		</nav>
	);
}
