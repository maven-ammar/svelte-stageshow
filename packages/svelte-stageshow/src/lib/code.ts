// Code's shared types and light tokenizer. The React kit returned JSX from
// tokens(); Svelte needs data, so a line is a list of { text, kind } runs and
// the component renders them.

export interface CodeLine {
  text: string
  /** add: a green line with a +. del: a red line with a −. */
  kind?: 'add' | 'del'
  /** false leaves this line's number blank (a wrapped continuation, a fold). */
  number?: boolean
}

export type CodeTokenKind = 'com' | 'str' | 'num' | 'key' | 'fn'

export interface CodeToken {
  text: string
  /** null for plain code: no span, no class. */
  kind: CodeTokenKind | null
}

const KEYWORDS =
  /^(const|let|var|function|return|if|else|await|async|import|from|export|default|new|true|false|null|undefined|for|of|in|while|try|catch|throw|class|extends|type|interface|def|self|None|True|False)$/

// Comments, strings, numbers, keywords, function calls — the same order and
// groups as the React tokenizer.
const TOKENS =
  /(\/\/.*$|#.*$)|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`)|(\b\d[\d._]*\b)|([A-Za-z_$][\w$]*)(?=\s*\()|([A-Za-z_$][\w$]*)/g

/** A light tokenizer: comments, strings, numbers, keywords, function calls. */
export function tokenize(line: string): CodeToken[] {
  const out: CodeToken[] = []
  TOKENS.lastIndex = 0
  let last = 0
  let m: RegExpExecArray | null
  while ((m = TOKENS.exec(line))) {
    if (m.index > last) out.push({ text: line.slice(last, m.index), kind: null })
    const [text, com, str, num, call, word] = m
    const kind: CodeTokenKind | null = com
      ? 'com'
      : str
        ? 'str'
        : num
          ? 'num'
          : call
            ? KEYWORDS.test(call)
              ? 'key'
              : 'fn'
            : word && KEYWORDS.test(word)
              ? 'key'
              : null
    out.push({ text, kind })
    last = m.index + text.length
  }
  if (last < line.length) out.push({ text: line.slice(last), kind: null })
  return out
}
