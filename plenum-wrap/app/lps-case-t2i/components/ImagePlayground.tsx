"use client";

import { useState } from "react";
import { ModelSelect } from "@/app/lps-case-t2i/components/ModelSelect";
import { PromptInput } from "@/app/lps-case-t2i/components/PromptInput";
import { ModelCardCarousel } from "@/app/lps-case-t2i/components/ModelCardCarousel";
import {
  MODEL_CONFIGS,
  PROVIDERS,
  PROVIDER_ORDER,
  ProviderKey,
  ModelMode,
} from "@/app/lps-case-t2i/lib/provider-config";
import { Suggestion } from "@/app/lps-case-t2i/lib/suggestions";
import { useImageGeneration } from "@/app/lps-case-t2i/hooks/use-image-generation";
import { Header } from "./Header";

interface ProviderInstance {
  id: string;
  providerKey: ProviderKey;
  model: string;
  enabled: boolean;
}

export function ImagePlayground({
  suggestions,
}: {
  suggestions: Suggestion[];
}) {
  const {
    images,
    timings,
    failedProviders,
    isLoading,
    startGeneration,
    activePrompt,
  } = useImageGeneration();

  const [showProviders, setShowProviders] = useState(true);
  const [providerInstances, setProviderInstances] = useState<ProviderInstance[]>(
    // Initialize only with Vision Agent instances, removing Fal AI.
    PROVIDER_ORDER.flatMap((key) => [
      {
        id: `${key}-1`,
        providerKey: key,
        model: MODEL_CONFIGS.performance[key],
        enabled: true,
      },
      {
        id: `${key}-2`,
        providerKey: key,
        model: MODEL_CONFIGS.quality[key],
        enabled: true,
      },
    ])
  );
  const [mode, setMode] = useState<ModelMode>("performance");

  const toggleView = () => {
    setShowProviders((prev) => !prev);
  };

  const handleModeChange = (newMode: ModelMode) => {
    setMode(newMode);
    setProviderInstances((prev) =>
      prev.map((instance) => ({
        ...instance,
        model: MODEL_CONFIGS[newMode][instance.providerKey],
      }))
    );
    setShowProviders(true);
  };

  const handleModelChange = (instanceId: string, model: string) => {
    setProviderInstances((prev) =>
      prev.map((instance) =>
        instance.id === instanceId ? { ...instance, model } : instance
      )
    );
  };

  const handleProviderToggle = (instanceId: string, enabled: boolean) => {
    setProviderInstances((prev) =>
      prev.map((instance) =>
        instance.id === instanceId ? { ...instance, enabled } : instance
      )
    );
  };

  const handlePromptSubmit = (newPrompt: string) => {
    const activeInstances = providerInstances.filter((instance) => instance.enabled);
    if (activeInstances.length > 0) {
      const providerInstancesForGeneration = activeInstances.map(instance => ({
        provider: instance.providerKey,
        instanceId: instance.id,
        model: instance.model
      }));
      
      startGeneration(newPrompt, providerInstancesForGeneration);
    }
    setShowProviders(false);
  };

  const getModelProps = () => {
    return providerInstances.map((instance) => {
      const provider = PROVIDERS[instance.providerKey];
      const imageItem = images.find((img) => 
        img.provider === instance.providerKey && 
        "instanceId" in img && img.instanceId === instance.id
      );
      const imageData = imageItem?.image;
      const proxyImageData = imageItem?.proxyImage;
      const modelId = imageItem?.modelId ?? "N/A";
      const timing = timings[instance.id] || {};

      return {
        id: instance.id, // Ensure id is passed for use as key
        label: `${provider.displayName} ${instance.id.split('-')[1]}`, // Label includes instance number for clarity
        models: [...provider.models], // Convert readonly array to mutable array
        value: instance.model,
        providerKey: instance.providerKey,
        onChange: (model: string) => handleModelChange(instance.id, model),
        iconPath: provider.iconPath,
        color: provider.color,
        enabled: instance.enabled,
        onToggle: (enabled: boolean) => handleProviderToggle(instance.id, enabled),
        image: imageData,
        proxyImage: proxyImageData,
        modelId,
        timing,
        failed: failedProviders.includes(instance.id),
      };
    });
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Header />
        <PromptInput
          onSubmit={handlePromptSubmit}
          isLoading={isLoading}
          showProviders={showProviders}
          onToggleProviders={toggleView}
          mode={mode}
          onModeChange={handleModeChange}
          suggestions={suggestions}
        />
        <>
          {(() => {
            return (
              <>
                <div className="md:hidden">
                  {/* ModelCardCarousel should use props.id as key for its children */}
                  <ModelCardCarousel models={getModelProps()} />
                </div>
                <div className="hidden md:grid md:grid-cols-2 gap-8">
                  {getModelProps().map((props) => (
                    // **CRITICAL FIX**: Use props.id as the key for ModelSelect
                    <ModelSelect key={props.id} {...props} />
                  ))}
                </div>
                {activePrompt && activePrompt.length > 0 && (
                  <div className="text-center mt-4 text-muted-foreground">
                    {activePrompt}
                  </div>
                )}
              </>
            );
          })()}
        </>
      </div>
    </div>
  );
}
