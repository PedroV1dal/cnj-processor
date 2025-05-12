/**
 * Validates a CNJ number format
 * Format: NNNNNNN-NN.NNNN.N.NN.NNNN
 */
export function validateCNJ(cnj: string): boolean {
  if (!cnj || typeof cnj !== "string") {
    return false;
  }

  const cnjRegex = /^\d{7}-\d{2}\.\d{4}\.\d{1}\.\d{2}\.\d{4}$/;
  return cnjRegex.test(cnj);
}
