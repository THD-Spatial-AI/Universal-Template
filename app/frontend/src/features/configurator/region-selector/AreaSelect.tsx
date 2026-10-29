import { useCallback, useEffect, useRef, useState, type FC, type ChangeEvent } from "react";
import { useParams } from "react-router-dom";

import { AreaSelectTour } from "@/features/guided-tour";
import { useAreaSelect, type AreaData } from "@/features/configurator/hooks/useAreaSelect";
import { useWizardSteps } from "@/features/configurator/hooks/area-select/useWizardSteps";
import { WizardStepBar } from "./components/wizard";
import { MAP_STEP } from "./components/layers";
import { CreateWorkspaceModal, useWorkspaceStore, type Workspace } from "@/components/workspace";
import { useDocumentTitle } from "@/hooks/use-document-title";
import Notification from "@/components/ui/Notification";
import { MapContainer } from "@/components/shared/MapContainer";
import { cn } from "@/lib/utils";

import { MapHeader } from "./components/MapHeader";
import { LayerStepper } from "./components/LayerStepper";

interface AreaSelectProps {
  onAreaSelected?: (areaData: AreaData) => void;
  onCancel?: () => void;
  editMode?: boolean;
  existingModelId?: number;
}

export const AreaSelect: FC<AreaSelectProps> = ({
  onAreaSelected,
  onCancel,
  editMode = false,
  existingModelId,
}) => {
  useDocumentTitle(editMode ? "Edit Model" : "New Model");
  const params = useParams();

  const routeModelId = Number.parseInt(params.id ?? "", 10);
  const modelIdFromRoute = Number.isFinite(routeModelId) ? routeModelId : undefined;

  const passedWorkspaceId = Number.parseInt(params.workspaceId ?? "", 10);
  const normalizedWorkspaceId = Number.isFinite(passedWorkspaceId) ? passedWorkspaceId : undefined;

  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);
  const preferredWorkspaceId = useWorkspaceStore((s) => s.preferredWorkspaceId);
  const isLoadingPreference = useWorkspaceStore((s) => s.isLoading);
  const setCurrentWorkspace = useWorkspaceStore((s) => s.setCurrentWorkspace);
  const initializeWorkspace = useWorkspaceStore((s) => s.initializeWorkspace);

  const [isCreateWsOpen, setIsCreateWsOpen] = useState(false);
  const [wsReloadKey, setWsReloadKey] = useState(0);
  const [tourRequestedStep, setTourRequestedStep] = useState<number | null>(null);

  useEffect(() => {
    initializeWorkspace();
  }, [initializeWorkspace]);

  useEffect(() => {
    if (!isLoadingPreference) {
      setTimeout(() => setWsReloadKey((prev) => prev + 1), 0);
    }
  }, [isLoadingPreference, preferredWorkspaceId]);

  const handleWorkspaceChange = useCallback(
    (workspace: Workspace | null) => setCurrentWorkspace(workspace),
    [setCurrentWorkspace],
  );

  const { state, actions, notification } = useAreaSelect({
    onAreaSelected,
    onCancel,
    editMode,
    existingModelId,
  });

  const wizard = useWizardSteps(editMode);

  const handleModelNameChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => actions.setModelName(event.target.value),
    [actions],
  );

  const handleTourStepHandled = useCallback(() => setTourRequestedStep(null), []);

  const handleTourComplete = useCallback(() => {
    actions.handleTourComplete();
    setTourRequestedStep(null);
  }, [actions]);

  const showsMap = wizard.hasStarted && wizard.step === MAP_STEP;

  // Hides loading canvas.
  const [revealVeil, setRevealVeil] = useState(false);
  const [veilFading, setVeilFading] = useState(false);
  const prevShowsMap = useRef(false);
  useEffect(() => {
    if (showsMap && !prevShowsMap.current) setRevealVeil(true);
    prevShowsMap.current = showsMap;
  }, [showsMap]);
  useEffect(() => {
    if (!revealVeil) return;
    const raf = requestAnimationFrame(() => setVeilFading(true));
    const done = window.setTimeout(() => {
      setRevealVeil(false);
      setVeilFading(false);
    }, 900);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(done);
    };
  }, [revealVeil]);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background">
      <Notification
        isOpen={notification.data.open}
        message={notification.data.message}
        severity={notification.data.severity}
        onClose={notification.hide}
      />

      <MapHeader
        steps={
          wizard.hasStarted ? (
            <WizardStepBar
              step={wizard.step}
              completed={wizard.completed}
              editMode={editMode}
              onJump={wizard.jumpTo}
            />
          ) : undefined
        }
        isLoadingPreference={isLoadingPreference}
        wsReloadKey={wsReloadKey}
        currentWorkspace={currentWorkspace}
        preferredWorkspaceId={preferredWorkspaceId ?? undefined}
        normalizedWorkspaceId={normalizedWorkspaceId}
        onWorkspaceChange={handleWorkspaceChange}
        onOpenCreateWorkspace={() => setIsCreateWsOpen(true)}
      />

      <div className="relative flex-1 overflow-hidden">
        <MapContainer
          modal={false}
          showSidebar={false}
          topBar={null}
          mapHeader={null}
          hideMapControls={!showsMap}
          mapOverlays={null}
        />

        {revealVeil && (
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-0 z-10 bg-background transition-opacity duration-700 ease-out motion-reduce:transition-none",
              veilFading ? "opacity-0" : "opacity-100",
            )}
          />
        )}

        <LayerStepper
          wizard={wizard}
          state={state}
          actions={actions}
          handleModelNameChange={handleModelNameChange}
          editMode={editMode}
          modelId={existingModelId ?? modelIdFromRoute}
          tourRequestedStep={tourRequestedStep}
          onTourStepHandled={handleTourStepHandled}
        />
      </div>

      <AreaSelectTour
        isOpen={state.showAreaSelectTour}
        onComplete={handleTourComplete}
        onSkip={actions.handleTourSkip}
        onConfiguratorStepChange={setTourRequestedStep}
      />

      <CreateWorkspaceModal
        isOpen={isCreateWsOpen}
        onClose={() => setIsCreateWsOpen(false)}
        onSuccess={(newWorkspace) => {
          setIsCreateWsOpen(false);
          handleWorkspaceChange(newWorkspace);
        }}
      />
    </div>
  );
};
