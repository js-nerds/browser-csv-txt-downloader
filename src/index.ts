export type CsvExportColumn<T extends Record<string, unknown>> = {
  key: Extract<keyof T, string>;
  header: string;
};

export type CsvExportOptions<T extends Record<string, unknown>> = {
  fileName: string;
  columns: Array<CsvExportColumn<T>>;
  includeBom?: boolean;
};

export type TextExportOptions = {
  fileName: string;
  content: string;
  includeBom?: boolean;
};

export type DownloadFileOptions<T extends Record<string, unknown>> =
  | ({ format: "csv" } & CsvExportOptions<T> & { rows: ReadonlyArray<T> })
  | ({ format: "txt" } & TextExportOptions);

/**
 * Downloads a file in selected format.
 *
 * @param options - Export options.
 * @returns True if download has started.
 */
export function downloadFile<T extends Record<string, unknown>>(options: DownloadFileOptions<T>): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false;
  }

  if (!document.body) {
    return false;
  }

  const fileData = buildFileData(options);
  const blob = new Blob([fileData.content], { type: fileData.mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = options.fileName;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);

  return true;
}

/**
 * Compatibility wrapper for CSV export.
 *
 * @param rows - Rows to export.
 * @param options - CSV options.
 * @returns True if download has started.
 */
export function downloadCsvFile<T extends Record<string, unknown>>(
  rows: ReadonlyArray<T>,
  options: CsvExportOptions<T>
): boolean {
  return downloadFile({
    format: "csv",
    rows,
    fileName: options.fileName,
    columns: options.columns,
    includeBom: options.includeBom
  });
}

/**
 * Convenience wrapper for TXT export.
 *
 * @param options - TXT options.
 * @returns True if download has started.
 */
export function downloadTextFile(options: TextExportOptions): boolean {
  return downloadFile({
    format: "txt",
    fileName: options.fileName,
    content: options.content,
    includeBom: options.includeBom
  });
}

/**
 * Builds file content and MIME type based on format.
 *
 * @param options - Download options.
 * @returns File content and MIME type.
 */
function buildFileData<T extends Record<string, unknown>>(
  options: DownloadFileOptions<T>
): { content: string; mimeType: string } {
  if (options.format === "csv") {
    const csv = buildCsv(options.rows, options.columns);
    const content = options.includeBom === false ? csv : `\uFEFF${csv}`;
    return { content, mimeType: "text/csv;charset=utf-8;" };
  }

  const content = options.includeBom ? `\uFEFF${options.content}` : options.content;
  return { content, mimeType: "text/plain;charset=utf-8;" };
}

/**
 * Builds CSV content from rows and column schema.
 *
 * @param rows - Export rows.
 * @param columns - Column definitions.
 * @returns CSV text content.
 */
function buildCsv<T extends Record<string, unknown>>(
  rows: ReadonlyArray<T>,
  columns: Array<CsvExportColumn<T>>
): string {
  const header = columns.map((column) => escapeCsvCell(column.header)).join(",");
  const lines = rows.map((row) => {
    return columns
      .map((column) => {
        const rawValue = row[column.key];
        const normalized = stringifyUnknown(rawValue);
        return escapeCsvCell(normalized);
      })
      .join(",");
  });

  return [header, ...lines].join("\n");
}

/**
 * Converts unknown value to a string.
 *
 * @param value - Input value.
 * @returns String representation.
 */
function stringifyUnknown(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
}

/**
 * Escapes one CSV cell.
 *
 * @param value - Cell value.
 * @returns Escaped value.
 */
function escapeCsvCell(value: string): string {
  const escaped = value.replace(/"/g, '""');

  if (/[",\n\r]/.test(escaped)) {
    return `"${escaped}"`;
  }

  return escaped;
}
