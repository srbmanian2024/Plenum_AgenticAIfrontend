import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowUp, MessageCircle, Search } from 'lucide-react';
import { FileUploadButton } from '@/components/file-upload-button';
import { AttachmentPreview } from '@/components/attachment-preview';
import { Attachment } from '../types/chat'; // Import Attachment type

interface ChatInputBarProps {
  input: string;
  setInput: (value: string) => void;
  handleSend: () => void;
  handleFilesSelected: (files: File[]) => void;
  selectedFilesForUpload: File[];
  previewAttachments: Attachment[];
  isSendButtonDisabled: boolean;
}

export function ChatInputBar({
  input,
  setInput,
  handleSend,
  handleFilesSelected,
  selectedFilesForUpload,
  previewAttachments,
  isSendButtonDisabled,
}: ChatInputBarProps) {
  return (
    <>
      {previewAttachments.length > 0 && (
        <div className="w-full max-w-2xl px-2 py-2 -mb-2">
          <AttachmentPreview attachments={previewAttachments} />
        </div>
      )}
      <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-xl shadow-lg flex items-center p-2 gap-2 mb-4 relative z-10">
        <Button
          variant="ghost"
          className="flex items-center gap-1 text-gray-700 px-3 py-2 rounded-lg hover:bg-orange-500 hover:text-white transition-colors duration-200"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="text-sm">Agent Doc Summarizer</span>
        </Button>

        <Input
          id="message"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask a question..."
          className="flex-1 border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-800 placeholder-gray-500 text-base"
        />

        <Button
          variant="ghost"
          className="p-2 rounded-lg hover:bg-orange-500 hover:text-white transition-colors duration-200"
        >
          <Search className="w-4 h-4" />
          <span className="ml-1 text-sm hidden sm:inline">Search</span>
        </Button>

        <FileUploadButton onFileSelect={handleFilesSelected} />

        <Button
          onClick={handleSend}
          className="p-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white transition-colors duration-200"
          disabled={isSendButtonDisabled}
        >
          <ArrowUp className="w-4 h-4" />
        </Button>
      </div>
    </>
  );
}