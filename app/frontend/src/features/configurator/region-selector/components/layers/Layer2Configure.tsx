import type { FC } from "react";
import { SlidersHorizontal } from "lucide-react";
import { useTranslation } from "@/i18n";

import { LayerShell } from "./shared/LayerShell";
import { QuestionSection } from "../wizard";
import type { ConfiguratorContext } from "./types";

/** Project inputs placeholder. */
export const Layer2Configure: FC<{ ctx: ConfiguratorContext }> = () => {
    const { t } = useTranslation();

    return (
        <LayerShell
            purpose={t("configurator.layer2.purpose", "Set the project-specific inputs of the model. The map is available for selecting places or areas.")}
            nextStepHint={t("configurator.layer2.nextStepHint", "Next you'll review the model before saving.")}
        >
            <QuestionSection
                compact
                index={1}
                title={t("configurator.layer2.question", "What should the model use?")}
                description={t("configurator.layer2.info", "Replace this step with your project's inputs.")}
            >
                <div
                    data-tour="configure-step"
                    className="flex items-start gap-3 rounded-lg border border-dashed border-border bg-muted/30 px-3 py-4 text-xs text-muted-foreground"
                >
                    <SlidersHorizontal className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>
                        {t(
                            "configurator.layer2.placeholder",
                            "No project inputs yet. Add form fields here and store them in the model configuration.",
                        )}
                    </p>
                </div>
            </QuestionSection>
        </LayerShell>
    );
};
