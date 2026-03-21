/**
 * Simple markdown-to-HTML converter for AI insights.
 * Handles bold, italic, line breaks, and bullet points.
 * Strips any <script> tags for safety.
 */
export function simpleMarkdownToHtml(text: string): string {
  let html = text;

  // Escape HTML entities first (except for our own tags)
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Bold: **text**
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Italic: *text*
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Bullet points: lines starting with "- " become <li> items
  // Group consecutive bullet lines into <ul>
  const lines = html.split('\n');
  const processed: string[] = [];
  let inList = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('- ')) {
      if (!inList) {
        processed.push('<ul class="list-disc pl-5 space-y-1 my-2">');
        inList = true;
      }
      processed.push(`<li>${trimmed.slice(2)}</li>`);
    } else {
      if (inList) {
        processed.push('</ul>');
        inList = false;
      }
      processed.push(trimmed === '' ? '<br/>' : `<p class="my-1">${line}</p>`);
    }
  }
  if (inList) {
    processed.push('</ul>');
  }

  html = processed.join('\n');

  // Remove any script tags as a safety measure
  html = html.replace(/&lt;script[\s\S]*?&lt;\/script&gt;/gi, '');

  return html;
}
