import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { textStyles, fontFamily } from '@/constants/typography';

interface HtmlPreviewProps {
  html: string;
  numberOfLines?: number;
  style?: TextStyle;
}

interface TextSegment {
  text: string;
  bold?: boolean;
  italic?: boolean;
  strike?: boolean;
}

function parseHtmlToSegments(html: string, skipFirstLine: boolean = true): TextSegment[] {
  // First, extract lines from HTML
  let processedHtml = html;

  if (skipFirstLine) {
    // Remove the first block element (title is shown separately)
    processedHtml = processedHtml
      .replace(/^[\s]*<(h[1-6]|p|div|li|blockquote)[^>]*>[\s\S]*?<\/\1>/i, '');
  }

  // Now normalize the HTML by adding spaces around block elements
  let text = processedHtml
    // Add bullet points for list items
    .replace(/<li[^>]*>/gi, ' • ')
    .replace(/<\/li>/gi, ' ')
    // Convert block elements to spaces
    .replace(/<\/(p|div|blockquote|h[1-6])>/gi, ' ')
    .replace(/<(p|div|blockquote|h[1-6])[^>]*>/gi, ' ')
    // Remove list wrappers
    .replace(/<\/?(ul|ol)[^>]*>/gi, ' ')
    // Handle br tags
    .replace(/<br\s*\/?>/gi, ' ')
    // Remove task list checkboxes
    .replace(/<input[^>]*>/gi, '')
    .replace(/<label[^>]*>[\s\S]*?<\/label>/gi, '');

  const segments: TextSegment[] = [];

  // Simple regex to find formatting tags
  const formatRegex = /<(strong|b|em|i|s|strike)>([\s\S]*?)<\/\1>/gi;
  let match;

  // Process text with formatting
  let lastIndex = 0;

  while ((match = formatRegex.exec(text)) !== null) {
    // Add text before this match
    if (match.index > lastIndex) {
      const beforeText = text.slice(lastIndex, match.index).replace(/<[^>]*>/g, '');
      if (beforeText.trim()) {
        segments.push({ text: normalizeWhitespace(beforeText) });
      }
    }

    // Add formatted text
    const tag = match[1].toLowerCase();
    const content = match[2].replace(/<[^>]*>/g, '');
    if (content.trim()) {
      segments.push({
        text: normalizeWhitespace(content),
        bold: tag === 'strong' || tag === 'b',
        italic: tag === 'em' || tag === 'i',
        strike: tag === 's' || tag === 'strike',
      });
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex).replace(/<[^>]*>/g, '');
    if (remainingText.trim()) {
      segments.push({ text: normalizeWhitespace(remainingText) });
    }
  }

  // If no segments, just strip all HTML
  if (segments.length === 0) {
    const plainText = normalizeWhitespace(html.replace(/<[^>]*>/g, ' '));
    if (plainText) {
      segments.push({ text: plainText });
    }
  }

  return segments;
}

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim() + ' ';
}

export function HtmlPreview({ html, numberOfLines = 3, style }: HtmlPreviewProps) {
  const segments = parseHtmlToSegments(html);

  if (segments.length === 0) {
    return null;
  }

  return (
    <Text style={[styles.preview, style]} numberOfLines={numberOfLines}>
      {segments.map((segment, index) => {
        const textStyle: TextStyle[] = [];
        if (segment.bold) textStyle.push(styles.bold);
        if (segment.italic) textStyle.push(styles.italic);
        if (segment.strike) textStyle.push(styles.strike);

        return (
          <Text key={index} style={textStyle.length > 0 ? textStyle : undefined}>
            {segment.text}
          </Text>
        );
      })}
    </Text>
  );
}

const styles = StyleSheet.create({
  preview: {
    ...textStyles.bodySmall,
    // Note: color should be provided via the style prop for proper theming
  },
  bold: {
    fontFamily: fontFamily.monoSemibold,
    fontWeight: '600',
  },
  italic: {
    fontStyle: 'italic',
  },
  strike: {
    textDecorationLine: 'line-through',
  },
});
