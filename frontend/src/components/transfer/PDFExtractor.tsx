// import React, { useState } from "react";
// import { Document, Page, pdfjs } from "react-pdf";
// import "react-pdf/dist/esm/Page/AnnotationLayer.css";

// pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
// interface PdfTextExtractorProps {
//   pdfPath: string | any; // Define the prop type
// }
// const PdfTextExtractor: React.FC<({ pdfPath }) => {
//   const [numPages, setNumPages] = useState<number>(0);
//   const [pdfText, setPdfText] = useState<string>("");

//   const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     const fileReader = new FileReader();
//     fileReader.onload = async () => {
//       const arrayBuffer = fileReader.result as ArrayBuffer;
//       const typedArray = new Uint8Array(arrayBuffer);

//       const loadingTask = pdfjs.getDocument(typedArray);
//       const pdf = await loadingTask.promise;

//       let extractedText = "";

//       for (let pageIndex = 1; pageIndex <= pdf.numPages; pageIndex++) {
//         const page = await pdf.getPage(pageIndex);
//         const textContent = await page.getTextContent();

//         textContent.items.forEach((item) => {
//           if (item.hasOwnProperty("str")) {
//             extractedText += item.str;
//           } else if (item.hasOwnProperty("text")) {
//             extractedText += item.text;
//           }
//         });
//       }

//       setPdfText(extractedText);
//       setNumPages(pdf.numPages);
//     };

//     fileReader.readAsArrayBuffer(file);
//   };

//   return (
//     <div>
//       <input type="file" accept=".pdf" onChange={onFileChange} />
//       <Document
//         file={null} // Pass a file URL if you want to display the PDF
//         onLoadSuccess={({ numPages }) => setNumPages(numPages)}
//       >
//         <Page pageNumber={1} />
//       </Document>
//       <p>Number of Pages: {numPages}</p>
//       <div>{pdfText}</div>
//     </div>
//   );
// });

// export default PdfTextExtractor;
export {};
