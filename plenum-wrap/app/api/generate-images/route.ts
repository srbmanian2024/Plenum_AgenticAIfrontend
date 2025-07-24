import { NextRequest, NextResponse } from "next/server";
import { GenerateImageRequest } from "@/app/lps-case-t2i/lib/api-types";

/**
 * Intended to be slightly less than the maximum execution time allowed by the
 * runtime so that we can gracefully terminate our request.
 */
const TIMEOUT_MILLIS = 55 * 1000;

const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMillis: number,
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), timeoutMillis),
    ),
  ]);
};

export async function POST(req: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  const { prompt } = (await req.json()) as GenerateImageRequest;

  try {
    if (!prompt) {
      const error = "Invalid request parameters: prompt is missing.";
      console.error(`${error} [requestId=${requestId}]`);
      return NextResponse.json({ error }, { status: 400 });
    }

    console.log(`Received image generation request [requestId=${requestId}, prompt=${prompt}]`);

    const startstamp = performance.now();

    const VISION_AGENT_API_URL = "https://agent-api.gentlesmoke-fd81e91e.uaenorth.azurecontainerapps.io/vision/txt2img";

    const generatePromise = withTimeout(
      fetch(VISION_AGENT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add any required API keys or authorization headers here if needed by Vision Agent
          // For example: 'Authorization': `Bearer ${process.env.VISION_AGENT_API_KEY}`
        },
        body: JSON.stringify({ prompt: prompt })
      }),
      TIMEOUT_MILLIS
    );

    const response = await generatePromise;

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Vision Agent API error [requestId=${requestId}, status=${response.status}, error=${errorText}]`
      );
      return NextResponse.json(
        { error: `Vision Agent API error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const result = await response.json();

    console.log(`Full Vision Agent API Response [requestId=${requestId}]:`, JSON.stringify(result, null, 2));

    let imageUrl: string | null = null;
    let proxyUrl: string | null = null;

    if (result.proxy_links && result.proxy_links.length > 0) {
      imageUrl = result.proxy_links[0];
      proxyUrl = result.proxy_links[0];
    } else if (result.output && result.output.length > 0) {
      imageUrl = result.output[0];
    }

    if (!imageUrl) {
      console.error(
        `Image URL not found in Vision Agent response (neither proxy_links nor output) [requestId=${requestId}]:`,
        result
      );
      return NextResponse.json(
        { error: "Failed to get image URL from Vision Agent." },
        { status: 500 }
      );
    }

    console.log(
      `Completed image request [requestId=${requestId}, elapsed=${(
        (performance.now() - startstamp) /
        1000
      ).toFixed(1)}s]. Image URL: ${imageUrl}`
    );

    return NextResponse.json({
      provider: "vision-agent",
      image: imageUrl,
      proxyImage: proxyUrl,
    }, { status: 200 });

  } catch (error) {
    console.error(
      `Error generating image [requestId=${requestId}, prompt=${prompt}]: `,
      error,
    );
    return NextResponse.json(
      {
        error: "Failed to generate image. Please try again later.",
      },
      { status: 500 },
    );
  }
}
