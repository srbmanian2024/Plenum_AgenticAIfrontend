export const PROVIDERS = {
  "vision-agent": {
    // displayName: "Vision Agen",
    // iconPath: "/provider-icons/vision-agent.svg", // You might need to create this icon
    // color: "from-blue-500 to-purple-500", // Example color
    models: [
      "default-vision-model", // Placeholder: Replace with actual model IDs if Vision Agent has them
      "another-vision-model", // Example for a second model
    ],
  },
} as const; // Crucial: 'as const' ensures literal types for keys and values

// Derive ProviderKey directly from the keys of the PROVIDERS object
export type ProviderKey = keyof typeof PROVIDERS;
export type ModelMode = "performance" | "quality";

export const MODEL_CONFIGS: Record<ModelMode, Record<ProviderKey, string>> = {
  performance: {
    "vision-agent": "default-vision-model", // Placeholder
  },
  quality: {
    "vision-agent": "another-vision-model", // Placeholder for quality model
  },
};

// Ensure PROVIDER_ORDER uses the derived ProviderKey
export const PROVIDER_ORDER: ProviderKey[] = Object.keys(PROVIDERS) as ProviderKey[];

export const initializeProviderRecord = <T>(defaultValue?: T) =>
  Object.fromEntries(
    PROVIDER_ORDER.map((key) => [key, defaultValue]),
  ) as Record<ProviderKey, T>;
