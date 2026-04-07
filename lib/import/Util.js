export function elementToString(e) {
  if (!e) {
    return '<null>';
  }

  return '<' + escapeAttr(e.$type) + (e.id ? ' id="' + escapeAttr(e.id) : '') + '" />';
}

function escapeAttr(value) {
  return String(value).replace(/[&<>"']/g, function(match) {
    switch (match) {
    case '&': return '&amp;';
    case '<': return '&lt;';
    case '>': return '&gt;';
    case '"': return '&quot;';
    case '\'': return '&#39;';
    default: return match;
    }
  });
}