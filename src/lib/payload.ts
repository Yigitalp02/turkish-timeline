/**
 * Payload Local API singleton wrapper.
 *
 * Payload v3 manages the singleton internally — calling getPayload({ config })
 * multiple times always returns the same instance.  This wrapper provides a
 * single, consistent import across the data layer and keeps @payload-config
 * import in one place.
 *
 * IMPORTANT: Only import this in Server Components, Route Handlers, or
 * functions marked with "use cache". It will throw on the client.
 */
import { getPayload } from 'payload'
import config from '@payload-config'

export async function getPayloadInstance() {
  return getPayload({ config })
}
