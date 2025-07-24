import { ImagePlayground } from "@/app/lps-case-t2i/components/ImagePlayground";
import { getRandomSuggestions } from "@/app/lps-case-t2i/lib/suggestions";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <div className="flex flex-col flex-1 w-full min-h-screen overflow-y-auto">
      <ImagePlayground suggestions={getRandomSuggestions()} />;
    </div>
  );
}
