import classicHead from "@/assets/generated/classic-head.png";
import classicBody from "@/assets/generated/classic-body.png";
import classicArm from "@/assets/generated/classic-arm.png";
import ceramicHead from "@/assets/generated/ceramic-head.png";
import ceramicBody from "@/assets/generated/ceramic-body.png";
import ceramicArm from "@/assets/generated/ceramic-arm.png";
import illustratedHead from "@/assets/generated/illustrated-head.png";
import illustratedBody from "@/assets/generated/illustrated-body.png";
import illustratedArm from "@/assets/generated/illustrated-arm.png";
import glassHead from "@/assets/generated/glass-head.png";
import glassBody from "@/assets/generated/glass-body.png";
import glassArm from "@/assets/generated/glass-arm.png";

export type AssistantVariant = "classic" | "ceramic" | "illustrated" | "glass";
export interface AssistantLayerPart { src: string; x: number; y: number; width: number; height: number; }
// Uniform placement within a shared canvas; source PNGs stay unchanged.
export const assistantLayers: Record<AssistantVariant, { head: AssistantLayerPart; body: AssistantLayerPart; arm: AssistantLayerPart; faceTransform: string }> = {
  classic: {
    head: { src: classicHead, x: 2.5494, y: 3.4234, width: 94.8970, height: 94.8970 },
    body: { src: classicBody, x: -3.0470, y: -4.8472, width: 106.5187, height: 106.5187 },
    arm: { src: classicArm, x: -7.9672, y: -9.9302, width: 117.9525, height: 117.9525 },
    faceTransform: "",
  },
  ceramic: {
    head: { src: ceramicHead, x: 0.0000, y: 0.0000, width: 100.0000, height: 100.0000 },
    body: { src: ceramicBody, x: 0.0000, y: 0.0000, width: 100.0000, height: 100.0000 },
    arm: { src: ceramicArm, x: 0.0000, y: 0.0000, width: 100.0000, height: 100.0000 },
    faceTransform: "",
  },
  illustrated: {
    head: { src: illustratedHead, x: 0.1949, y: -0.0359, width: 99.5305, height: 99.5305 },
    body: { src: illustratedBody, x: -0.5788, y: -1.1245, width: 101.3193, height: 101.3193 },
    arm: { src: illustratedArm, x: -13.3187, y: -16.9979, width: 128.2258, height: 128.2258 },
    faceTransform: "",
  },
  glass: {
    head: { src: glassHead, x: 0.4274, y: 0.2445, width: 99.0654, height: 99.0654 },
    body: { src: glassBody, x: -3.5457, y: -6.3531, width: 107.2626, height: 107.2626 },
    arm: { src: glassArm, x: -16.8941, y: -22.5698, width: 134.7458, height: 134.7458 },
    faceTransform: "",
  },
};
