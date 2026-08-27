// Lazy-loaded markdown renderer — only pulled in when an article is opened.
// Keeps the list-page chunk (Vue + nav only) tiny.
import MarkdownIt from 'markdown-it'
import texmath from 'markdown-it-texmath'
import hljs from 'highlight.js/lib/core'
import katex from 'katex'
import 'katex/dist/katex.min.css'

import bash from 'highlight.js/lib/languages/bash'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import python from 'highlight.js/lib/languages/python'
import c from 'highlight.js/lib/languages/c'
import cpp from 'highlight.js/lib/languages/cpp'
import csharp from 'highlight.js/lib/languages/csharp'
import java from 'highlight.js/lib/languages/java'
import go from 'highlight.js/lib/languages/go'
import rust from 'highlight.js/lib/languages/rust'
import json from 'highlight.js/lib/languages/json'
import yaml from 'highlight.js/lib/languages/yaml'
import markdown from 'highlight.js/lib/languages/markdown'
import latex from 'highlight.js/lib/languages/latex'
import sql from 'highlight.js/lib/languages/sql'
import shell from 'highlight.js/lib/languages/shell'
import diff from 'highlight.js/lib/languages/diff'
import nginx from 'highlight.js/lib/languages/nginx'
import xml from 'highlight.js/lib/languages/xml'
import css from 'highlight.js/lib/languages/css'
import dockerfile from 'highlight.js/lib/languages/dockerfile'

for (const [name, mod] of Object.entries({
  bash, javascript, typescript, python, c, cpp, csharp,
  java, go, rust, json, yaml, markdown, latex, sql,
  shell, diff, nginx, xml, css, dockerfile,
})) hljs.registerLanguage(name, mod)

const md = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: false,
  typographer: false,
  highlight(code, lang) {
    if (!lang || !hljs.getLanguage(lang)) return '' // let markdown-it escape
    try { return hljs.highlight(code, { language: lang }).value } catch { return '' }
  },
}).use(texmath, { engine: katex, delimiters: 'dollars' })

const defaultLinkOpen = md.renderer.rules.link_open
  || ((tokens, idx, opts, _, self) => self.renderToken(tokens, idx, opts))
md.renderer.rules.link_open = (tokens, idx, opts, env, self) => {
  const href = tokens[idx].attrGet('href') || ''
  if (/^https?:\/\//.test(href)) {
    const aIndex = tokens[idx].attrIndex('target')
    if (aIndex < 0) tokens[idx].attrPush(['target', '_blank'])
    else tokens[idx].attrs[aIndex][1] = '_blank'
    tokens[idx].attrSet('rel', 'noopener noreferrer')
  }
  return defaultLinkOpen(tokens, idx, opts, env, self)
}

function normalizeBlockMath(s) {
  const code = []
  let out = s.replace(/```[\s\S]*?```/g, (m) => { code.push(m); return `\u0000C${code.length - 1}\u0000` })
  out = out.replace(/(^|[^\\\n])\$\$([^\n].*?[^\n\\])\$\$(?!\$)/g, (_, pre, inner) => `${pre}\n$$${inner}$$\n`)
  return out.replace(/\u0000C(\d+)\u0000/g, (_, i) => code[+i])
}

export function renderMarkdown(src) {
  return md.render(normalizeBlockMath(src))
}
