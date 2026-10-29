
interface DateParts {
	year: number;
	month: number;
	day: number;
}

export interface DateRangeSelection {
	start: DateParts;
	end: DateParts;
}

export interface AreaData {
	fromDate: string;
	toDate: string;
	modelName: string;
	timestamp: string;
}

export interface UseAreaSelectProps {
	onAreaSelected?: (areaData: AreaData) => void;
	onCancel?: () => void;
	editMode?: boolean;
	existingModelId?: number;
}

export interface AreaSelectState {
	modelName: string;
	fromDate: string;
	toDate: string;
	isSaving: boolean;
	isLoadingModel: boolean;
	showAreaSelectTour: boolean;
}

export interface AreaSelectActions {
	setModelName: (name: string) => void;
	handleUpdateRange: (range: DateRangeSelection) => void;
	setShowAreaSelectTour: (show: boolean) => void;
	handleTourComplete: () => void;
	handleTourSkip: () => void;
	handleSave: (opts?: { runAfterSave?: boolean }) => Promise<void>;
	handleCancel: () => void;
}
