import { useEffect, useState, type FC } from "react";
import { useParams } from "react-router-dom";
import { AlertCircle, BarChart3, Loader2 } from "lucide-react";

import { useTranslation } from "@/i18n";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { MapContainer } from "@/components/shared/MapContainer";
import { useMapStore } from "@/features/interactive-map/store/map-store";
import { modelService, Model } from "@/features/model-dashboard/services/modelService";
import { useSeenCompletedModelsStore } from "@/features/model-dashboard/store/seen-completed-models";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatDateRange } from "@/utils/dateHelpers";

import { extractErrorMessage } from "./viewer-helpers";
import { ViewerStatusBanners } from "./components/ViewerStatusBanners";

/** One model's results. */
export const ModelResultsViewer: FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const modelId = Number(id);

  const [model, setModel] = useState<Model | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const map = useMapStore((state) => state.map);

  useDocumentTitle(model?.title ?? t("modelResults.title", "Model results"));

  useEffect(() => {
    if (!Number.isFinite(modelId)) return;
    let cancelled = false;
    setLoading(true);
    modelService
      .getModelById(modelId)
      .then((loaded) => {
        if (cancelled) return;
        setModel(loaded.data);
        setError(null);
      })
      .catch((caught: unknown) => {
        if (!cancelled) setError(extractErrorMessage(caught, t("modelResults.loadError", "Could not load this model.")));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [modelId, t]);

  const markCompletedSeen = useSeenCompletedModelsStore((s) => s.markSeen);
  useEffect(() => {
    if (model?.status === "completed") markCompletedSeen(model);
  }, [model, markCompletedSeen]);

  const header = (
    <div className="flex h-11 items-center gap-3 border-b border-border bg-background px-3">
      <h1 className="truncate text-sm font-semibold text-foreground">
        {model?.title ?? t("modelResults.title", "Model results")}
      </h1>
      {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
      {model && <StatusBadge status={model.status} size="small" />}
      {model?.from_date && model.to_date && (
        <span className="ml-auto text-[11px] tabular-nums text-muted-foreground">
          {formatDateRange(model.from_date, model.to_date)}
        </span>
      )}
    </div>
  );

  // Project results go here.
  const placeholder = model && (
    <div className="absolute bottom-4 right-4 z-20 w-80 rounded-xl border border-border bg-card/95 p-4 shadow-lg backdrop-blur-md">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
        {t("modelResults.placeholderTitle", "Results")}
      </h2>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
        {t(
          "modelResults.placeholderText",
          "This project has no result view yet. Add map layers and summaries for the model output here.",
        )}
      </p>
    </div>
  );

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <MapContainer
        modal={false}
        showSidebar={false}
        topBar={header}
        mapHeader={null}
        mapOverlays={
          <>
            <ViewerStatusBanners
              mapReady={map !== null}
              loading={loading}
              error={null}
              tileErrors={0}
              layerPending={false}
              hasResults={false}
            />
            {placeholder}
          </>
        }
      />
    </div>
  );
};
