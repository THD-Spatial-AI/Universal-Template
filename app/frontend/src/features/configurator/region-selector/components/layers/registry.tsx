import { FileText, SlidersHorizontal, ClipboardCheck, Save } from "lucide-react";
import type { ReactNode } from "react";

interface LayerDef {
    id: number;
    title: string;
    subtitle: string;
    titleKey: string;
    subtitleKey: string;
    icon: ReactNode;
}

// Add project steps here.
export const LAYERS: LayerDef[] = [
    { id: 1, title: "Model Setup", subtitle: "Name and period", titleKey: "configurator.registry.layer1Title", subtitleKey: "configurator.registry.layer1Subtitle", icon: <FileText className="w-4 h-4" /> },
    { id: 2, title: "Configure", subtitle: "Project-specific inputs", titleKey: "configurator.registry.layer2Title", subtitleKey: "configurator.registry.layer2Subtitle", icon: <SlidersHorizontal className="w-4 h-4" /> },
    { id: 3, title: "Final Review", subtitle: "Check before saving", titleKey: "configurator.registry.layer3Title", subtitleKey: "configurator.registry.layer3Subtitle", icon: <ClipboardCheck className="w-4 h-4" /> },
    { id: 4, title: "Save & Calculate", subtitle: "Save and start the run", titleKey: "configurator.registry.layer4Title", subtitleKey: "configurator.registry.layer4Subtitle", icon: <Save className="w-4 h-4" /> },
];

export const LAYER_COUNT = LAYERS.length;

// Map step index.
export const MAP_STEP = 2;
