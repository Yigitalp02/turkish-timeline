/**
 * RichTextRenderer — Server Component.
 *
 * Converts a Payload v3 / Lexical rich-text JSON AST into React nodes.
 *
 * Rendering strategy:
 *  • renderNode() is a pure recursive function — no hooks, safe on the server.
 *  • Custom blocks are matched by `node.fields.blockType` (the block slug).
 *  • FootnoteBlock uses a two-pass approach: pre-collect all footnotes to
 *    assign sequential numbers, then render inline markers + bibliography.
 *  • InlinePersonMentionBlock delegates to <PersonTooltip> (Client Component)
 *    but passes all person data as serializable props — no client-side fetch.
 *
 * Text format bitmask (Lexical standard):
 *   BOLD=1  ITALIC=2  STRIKETHROUGH=4  UNDERLINE=8  CODE=16  SUB=32  SUP=64
 */

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FileText, MapPin, Info, AlertTriangle, Star } from 'lucide-react'
import { PersonTooltip } from './PersonTooltip'
import type { Media, Kisiler } from '@/payload-types'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/** Loose type that covers every Lexical node shape. */
type LexicalNode = {
  type: string
  version: number
  [key: string]: unknown
}

type FootnoteEntry = {
  id: string          // footnote_id field
  citation_text: string
  number: number      // assigned during pre-pass
}

type RenderCtx = {
  footnotes: FootnoteEntry[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Text format bitmask constants
// ─────────────────────────────────────────────────────────────────────────────

const F = {
  BOLD:          1,
  ITALIC:        2,
  STRIKETHROUGH: 4,
  UNDERLINE:     8,
  CODE:          16,
  SUBSCRIPT:     32,
  SUPERSCRIPT:   64,
} as const

// ─────────────────────────────────────────────────────────────────────────────
// Footnote pre-pass
// ─────────────────────────────────────────────────────────────────────────────

function collectFootnotes(nodes: LexicalNode[]): FootnoteEntry[] {
  const result: FootnoteEntry[] = []
  let counter = 1

  function scan(ns: LexicalNode[]) {
    for (const node of ns) {
      if (
        node.type === 'block' &&
        (node.fields as Record<string, unknown>)?.blockType === 'footnote-block'
      ) {
        const f = node.fields as Record<string, unknown>
        result.push({
          id:            String(f.footnote_id ?? counter),
          citation_text: String(f.citation_text ?? ''),
          number:        counter++,
        })
      }
      const children = node.children as LexicalNode[] | undefined
      if (Array.isArray(children) && children.length) scan(children)
    }
  }

  scan(nodes)
  return result
}

// ─────────────────────────────────────────────────────────────────────────────
// Leaf renderers
// ─────────────────────────────────────────────────────────────────────────────

function renderText(node: LexicalNode, key: string): React.ReactNode {
  const text   = String(node.text ?? '')
  const format = (node.format as number) ?? 0

  if (!text) return null

  // Build up the element tree from inside out
  let content: React.ReactNode = text

  // Code must be innermost to avoid nesting block/inline code with other marks
  if (format & F.CODE)          content = <code>{content}</code>
  if (format & F.BOLD)          content = <strong>{content}</strong>
  if (format & F.ITALIC)        content = <em>{content}</em>
  if (format & F.STRIKETHROUGH) content = <s>{content}</s>
  if (format & F.UNDERLINE)     content = <u>{content}</u>
  if (format & F.SUBSCRIPT)     content = <sub>{content}</sub>
  if (format & F.SUPERSCRIPT)   content = <sup>{content}</sup>

  return <React.Fragment key={key}>{content}</React.Fragment>
}

function renderLink(node: LexicalNode, key: string, ctx: RenderCtx): React.ReactNode {
  const fields = (node.fields as Record<string, unknown>) ?? {}
  const url    = String(fields.url ?? '#')
  const newTab = Boolean(fields.newTab)
  const kids   = renderChildren(node, key, ctx)

  if (!newTab && (url.startsWith('/') || url.startsWith('#'))) {
    return <Link key={key} href={url}>{kids}</Link>
  }

  return (
    <a key={key} href={url} target={newTab ? '_blank' : undefined} rel={newTab ? 'noopener noreferrer' : undefined}>
      {kids}
    </a>
  )
}

function renderHeading(node: LexicalNode, key: string, ctx: RenderCtx): React.ReactNode {
  const raw  = String(node.tag ?? 'h2')
  // Reserve h1 for page title — demote to h2 if editor inserted one
  const tag  = (raw === 'h1' ? 'h2' : raw) as 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  return React.createElement(tag, { key }, renderChildren(node, key, ctx))
}

function renderList(node: LexicalNode, key: string, ctx: RenderCtx): React.ReactNode {
  const tag = String(node.tag ?? 'ul') as 'ul' | 'ol'
  return React.createElement(tag, { key }, renderChildren(node, key, ctx))
}

function renderUpload(node: LexicalNode, key: string): React.ReactNode {
  const media = node.value as Media | null
  if (!media?.url) return null

  const caption = (node.fields as Record<string, unknown>)?.caption as string | undefined

  return (
    <figure key={key} className="not-prose my-8">
      <div className="relative overflow-hidden rounded-lg border border-border dark:border-border-dark">
        <Image
          src={media.url}
          alt={media.alt || caption || ''}
          width={media.width ?? 900}
          height={media.height ?? 600}
          className="w-full h-auto"
        />
      </div>
      {caption && (
        <figcaption className="mt-2 text-center text-sm text-fg-muted dark:text-fg-muted-dark">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Block renderers (matched by blockType slug)
// ─────────────────────────────────────────────────────────────────────────────

// ── quote-block ───────────────────────────────────────────────────────────────

function renderQuoteBlock(f: Record<string, unknown>, key: string): React.ReactNode {
  const personRaw  = f.person
  const person     = personRaw && typeof personRaw === 'object' && 'full_name' in personRaw
    ? (personRaw as Kisiler)
    : null
  const attribution = person?.full_name
  const contextDate = f.context_date as string | undefined

  return (
    <blockquote key={key} className="not-prose my-8 border-l-4 border-gold pl-6 py-1">
      <p className="font-display text-xl italic leading-relaxed text-ink dark:text-cream">
        &ldquo;{String(f.quote_text ?? '')}&rdquo;
      </p>
      {(attribution || contextDate) && (
        <footer className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
          {attribution && (
            <span className="font-medium text-stone dark:text-stone-light">
              — {attribution}
            </span>
          )}
          {contextDate && (
            <cite className="not-italic text-fg-muted dark:text-fg-muted-dark">
              {contextDate}
            </cite>
          )}
        </footer>
      )}
    </blockquote>
  )
}

// ── archive-document-block ────────────────────────────────────────────────────

function renderArchiveDocumentBlock(f: Record<string, unknown>, key: string): React.ReactNode {
  const imageRaw    = f.document_image
  const media       = imageRaw && typeof imageRaw === 'object' && 'url' in imageRaw
    ? (imageRaw as Media)
    : null
  const sourceArchive = f.source_archive as string | undefined
  // Render plain transcription text if present (richText, simplified)
  const transcriptionRaw = f.transcription as Record<string, unknown> | null | undefined

  return (
    <figure
      key={key}
      className="not-prose my-8 overflow-hidden rounded-xl border border-border dark:border-border-dark"
    >
      {/* Scanned document image */}
      {media?.url && (
        <div className="border-b border-border dark:border-border-dark bg-surface-muted dark:bg-surface-950">
          <Image
            src={media.url}
            alt={media.alt || 'Arşiv belgesi'}
            width={media.width ?? 900}
            height={media.height ?? 600}
            className="mx-auto max-h-[480px] w-full object-contain"
          />
        </div>
      )}

      {/* Caption bar */}
      <figcaption className="flex items-start gap-3 bg-surface-muted dark:bg-surface-800 px-4 py-3">
        <FileText size={16} className="mt-0.5 shrink-0 text-stone dark:text-stone-light" strokeWidth={1.75} />
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-fg-muted dark:text-fg-muted-dark">
            Arşiv Belgesi
          </p>
          {sourceArchive && (
            <p className="mt-0.5 font-mono text-sm text-fg dark:text-fg-dark">{sourceArchive}</p>
          )}
        </div>
      </figcaption>

      {/* Transcription */}
      {transcriptionRaw && (
        <div className="border-t border-border dark:border-border-dark px-5 py-4">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-fg-muted dark:text-fg-muted-dark">
            Transkripsiyon
          </p>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {renderRawContent(transcriptionRaw)}
          </div>
        </div>
      )}
    </figure>
  )
}

// ── map-block ─────────────────────────────────────────────────────────────────

function renderMapBlock(f: Record<string, unknown>, key: string): React.ReactNode {
  const imageRaw    = f.map_image
  const media       = imageRaw && typeof imageRaw === 'object' && 'url' in imageRaw
    ? (imageRaw as Media)
    : null
  const locationName = String(f.location_name ?? '')
  const legend       = f.legend as string | undefined
  const coordinates  = f.coordinates as string | undefined

  return (
    <figure key={key} className="not-prose my-8 overflow-hidden rounded-xl border border-border dark:border-border-dark">
      {media?.url ? (
        <Image
          src={media.url}
          alt={media.alt || locationName}
          width={media.width ?? 900}
          height={media.height ?? 500}
          className="w-full object-cover"
        />
      ) : (
        <div className="flex h-40 items-center justify-center gap-2 bg-surface-muted dark:bg-surface-800">
          <MapPin size={20} className="text-stone" strokeWidth={1.5} />
          <span className="text-sm text-fg-muted dark:text-fg-muted-dark">{locationName}</span>
        </div>
      )}

      <figcaption className="border-t border-border dark:border-border-dark bg-surface-muted dark:bg-surface-800 px-4 py-3">
        <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-fg-muted dark:text-fg-muted-dark">
          <MapPin size={11} />
          {locationName}
        </p>
        {legend && <p className="mt-1 text-sm text-fg-muted dark:text-fg-muted-dark">{legend}</p>}
        {coordinates && (
          <p className="mt-1 font-mono text-[11px] text-fg-muted/60 dark:text-fg-muted-dark/60">
            {coordinates}
          </p>
        )}
      </figcaption>
    </figure>
  )
}

// ── timeline-callout-block ────────────────────────────────────────────────────

const CALLOUT = {
  bilgi: {
    Icon: Info,
    border: 'border-blue-200 dark:border-blue-800',
    bg:     'bg-blue-50 dark:bg-blue-900/20',
    icon:   'text-blue-600 dark:text-blue-300',
    text:   'text-blue-900 dark:text-blue-100',
    label:  'Bilgi',
  },
  uyari: {
    Icon: AlertTriangle,
    border: 'border-gold/40',
    bg:     'bg-gold/5 dark:bg-gold/10',
    icon:   'text-gold-dark dark:text-gold',
    text:   'text-ink dark:text-cream',
    label:  'Uyarı',
  },
  'kritik-tarih': {
    Icon: Star,
    border: 'border-crimson/30',
    bg:     'bg-crimson/5 dark:bg-crimson/10',
    icon:   'text-crimson dark:text-crimson-light',
    text:   'text-ink dark:text-cream',
    label:  'Kritik Tarih',
  },
} as const

function renderTimelineCalloutBlock(f: Record<string, unknown>, key: string): React.ReactNode {
  const type   = String(f.callout_type ?? 'bilgi') as keyof typeof CALLOUT
  const style  = CALLOUT[type] ?? CALLOUT.bilgi
  const { Icon } = style

  return (
    <div key={key} className={`not-prose my-6 flex gap-3 rounded-lg border p-4 ${style.border} ${style.bg}`}>
      <Icon size={18} className={`mt-0.5 shrink-0 ${style.icon}`} strokeWidth={1.75} />
      <div>
        <p className={`text-[11px] font-bold uppercase tracking-widest mb-1 ${style.icon}`}>
          {style.label}
        </p>
        <p className={`text-sm leading-relaxed ${style.text}`}>
          {String(f.text ?? '')}
        </p>
      </div>
    </div>
  )
}

// ── footnote-block ── inline superscript marker ────────────────────────────────

function renderFootnoteMarker(f: Record<string, unknown>, key: string, ctx: RenderCtx): React.ReactNode {
  const footnoteId = String(f.footnote_id ?? '')
  const entry      = ctx.footnotes.find((fn) => fn.id === footnoteId)
  if (!entry) return null

  return (
    <sup key={key} className="not-prose">
      <a
        href={`#fn-${footnoteId}`}
        id={`fnref-${footnoteId}`}
        className="ml-0.5 font-semibold text-gold no-underline hover:text-gold-dark dark:hover:text-gold-light transition-colors"
        aria-label={`Dipnot ${entry.number}`}
      >
        [{entry.number}]
      </a>
    </sup>
  )
}

// ── inline-person-mention ─────────────────────────────────────────────────────

function renderInlinePersonMention(f: Record<string, unknown>, key: string): React.ReactNode {
  const personRaw = f.person
  const person    = personRaw && typeof personRaw === 'object' && 'id' in personRaw
    ? (personRaw as Kisiler)
    : null

  const portraitRaw = person?.portrait
  const portrait    = portraitRaw && typeof portraitRaw === 'object' && 'url' in portraitRaw
    ? (portraitRaw as Media)
    : null

  return (
    <PersonTooltip
      key={key}
      personId={person?.id ?? 0}
      displayName={person?.full_name ?? 'Bilinmeyen Kişi'}
      slug={person?.slug ?? undefined}
      title={person?.title ?? undefined}
      excerpt={person?.excerpt ?? undefined}
      portraitUrl={portrait?.url ?? undefined}
      portraitAlt={portrait?.alt ?? person?.full_name ?? undefined}
    />
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Block / inline-block routers
// ─────────────────────────────────────────────────────────────────────────────

function renderBlock(node: LexicalNode, key: string, ctx: RenderCtx): React.ReactNode {
  const f         = (node.fields as Record<string, unknown>) ?? {}
  const blockType = String(f.blockType ?? '')

  switch (blockType) {
    case 'quote-block':              return renderQuoteBlock(f, key)
    case 'archive-document-block':   return renderArchiveDocumentBlock(f, key)
    case 'map-block':                return renderMapBlock(f, key)
    case 'timeline-callout-block':   return renderTimelineCalloutBlock(f, key)
    case 'footnote-block':           return renderFootnoteMarker(f, key, ctx)
    default:                         return null
  }
}

function renderInlineBlock(node: LexicalNode, key: string): React.ReactNode {
  const f         = (node.fields as Record<string, unknown>) ?? {}
  const blockType = String(f.blockType ?? '')

  if (blockType === 'inline-person-mention') {
    return renderInlinePersonMention(f, key)
  }
  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// Main recursive render
// ─────────────────────────────────────────────────────────────────────────────

function renderChildren(node: LexicalNode, parentKey: string, ctx: RenderCtx): React.ReactNode {
  const children = node.children as LexicalNode[] | undefined
  if (!children?.length) return null
  return children.map((child, i) => renderNode(child, `${parentKey}-${i}`, ctx))
}

function renderNode(node: LexicalNode, key: string, ctx: RenderCtx): React.ReactNode {
  switch (node.type) {
    case 'root':
      return renderChildren(node, key, ctx)

    case 'paragraph':
      return <p key={key}>{renderChildren(node, key, ctx)}</p>

    case 'heading':
      return renderHeading(node, key, ctx)

    case 'list':
      return renderList(node, key, ctx)

    case 'listitem':
      return <li key={key}>{renderChildren(node, key, ctx)}</li>

    case 'quote':
      return <blockquote key={key}>{renderChildren(node, key, ctx)}</blockquote>

    case 'link':
    case 'autolink':
      return renderLink(node, key, ctx)

    case 'text':
      return renderText(node, key)

    case 'linebreak':
      return <br key={key} />

    case 'horizontalrule':
      return <hr key={key} />

    case 'tab':
      return <span key={key}>&emsp;</span>

    case 'block':
      return renderBlock(node, key, ctx)

    case 'inlineBlock':
      return renderInlineBlock(node, key)

    case 'upload':
      return renderUpload(node, key)

    default:
      // Unknown node — render children if any, to avoid silent data loss
      if (Array.isArray(node.children)) return renderChildren(node, key, ctx)
      return null
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Footnotes bibliography section
// ─────────────────────────────────────────────────────────────────────────────

function renderFootnotesBibliography(footnotes: FootnoteEntry[]): React.ReactNode {
  if (!footnotes.length) return null

  return (
    <section className="not-prose mt-12 border-t border-border dark:border-border-dark pt-8">
      <h2 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-fg-muted dark:text-fg-muted-dark">
        Kaynaklar ve Dipnotlar
      </h2>
      <ol className="list-none space-y-2 p-0">
        {footnotes.map((fn) => (
          <li key={fn.id} id={`fn-${fn.id}`} className="flex gap-3 text-sm">
            <a
              href={`#fnref-${fn.id}`}
              className="shrink-0 font-bold text-gold no-underline hover:text-gold-dark transition-colors"
              aria-label={`Dipnot ${fn.number} referansına git`}
            >
              [{fn.number}]
            </a>
            <span className="leading-relaxed text-fg-muted dark:text-fg-muted-dark">
              {fn.citation_text}
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal helper — render rich text without the outer <article> wrapper.
// Used for nested rich text (e.g. ArchiveDocumentBlock transcription).
// ─────────────────────────────────────────────────────────────────────────────

function renderRawContent(content: Record<string, unknown>): React.ReactNode {
  const root     = (content.root ?? content) as LexicalNode
  const ctx: RenderCtx = { footnotes: [] }
  return renderChildren(root, 'nested', ctx)
}

// ─────────────────────────────────────────────────────────────────────────────
// Public component
// ─────────────────────────────────────────────────────────────────────────────

interface RichTextRendererProps {
  /**
   * The raw Lexical JSON value from a Payload richText field.
   * Shape: `{ root: { type: 'root', children: [...] }, ... }`
   */
  content: Record<string, unknown> | null | undefined
  /** Extra classes added to the wrapping <article> element. */
  className?: string
}

export function RichTextRenderer({ content, className = '' }: RichTextRendererProps) {
  if (!content) return null

  const root         = (content.root ?? content) as LexicalNode
  const rootChildren = (root.children as LexicalNode[]) ?? []

  // ── Pre-pass: collect footnotes to assign sequential numbers ──────────────
  const footnotes = collectFootnotes(rootChildren)
  const ctx: RenderCtx = { footnotes }

  return (
    <article className={`prose prose-lg dark:prose-invert max-w-none ${className}`}>
      {renderChildren(root, 'root', ctx)}
      {renderFootnotesBibliography(footnotes)}
    </article>
  )
}
