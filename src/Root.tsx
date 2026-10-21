import React from "react";
import { Composition } from "remotion";
import { Doc } from "./Doc";
import scenesData from "./data/scenes.json";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Doc" component={Doc} durationInFrames={(scenesData as any).frames} fps={30} width={1920} height={1080} />
  </>
);
