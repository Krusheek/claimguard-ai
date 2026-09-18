import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (err) {
    if (specifier.startsWith('.') || specifier.startsWith('/')) {
      for (const ext of ['.js', '.mjs', '.jsx', '.ts', '.json']) {
        try {
          return await nextResolve(specifier + ext, context);
        } catch {
          // try next
        }
      }
    }
    throw err;
  }
}
