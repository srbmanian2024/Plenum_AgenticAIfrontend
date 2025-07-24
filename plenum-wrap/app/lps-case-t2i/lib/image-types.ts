import { ProviderKey } from "./provider-config";

export interface GeneratedImage {
  provider: ProviderKey;
  image: string | null;
  proxyImage?: string | null; // Added proxyImage for the proxy URL
  modelId?: string;
  instanceId?: string;
}

export interface ImageResult extends GeneratedImage {
  // ImageResult now extends GeneratedImage to inherit proxyImage
}

export interface ImageError {
  provider: ProviderKey;
  message: string;
  instanceId?: string;
}

export interface ProviderTiming {
  startTime?: number;
  completionTime?: number;
  elapsed?: number;
}
export type { ProviderKey };

