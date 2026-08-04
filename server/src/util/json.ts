/**
 * Build a compact JSON string for a TestCase.expected value. Storing it as a
 * string keeps big integers exact (JS numbers lose precision above 2^53).
 * Lives in its own module so problem data files can import it without a
 * circular dependency back into the course registry.
 */
export function j(value: unknown): string {
  return JSON.stringify(value);
}
