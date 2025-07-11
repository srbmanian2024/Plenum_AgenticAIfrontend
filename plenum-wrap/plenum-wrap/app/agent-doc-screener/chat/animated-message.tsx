'use client';

import React, { useState, useEffect, useRef } from 'react';

interface AnimatedMessageProps {
  formattedHtmlMessage: string; // Now expects an already formatted HTML string
  delayPerChar?: number; // Delay for each character
  delayPerLine?: number; // Additional delay after each line
  onAnimationEnd?: () => void;
}

/**
 * AnimatedMessage Component
 * Displays an HTML message with a word-by-word, line-by-line typing animation.
 * It expects the input message to be pre-formatted HTML.
 */
const AnimatedMessage: React.FC<AnimatedMessageProps> = ({
  formattedHtmlMessage,
  delayPerChar = 10,
  delayPerLine = 100,
  onAnimationEnd
}) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const animationRef = useRef<number | null>(null); // To store timeout ID

  useEffect(() => {
    // Clear any existing animation on new message or unmount
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }

    let currentContent = '';
    let charIndex = 0;
    let lineIndex = 0;
    // Split by <br /> for animation, as the input is already HTML
    const lines = formattedHtmlMessage.split('<br />');

    const animate = () => {
      if (lineIndex < lines.length) {
        const currentLine = lines[lineIndex];

        if (charIndex < currentLine.length) {
          currentContent += currentLine[charIndex];
          setDisplayedContent(currentContent);
          charIndex++;
          animationRef.current = window.setTimeout(animate, delayPerChar);
        } else {
          // End of line, add <br /> for display and move to next line
          // Only add <br /> if it's not the last line, as the formatter already adds them.
          // We need to be careful not to double-add <br />.
          // The formatter now adds <br /> to each line, so we just need to join them.
          // If the formatter ensures <br /> at the end of each line, we just append the full line.
          currentContent += currentLine; // Append the full line
          if (lineIndex < lines.length - 1) { // If there are more lines, add the <br /> separator
            currentContent += '<br />';
          }
          setDisplayedContent(currentContent);
          charIndex = 0;
          lineIndex++;
          animationRef.current = window.setTimeout(animate, delayPerLine);
        }
      } else {
        // All lines processed
        onAnimationEnd?.();
      }
    };

    // Start the animation
    animationRef.current = window.setTimeout(animate, delayPerChar);

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [formattedHtmlMessage, delayPerChar, delayPerLine, onAnimationEnd]);

  // Render the content directly as HTML
  return <div dangerouslySetInnerHTML={{ __html: displayedContent }} />;
};

export default AnimatedMessage;
