import * as Discord from 'discord.js';

const MARKER = '-# [Sponsored](<';       
const METHODS = ['send', 'reply', 'followUp', 'editReply', 'update'];

let installed = false;

async function fetchFooter(api) {
  try {
    const res = await fetch(api, { headers: { accept: 'application/json' } });
    if (!res.ok) return '';
    const { message, link } = await res.json();
    if (!message || !link) return '';
    return `\n-# [Sponsored](<${link}>) - ${message}`;
  } catch {
    return '';
  }
}

function withFooter(args, footer) {
  const first = args[0];

  if (first == null) return args;

  if (typeof first === 'string') {
    if (first.includes(MARKER)) return args;
    return [first + footer, ...args.slice(1)];
  }

  if (Discord.MessagePayload && first instanceof Discord.MessagePayload) {
    const content = first.options?.content;
    if (typeof content === 'string' && content.includes(MARKER)) return args;
    first.options = { ...first.options, content: (content || '') + footer };
    return args;
  }

  if (typeof first === 'object') {
    const content = first.content;
    if (typeof content === 'string' && content.includes(MARKER)) return args;
    return [{ ...first, content: (content || '') + footer }, ...args.slice(1)];
  }

  return args;
}

function collectTargets() {
  const targets = [];
  const seenFns = new Set();
  for (const exported of Object.values(Discord)) {
    if (typeof exported !== 'function' || !exported.prototype) continue;
    for (const key of METHODS) {
      if (!Object.prototype.hasOwnProperty.call(exported.prototype, key)) continue;
      const fn = exported.prototype[key];
      if (typeof fn !== 'function' || seenFns.has(fn)) continue;
      seenFns.add(fn);
      targets.push({ proto: exported.prototype, key, fn });
    }
  }
  return targets;
}

export function installShore(opts = {}) {
  if (installed) return;
  installed = true;

  const api = opts.api
    || process?.env?.SHORE_API
    || 'https://opo.carroted.org/api/shore';

  const envRate = Number(process?.env?.SHORE_RATE);
  const rate = opts.rate ?? (Number.isFinite(envRate) ? envRate : 0.2);

  for (const { proto, key, fn: original } of collectTargets()) {
    proto[key] = function shorePatched(...args) {
      if (Math.random() >= rate) return original.apply(this, args);
      return fetchFooter(api).then((footer) => {
        const finalArgs = footer ? withFooter(args, footer) : args;
        return original.apply(this, finalArgs);
      });
    };
  }
}

installShore();

export default installShore;
