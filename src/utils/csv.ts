import Papa from 'papaparse';
import type { ParsedCSV } from '../types/analysis';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export type CSVParseError =
  | { code: 'NOT_CSV'; message: string }
  | { code: 'TOO_LARGE'; message: string }
  | { code: 'EMPTY_FILE'; message: string }
  | { code: 'NO_COLUMNS'; message: string }
  | { code: 'NO_ROWS'; message: string }
  | { code: 'PARSE_ERROR'; message: string };

/**
 * Validate a File before parsing.
 */
export function validateCSVFile(file: File): CSVParseError | null {
  const name = file.name.toLowerCase();
  if (!name.endsWith('.csv')) {
    return { code: 'NOT_CSV', message: `"${file.name}" is not a CSV file. Please upload a .csv file.` };
  }
  if (file.size === 0) {
    return { code: 'EMPTY_FILE', message: 'The file appears to be empty.' };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const mb = (file.size / 1024 / 1024).toFixed(1);
    return {
      code: 'TOO_LARGE',
      message: `File is ${mb} MB. ML Advisor supports files up to 10 MB for V1.`,
    };
  }
  return null;
}

/**
 * Parse a CSV File using Papa Parse.
 * Returns a structured ParsedCSV or throws a CSVParseError.
 */
export async function parseCSVFile(file: File): Promise<ParsedCSV> {
  const validationError = validateCSVFile(file);
  if (validationError) throw validationError;

  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false, // keep everything as strings; analysis engine handles typing
      complete(results) {
        const { data, meta, errors } = results;

        if (errors.length > 0 && data.length === 0) {
          reject({
            code: 'PARSE_ERROR',
            message: `Could not parse CSV: ${errors[0].message}`,
          } as CSVParseError);
          return;
        }

        const headers = meta.fields ?? [];
        if (headers.length === 0) {
          reject({ code: 'NO_COLUMNS', message: 'CSV has no columns.' } as CSVParseError);
          return;
        }

        // Convert to string[][]
        const rows: string[][] = data.map(row =>
          headers.map(h => String(row[h] ?? ''))
        );

        if (rows.length === 0) {
          reject({ code: 'NO_ROWS', message: 'CSV has no data rows.' } as CSVParseError);
          return;
        }

        resolve({
          headers,
          rows,
          rowCount: rows.length,
          columnCount: headers.length,
          fileName: file.name,
          fileSizeBytes: file.size,
        });
      },
      error(err) {
        reject({ code: 'PARSE_ERROR', message: err.message } as CSVParseError);
      },
    });
  });
}
