'use client'

import React, { useEffect } from 'react'

interface Attachment {
  name: string | undefined
  url: string
  contentType: string
}

interface AttachmentPreviewProps {
  attachments: Attachment[]
}

export const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({
  attachments
}) => {
  // Clean up object URLs when component unmounts or attachments change
  useEffect(() => {
    return () => {
      attachments.forEach(att => {
        if (att.url.startsWith('blob:')) {
          URL.revokeObjectURL(att.url)
        }
      })
    }
  }, [attachments])

  if (!attachments?.length) return null

  return (
    <div className="flex flex-wrap gap-2"> {/* Reduced gap for denser layout */}
      {attachments.map((att, index) => {
        const isImage = att.contentType.startsWith('image/')
        const isPdf = att.contentType === 'application/pdf'
        const isWordDoc =
          att.contentType === 'application/msword' ||
          att.contentType ===
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

        return (
          <div
            key={index}
            className="flex flex-col items-center justify-center p-2 rounded-md border border-gray-300 shadow-sm bg-gray-50 text-center cursor-pointer hover:bg-gray-100 transition-colors duration-200"
            title={att.name} // Show full name on hover
            style={{ maxWidth: '100px', maxHeight: '100px', flexShrink: 0 }} // Fixed size for consistency
          >
            {isImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={att.url}
                alt={att.name}
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <a
                href={att.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center w-full h-full text-blue-600 hover:text-blue-800 transition-colors duration-200"
              >
                <span className="text-3xl mb-1">
                  {isPdf ? '📄' : isWordDoc ? '📝' : '📎'}
                </span>
                <span className="text-xs font-medium text-gray-700 truncate w-full px-1">
                  {att.name}
                </span>
              </a>
            )}
          </div>
        )
      })}
    </div>
  )
}