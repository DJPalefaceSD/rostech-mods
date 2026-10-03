import type { Register } from 'claude-code'

// The print-shop set: what a comics press does while you wait.
export const PRESS: readonly string[] = [
  'Penciling', 'Inking', 'Lettering', 'Coloring', 'Thumbnailing', 'Plotting',
  'Scripting', 'Paneling', 'Splashing', 'Cliffhanging', 'Retconning',
  'Crossing over', 'Rebooting', 'Greenlighting', 'Setting type', 'Kerning',
  'Halftoning', 'Making ready', 'Inking the rollers', 'Pulling proofs',
  'Cranking the press', 'Checking the plates', 'Folding', 'Stapling',
  'Bundling', 'Trucking to the newsstand', 'Racking', 'Counting returns',
  'Answering fan mail', 'Chasing the craze', 'Haggling with the distributor',
  'Signing the creator', 'Pitching to Hollywood', 'Licensing',
  'Climbing the ladder', 'Riding the coaster', 'Becoming a household name',
]

// "a, b ,c" into ["a", "b", "c"]; empty or missing gives the print-shop set.
export function wordsFrom(text: unknown): readonly string[] {
  if (typeof text !== 'string') return PRESS
  const list = text.split(',').map(w => w.trim()).filter(w => w.length > 0)
  return list.length > 0 ? list : PRESS
}

// The same word for the whole turn, a different one next turn. The engine
// samples its own word once per turn, so that word is the seed: no dice.
export function pick(list: readonly string[], seed: string): string {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return list[h % list.length]
}

export const register: Register = (on, options) => {
  const words = wordsFrom(options.words)
  on('ui.render', { component: 'Spinner' }, async ($, e, next) =>
    next({ ...e, props: { ...e.props, word: pick(words, `${e.props.word}|${e.requestId}`) } }))
}
