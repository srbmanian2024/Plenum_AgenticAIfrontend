// lib/utils/message-formatter.ts

/**
 * Formats a raw chat message string into HTML.
 * This is a basic implementation; for robust Markdown, consider libraries like 'marked' or 'remark'.
 * @param text The raw text content of the message.
 * @returns HTML string with basic formatting (e.g., newlines to <br />).
 */
export function formatChatMessageContent(text: string): string {
  if (!text) return '';

  let formattedText = text;

  // Convert newlines to HTML break tags
  formattedText = formattedText.replace(/\n/g, '<br />');

  // Basic bolding (e.g., **text** -> <strong>text</strong>)
  formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Basic italics (e.g., *text* -> <em>text</em>)
  formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Add more formatting rules here if needed (e.g., links, lists, etc.)

  return formattedText;
}