import type { Node } from 'web-tree-sitter';
import type { ParseContext, ParseStrategy } from './ParseStrategy';

export class CssParseStrategy implements ParseStrategy {
  parseCapture(
    capture: { node: Node; name: string },
    lines: string[],
    processedChunks: Set<string>,
    context: ParseContext,
  ): string | null {
    const { name, node } = capture;
    const startRow = node.startPosition.row;
    const endRow = node.endPosition.row;

    if (!lines[startRow]) {
      return null;
    }

    // Process CSS-specific capture names
    const isCommentCapture = name.includes('comment');
    const isSelectorCapture =
      name.includes('selector') || name.includes('definition.selector');
    const isAtRuleCapture =
      name.includes('at_rule') || name.includes('definition.at_rule');

    const shouldSelect =
      isCommentCapture || isSelectorCapture || isAtRuleCapture;

    if (!shouldSelect) {
      return null;
    }

    // Extract all lines for comments, only the first line for others
    let selectedLines: string[];
    if (isCommentCapture) {
      selectedLines = lines.slice(startRow, endRow + 1);
    } else {
      // For selectors and at-rules, extract only the first line
      selectedLines = [lines[startRow]];
    }

    if (selectedLines.length < 1) {
      return null;
    }

    const chunk = selectedLines.join('\n');
    const normalizedChunk = chunk.trim();

    if (processedChunks.has(normalizedChunk)) {
      return null;
    }

    processedChunks.add(normalizedChunk);
    return chunk;
  }
}
