import { beforeEach, describe, expect, it, vi } from "vitest";
import { downloadCsvFile, downloadFile, downloadTextFile } from "../src/index";

function readBlobAsText(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read blob"));
    reader.readAsText(blob);
  });
}

function readBlobAsBytes(blob: Blob): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read blob"));
    reader.readAsArrayBuffer(blob);
  });
}

describe("downloadFile", () => {
  let lastBlob: Blob | null = null;
  const createObjectURL = vi.fn((blob: Blob) => {
    lastBlob = blob;
    return "blob:mock-url";
  });
  const revokeObjectURL = vi.fn();

  beforeEach(() => {
    lastBlob = null;
    createObjectURL.mockClear();
    revokeObjectURL.mockClear();

    vi.stubGlobal(
      "URL",
      Object.assign(window.URL, {
        createObjectURL,
        revokeObjectURL
      })
    );
  });

  it("downloads CSV with BOM by default", async () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);

    const result = downloadCsvFile(
      [
        { name: "Alice", note: "line1\nline2" },
        { name: "Bob", note: 'he said "hello"' }
      ],
      {
        fileName: "report.csv",
        columns: [
          { key: "name", header: "Name" },
          { key: "note", header: "Note" }
        ]
      }
    );

    expect(result).toBe(true);
    expect(createObjectURL).toHaveBeenCalledTimes(1);

    expect(lastBlob).not.toBeNull();
    const bytes = await readBlobAsBytes(lastBlob!);
    expect(Array.from(bytes.slice(0, 3))).toEqual([0xef, 0xbb, 0xbf]);

    const content = new TextDecoder().decode(bytes.slice(3));
    expect(content).toBe('Name,Note\nAlice,"line1\nline2"\nBob,"he said ""hello"""');
    expect(lastBlob!.type).toBe("text/csv;charset=utf-8;");
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");

    clickSpy.mockRestore();
  });

  it("downloads TXT via convenience wrapper", async () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);

    const result = downloadTextFile({
      fileName: "note.txt",
      content: "hello"
    });

    expect(result).toBe(true);

  expect(lastBlob).not.toBeNull();
  const content = await readBlobAsText(lastBlob!);

    expect(content).toBe("hello");
  expect(lastBlob!.type).toBe("text/plain;charset=utf-8;");

    clickSpy.mockRestore();
  });

  it("returns false outside browser", () => {
    const originalWindow = globalThis.window;
    const originalDocument = globalThis.document;

    vi.stubGlobal("window", undefined);
    vi.stubGlobal("document", undefined);

    const result = downloadFile({
      format: "txt",
      fileName: "x.txt",
      content: "x"
    });

    expect(result).toBe(false);

    vi.stubGlobal("window", originalWindow);
    vi.stubGlobal("document", originalDocument);
  });

  it("returns false when document.body is not available", () => {
    const createElementSpy = vi.spyOn(document, "createElement");
    const bodyGetterSpy = vi
      .spyOn(document, "body", "get")
      .mockImplementation(() => null as unknown as HTMLElement);

    const result = downloadFile({
      format: "txt",
      fileName: "x.txt",
      content: "x"
    });

    expect(result).toBe(false);
    expect(createElementSpy).not.toHaveBeenCalled();

    bodyGetterSpy.mockRestore();
    createElementSpy.mockRestore();
  });
});
