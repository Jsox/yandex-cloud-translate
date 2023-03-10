const fetch = globalThis.fetch

if (typeof fetch !== 'function') {
    throw new Error('You don`t have global fetch function. Setup or use nodejs version >= 18')
}

export { fetch }