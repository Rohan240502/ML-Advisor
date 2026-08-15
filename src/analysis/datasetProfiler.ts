import type { FeatureProfile, DatasetProfile } from '../types/analysis';
import { analyzeFeature } from './featureAnalyzer';

/**
 * Compute a hash string for a row to detect duplicates.
 * Joins all cell values with a separator unlikely to appear in data.
 */
function rowHash(row: string[]): string {
  return row.join('\x00');
}

/**
 * Count duplicate rows in the dataset.
 */
function countDuplicates(rows: string[][]): number {
  const seen = new Set<string>();
  let dupes = 0;
  for (const row of rows) {
    const h = rowHash(row);
    if (seen.has(h)) {
      dupes++;
    } else {
      seen.add(h);
    }
  }
  return dupes;
}

/**
 * Build a complete DatasetProfile from raw headers + rows.
 *
 * @param headers  Column names
 * @param rows     One string[] per row; each item maps to the header at the same index
 */
export function profileDataset(
  headers: string[],
  rows: string[][]
): DatasetProfile {
  const rowCount = rows.length;
  const columnCount = headers.length;
  const duplicateRowCount = countDuplicates(rows);

  // Build per-column value arrays
  const columnValues: string[][] = headers.map((_, colIdx) =>
    rows.map(row => row[colIdx] ?? '')
  );

  // Analyze each feature
  const features: FeatureProfile[] = headers.map((name, idx) =>
    analyzeFeature(name, columnValues[idx], rowCount)
  );

  // Aggregate counts
  let numericalCount = 0;
  let categoricalCount = 0;
  let booleanCount = 0;
  let datetimeCount = 0;
  let identifierCount = 0;
  let constantCount = 0;

  for (const f of features) {
    switch (f.type) {
      case 'numerical':    numericalCount++;    break;
      case 'categorical':  categoricalCount++;  break;
      case 'boolean':      booleanCount++;      break;
      case 'datetime':     datetimeCount++;     break;
      case 'identifier':   identifierCount++;   break;
      case 'constant':     constantCount++;     break;
    }
  }

  return {
    rowCount,
    columnCount,
    duplicateRowCount,
    features,
    numericalCount,
    categoricalCount,
    booleanCount,
    datetimeCount,
    identifierCount,
    constantCount,
  };
}
