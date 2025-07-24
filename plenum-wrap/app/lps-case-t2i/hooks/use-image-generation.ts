import { useState } from "react";
import { GeneratedImage, ImageError, ProviderTiming } from "@/app/lps-case-t2i/lib/image-types";
import { initializeProviderRecord, ProviderKey } from "@/app/lps-case-t2i/lib/provider-config";

// Add instanceId to uniquely identify provider instances
interface ProviderInstance {
  provider: ProviderKey;
  instanceId: string;
  model: string;
}

interface UseImageGenerationReturn {
  images: GeneratedImage[];
  errors: ImageError[];
  timings: Record<string, ProviderTiming>;
  failedProviders: string[];
  isLoading: boolean;
  startGeneration: (
    prompt: string,
    providerInstances: ProviderInstance[]
  ) => Promise<void>;
  resetState: () => void;
  activePrompt: string;
}

export function useImageGeneration(): UseImageGenerationReturn {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [errors, setErrors] = useState<ImageError[]>([]);
  const [timings, setTimings] = useState<Record<string, ProviderTiming>>({});
  const [failedProviders, setFailedProviders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activePrompt, setActivePrompt] = useState("");

  const resetState = () => {
    setImages([]);
    setErrors([]);
    setTimings({});
    setFailedProviders([]);
    setIsLoading(false);
  };

  const startGeneration = async (
    prompt: string,
    providerInstances: ProviderInstance[]
  ) => {
    setActivePrompt(prompt);
    try {
      setIsLoading(true);
      setImages(
        providerInstances.map((instance) => ({
          provider: instance.provider,
          image: null,
          proxyImage: null,
          modelId: instance.model,
          instanceId: instance.instanceId,
        })),
      );

      setErrors([]);
      setFailedProviders([]);

      const now = Date.now();
      setTimings(
        Object.fromEntries(
          providerInstances.map((instance) => [
            instance.instanceId, 
            { startTime: now }
          ]),
        )
      );

      const generateImage = async (instance: ProviderInstance) => {
        const { provider, model, instanceId } = instance;
        const startTime = now;
        console.log(
          `Generate image request [provider=${provider}, instanceId=${instanceId}, modelId=${model}]`,
        );
        try {
          const request = {
            prompt,
            provider,
            modelId: model,
          };

          const response = await fetch("/api/generate-images", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(request),
          });
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error || `Server error: ${response.status}`);
          }

          const completionTime = Date.now();
          const elapsed = completionTime - startTime;
          setTimings((prev) => ({
            ...prev,
            [instanceId]: {
              startTime,
              completionTime,
              elapsed,
            },
          }));

          console.log(
            `Successful image response [provider=${provider}, instanceId=${instanceId}, modelId=${model}, elapsed=${elapsed}ms]`,
          );

          setImages((prevImages) =>
            prevImages.map((item) =>
              "instanceId" in item && item.instanceId === instanceId
                ? {
                    ...item,
                    image: data.image ?? null,
                    proxyImage: data.proxyImage ?? null,
                    modelId: model
                  }
                : item,
            ),
          );
        } catch (err) {
          console.error(
            `Error [provider=${provider}, instanceId=${instanceId}, modelId=${model}]:`,
            err,
          );
          setFailedProviders((prev) => [...prev, instanceId]);
          setErrors((prev) => [
            ...prev,
            {
              provider,
              message:
                err instanceof Error
                  ? err.message
                  : "An unexpected error occurred",
              instanceId,
            },
          ]);

          setImages((prevImages) =>
            prevImages.map((item) =>
              "instanceId" in item && item.instanceId === instanceId
                ? { ...item, image: null, proxyImage: null, modelId: model }
                : item,
            ),
          );
        }
      };

      const fetchPromises = providerInstances.map(generateImage);

      await Promise.all(fetchPromises);
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    images,
    errors,
    timings,
    failedProviders,
    isLoading,
    startGeneration,
    resetState,
    activePrompt,
  };
}
