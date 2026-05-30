type Node = {
  type: string
  attrs?: Record<string, unknown>
  content?: Node[]
  marks?: { type: string; attrs?: Record<string, unknown> }[]
  text?: string
}

function renderMarks(text: string, marks: Node['marks'] = []): string {
  let out = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  for (const mark of marks) {
    if (mark.type === 'bold') out = `<strong>${out}</strong>`
    else if (mark.type === 'italic') out = `<em>${out}</em>`
    else if (mark.type === 'underline') out = `<u>${out}</u>`
    else if (mark.type === 'strike') out = `<s>${out}</s>`
    else if (mark.type === 'code') out = `<code>${out}</code>`
    else if (mark.type === 'link') {
      const href = (mark.attrs?.href as string) ?? '#'
      out = `<a href="${href}" target="_blank" rel="noopener noreferrer">${out}</a>`
    }
  }
  return out
}

function renderNode(node: Node): string {
  if (node.type === 'text') return renderMarks(node.text ?? '', node.marks)

  const inner = (node.content ?? []).map(renderNode).join('')

  switch (node.type) {
    case 'paragraph':     return `<p>${inner || '&nbsp;'}</p>`
    case 'heading': {
      const level = (node.attrs?.level as number) ?? 2
      return `<h${level}>${inner}</h${level}>`
    }
    case 'bulletList':    return `<ul>${inner}</ul>`
    case 'orderedList':   return `<ol>${inner}</ol>`
    case 'listItem':      return `<li>${inner}</li>`
    case 'blockquote':    return `<blockquote>${inner}</blockquote>`
    case 'codeBlock':     return `<pre><code>${inner}</code></pre>`
    case 'hardBreak':     return '<br>'
    case 'horizontalRule':return '<hr>'
    case 'image': {
      const src = node.attrs?.src as string
      const alt = (node.attrs?.alt as string) ?? ''
      return `<img src="${src}" alt="${alt}" loading="lazy">`
    }
    default: return inner
  }
}

export function tiptapToHtml(doc: Record<string, unknown> | null): string {
  if (!doc) return ''
  const root = doc as Node
  if (root.type !== 'doc' || !root.content) return ''
  return root.content.map(renderNode).join('')
}

export function tiptapToText(doc: Record<string, unknown> | null): string {
  if (!doc) return ''
  const html = tiptapToHtml(doc)
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

export function estimateReadTime(doc: Record<string, unknown> | null): number {
  const text = tiptapToText(doc)
  const words = text.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}
