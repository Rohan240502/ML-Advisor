import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import type { ParsedCSV } from '../types/analysis';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export type FileParseError =
  | { code: 'UNSUPPORTED_FORMAT'; message: string }
  | { code: 'TOO_LARGE'; message: string }
  | { code: 'EMPTY_FILE'; message: string }
  | { code: 'NO_COLUMNS'; message: string }
  | { code: 'NO_ROWS'; message: string }
  | { code: 'PARSE_ERROR'; message: string };

const SUPPORTED_FORMATS = ['.csv', '.xlsx', '.xls', '.json', '.tsv', '.txt'];

/**
 * Validate a File before parsing.
 */
export function validateDataFile(file: File): FileParseError | null {
  const name = file.name.toLowerCase();
  const extension = name.substring(name.lastIndexOf('.'));
  
  if (!SUPPORTED_FORMATS.includes(extension)) {
    return {
      code: 'UNSUPPORTED_FORMAT',
      message: `"${file.name}" format is not supported. Please upload: ${SUPPORTED_FORMATS.join(', ')}`,
    };
  }
  if (file.size === 0) {
    return { code: 'EMPTY_FILE', message: 'The file appears to be empty.' };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const mb = (file.size / 1024 / 1024).toFixed(1);
    return {
      code: 'TOO_LARGE',
      message: `File is ${mb} MB. ML Advisor supports files up to 10 MB.`,
    };
  }
  return null;
}

/**
 * Determine file type and parse accordingly
 */
export async function parseDataFile(file: File): Promise<ParsedCSV> {
  const validationError = validateDataFile(file);
  if (validationError) throw validationError;

  const name = file.name.toLowerCase();
  const extension = name.substring(name.lastIndexOf('.'));

  if (extension === '.csv' || extension === '.tsv' || extension === '.txt') {
    return parseDelimitedFile(file, extension === '.tsv');
  } else if (extension === '.xlsx' || extension === '.xls') {
    return parseExcelFile(file);
  } else if (extension === '.json') {
    return parseJSONFile(file);
  }

  throw {
    code: 'UNSUPPORTED_FORMAT',
    message: `File format "${extension}" is not supported.`,
  } as FileParseError;
}

/**
 * Parse CSV/TSV/TXT files using Papa Parse
 */
function parseDelimitedFile(file: File, isTSV: boolean): Promise<ParsedCSV> {
  return new Promise((resolve, reject) => {
    const delimiter = isTSV ? '\t' : ',';
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      delimiter,
      dynamicTyping: false,
      complete(results) {
        const { data, meta, errors } = results;

        if (errors.length > 0 && data.length === 0) {
          reject({
            code: 'PARSE_ERROR',
            message: `Could not parse file: ${errors[0].message}`,
          } as FileParseError);
          return;
        }

        const headers = meta.fields ?? [];
        if (headers.length === 0) {
          reject({ code: 'NO_COLUMNS', message: 'File has no columns.' } as FileParseError);
          return;
        }

        const rows: string[][] = data.map(row =>
          headers.map(h => String(row[h] ?? ''))
        );

        if (rows.length === 0) {
          reject({ code: 'NO_ROWS', message: 'File has no data rows.' } as FileParseError);
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
        reject({ code: 'PARSE_ERROR', message: err.message } as FileParseError);
      },
    });
  });
}

/**
 * Parse Excel files (.xlsx, .xls) using xlsx library
 */
function parseExcelFile(file: File): Promise<ParsedCSV> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        
        if (!sheetName) {
          reject({
            code: 'NO_ROWS',
            message: 'Excel file has no sheets.',
          } as FileParseError);
          return;
        }

        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
          header: 1,
          defval: '',
        }) as unknown[][];

        if (jsonData.length === 0) {
          reject({
            code: 'NO_COLUMNS',
            message: 'Sheet has no data.',
          } as FileParseError);
          return;
        }

        const headers = (jsonData[0] ?? []).map(h => String(h ?? ''));
        if (headers.length === 0) {
          reject({
            code: 'NO_COLUMNS',
            message: 'Sheet has no columns.',
          } as FileParseError);
          return;
        }

        const rows = (jsonData.slice(1) ?? []).map(row =>
          headers.map((_, idx) => String(row[idx] ?? ''))
        );

        if (rows.length === 0) {
          reject({
            code: 'NO_ROWS',
            message: 'Sheet has no data rows.',
          } as FileParseError);
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
      } catch (err) {
        reject({
          code: 'PARSE_ERROR',
          message: `Failed to parse Excel file: ${err instanceof Error ? err.message : 'Unknown error'}`,
        } as FileParseError);
      }
    };
    reader.onerror = () => {
      reject({
        code: 'PARSE_ERROR',
        message: 'Failed to read file.',
      } as FileParseError);
    };
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Parse JSON files (expects array of objects)
 */
function parseJSONFile(file: File): Promise<ParsedCSV> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const jsonData = JSON.parse(text);

        if (!Array.isArray(jsonData)) {
          reject({
            code: 'PARSE_ERROR',
            message: 'JSON file must contain an array of objects.',
          } as FileParseError);
          return;
        }

        if (jsonData.length === 0) {
          reject({
            code: 'NO_ROWS',
            message: 'JSON array is empty.',
          } as FileParseError);
          return;
        }

        const headers = Object.keys(jsonData[0] ?? {});
        if (headers.length === 0) {
          reject({
            code: 'NO_COLUMNS',
            message: 'JSON objects have no properties.',
          } as FileParseError);
          return;
        }

        const rows = jsonData.map(obj =>
          headers.map(h => String(obj[h] ?? ''))
        );

        resolve({
          headers,
          rows,
          rowCount: rows.length,
          columnCount: headers.length,
          fileName: file.name,
          fileSizeBytes: file.size,
        });
      } catch (err) {
        reject({
          code: 'PARSE_ERROR',
          message: `Failed to parse JSON: ${err instanceof Error ? err.message : 'Unknown error'}`,
        } as FileParseError);
      }
    };
    reader.onerror = () => {
      reject({
        code: 'PARSE_ERROR',
        message: 'Failed to read file.',
      } as FileParseError);
    };
    reader.readAsText(file);
  });
}

/**
 * @deprecated Use parseDataFile instead
 */
export async function parseCSVFile(file: File): Promise<ParsedCSV> {
  return parseDataFile(file);
}

/**
 * @deprecated Use validateDataFile instead
 */
export function validateCSVFile(file: File): FileParseError | null {
  return validateDataFile(file);
}
