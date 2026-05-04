/**
 * safeStaticParams — wraps generateStaticParams calls in a try/catch.
 *
 * During a Docker build the database is not yet running, so any attempt to
 * call the Payload Local API will throw.  Returning an empty array here is
 * intentional: Next.js will fall back to on-demand ISR generation for all
 * dynamic routes (dynamicParams = true is the App Router default), so every
 * page will be rendered correctly on the first real request at runtime.
 */
export async function safeStaticParams<T>(fn: () => Promise<T[]>): Promise<T[]> {
  try {
    return await fn()
  } catch {
    return []
  }
}
