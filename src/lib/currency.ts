/**
 * Format transaction descriptions to use 'ZAR' as currency instead of '$'
 */
export const formatTransactionDescription = (description: string): string => {
  return description.replace(/\$/g, 'ZAR');
};
