import PDFParser from "pdf-parse";

// Utility function to extract text from PDF
async function extractPDFData(pdfUrl: string): Promise<string> {
  const response = await fetch(pdfUrl);
  const buffer = await response.arrayBuffer();
  const data = Buffer.from(buffer); // Convert Uint8Array to Buffer

  const result = await PDFParser(data);

  return result.text;
}

export default extractPDFData;
