// lib/utils/message-formatter.ts

/**
 * Formats a raw chat message string by:
 * 1. Deduplicating immediate word repetitions (e.g., "TheThe", "word'sword's").
 * 2. Converting basic Markdown (e.g., **bold**, numbered lists) to HTML.
 * 3. Ensuring consistent line breaks.
 */
export function formatChatMessageContent(rawMessage: string): string {
  let processedText = rawMessage;

  // 1. Deduplicate immediate word repetitions and common suffixes like 's'
  // This regex targets patterns like "WordWord" or "Word'sWord's" (e.g., "UNUNDPDP's's")
  // It's a heuristic, but aims to catch common streaming artifacts.
  processedText = processedText.replace(/(\b\w+)\1\b/gi, '$1'); // Catches "WordWord" (case-insensitive)
  processedText = processedText.replace(/('s')\1/gi, '$1'); // Catches "'s's"

  // Additional check for cases like "stream streamlineslines" - this is harder.
  // If the issue is partial word overlap, it's ideally fixed server-side.
  // For now, we'll rely on the above and the list formatting below.

  // 2. Markdown to HTML conversion
  // Convert **bold** to <strong>bold</strong>
  processedText = processedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Convert *italic* to <em>italic</em> (if applicable)
  processedText = processedText.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Handle numbered lists (e.g., "1. Item", "2. Another Item")
  // This logic processes lines to correctly wrap list items in <ol> and <li> tags.
  const lines = processedText.split('\n');
  let finalHtmlParts: string[] = [];
  let currentListItems: string[] = [];
  let inCodeBlock = false; // To prevent markdown parsing inside code blocks (if you add them later)

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Basic code block detection (if you introduce ``` in future)
    if (trimmedLine.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      // If we were in a list, close it before the code block
      if (currentListItems.length > 0) {
        finalHtmlParts.push('<ol>' + currentListItems.join('') + '</ol>');
        currentListItems = [];
      }
      finalHtmlParts.push(line + '<br />'); // Add code block line as is
      continue;
    }

    if (inCodeBlock) {
      finalHtmlParts.push(line + '<br />'); // Add code block content as is
      continue;
    }

    const isListItem = /^\d+\.\s+/.test(trimmedLine);

    if (isListItem) {
      currentListItems.push(`<li>${trimmedLine.replace(/^\d+\.\s*/, '')}</li>`);
    } else {
      // If we were in a list, close it now
      if (currentListItems.length > 0) {
        finalHtmlParts.push('<ol>' + currentListItems.join('') + '</ol>');
        currentListItems = [];
      }
      // Add the current non-list line, handling empty lines
      if (line.trim() === '') {
        finalHtmlParts.push('<br />'); // Preserve explicit empty lines as breaks
      } else {
        finalHtmlParts.push(line + '<br />'); // Add <br /> for non-list lines
      }
    }
  }
  // After loop, if there are remaining list items, close the list
  if (currentListItems.length > 0) {
    finalHtmlParts.push('<ol>' + currentListItems.join('') + '</ol>');
  }

  // The final join should just be an empty string as <br /> are already added.
  return finalHtmlParts.join('');
}
