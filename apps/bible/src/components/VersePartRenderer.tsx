import type { VersePart } from '../types/bible';

interface VersePartRendererProps {
  parts: VersePart[];
  onFootnoteClick?: (footnoteId: string) => void;
  onLiturgyClick?: (liturgyId: string) => void;
  onCrossRefClick?: (crossRefId: string) => void;
  className?: string;
}

/**
 * VersePartRenderer - Universal component for rendering rich text from verse.parts
 *
 * Handles:
 * - Plain text strings
 * - Italic formatting
 * - Cross-reference chips (tappable)
 * - Footnote markers (superscript, tappable)
 * - Liturgy note markers (superscript, tappable)
 *
 * Used in: Reader verses, Lessons, Metadata, Footnote/Liturgy sheets
 */
export function VersePartRenderer({
  parts,
  onFootnoteClick,
  onLiturgyClick,
  onCrossRefClick,
  className = 'text-foreground leading-relaxed'
}: VersePartRendererProps) {
  return (
    <text className={className}>
      {parts.map((part, index) => {
        // Plain text string
        if (typeof part === 'string') {
          return (
            <text key={index}>
              {part}
            </text>
          );
        }

        // Italic text
        if ('italic' in part) {
          return (
            <text key={index} className="italic">
              {part.italic}
            </text>
          );
        }

        // Oblique text (prophecies/quotes)
        if ('oblique' in part) {
          return (
            <text key={index} className="italic opacity-90">
              {part.oblique}
            </text>
          );
        }

        // Divine name (LORD in OT)
        if ('divine_name' in part) {
          return (
            <text key={index} className="uppercase text-[0.85em] tracking-wider font-semibold">
              {part.divine_name}
            </text>
          );
        }

        // Small caps (JESUS in NT)
        if ('small_caps' in part) {
          return (
            <text key={index} className="uppercase text-[0.9em] tracking-wide">
              {part.small_caps}
            </text>
          );
        }

        // Line break
        if ('line_break' in part) {
          return <text key={index}>{'\n'}</text>;
        }

        // Cross-reference (chip/link) - render inline as superscript
        if ('cross_ref' in part) {
          return (
            <text
              key={index}
              className="text-xs text-primary align-top"
              bindtap={onCrossRefClick ? () => onCrossRefClick(part.cross_ref) : undefined}
            >
              [{part.text}]
            </text>
          );
        }

        // Footnote marker - Don't render (handled at verse level)
        if ('footnote' in part) {
          return null;
        }

        // Liturgy note marker - Don't render (handled at verse level)
        if ('liturgy' in part) {
          return null;
        }

        return null;
      })}
    </text>
  );
}
