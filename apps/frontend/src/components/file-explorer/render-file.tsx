// import { Document, Page } from 'react-pdf';
// import { useState, useEffect } from 'react';

// interface File {
//     id: string;
//     name: string;
//     type: "file" | "folder";
//     url?: string;
//     filetype?: string;
//     size?: number;
//   }

// export const RenderFileContent = ({ file }: { file: File }) => {
//     const [numPages, setNumPages] = useState<number | null>(null);
//     const [pageNumber, setPageNumber] = useState(1);
//     const [scale, setScale] = useState(1.0);
  
//     const commonClasses = "max-w-full max-h-[calc(100vh-250px)] mx-auto";
  
//     const toast = ({ title, description, variant }: { title: string; description: string; variant: string }) => {
//       // Implement your toast notification logic here
//       console.log(`${variant}: ${title} - ${description}`);
//     };
  
//     if (!file.url) {
//       return <p className="text-center">Invalid file URL.</p>;
//     }
  
//     const fileExtension = file.url.split('.').pop()?.toLowerCase();
  
//     // 1. Images (Native Support)
//     if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'bmp', 'webp'].includes(fileExtension!)) {
//       return <img src={file.url} alt={file.name} className={`object-contain ${commonClasses}`} />;
//     }
  
//     // 2. Videos (Native Support)
//     if (['mp4', 'webm', 'ogg', 'mov'].includes(fileExtension!)) {
//       return <video controls src={file.url} className={commonClasses}></video>;
//     }
  
//     // 3. Audio (Native Support)
//     if (['mp3', 'wav', 'ogg', 'flac'].includes(fileExtension!)) {
//       return <audio controls src={file.url} className={commonClasses}></audio>;
//     }
  
//     // 4. PDFs (React-PDF)
//     if (fileExtension === 'pdf') {
//       return (
//         <div className="flex flex-col items-center w-full h-full">
//           <div className="flex-grow overflow-auto w-full max-h-[calc(100vh-250px)] flex justify-center">
//             <Document
//               file={file.url}
//               onLoadSuccess={(doc) => setNumPages(doc.numPages)}
//               onLoadError={() =>
//                 toast({
//                   title: "Error",
//                   description: "Failed to load the PDF file.",
//                   variant: "destructive",
//                 })
//               }
//             >
//               <Page pageNumber={pageNumber} scale={scale} />
//             </Document>
//           </div>
//           {/* Add PDF Controls */}
//         </div>
//       );
//     }
  
//     // 5. Text and Code Files
//     if (['txt', 'json', 'log', 'html', 'xml', 'csv'].includes(fileExtension!)) {
//       const [content, setContent] = useState<string | null>(null);
  
//       useEffect(() => {
//         fetch(file.url as string)
//           .then((res) => res.text())
//           .then(setContent)
//           .catch(() => setContent('Failed to load content.'));
//       }, [file.url]);
  
//       return <pre className="whitespace-pre-wrap p-4 overflow-auto">{content}</pre>;
//     }
  
//     // 6. Microsoft Office Files (Google Docs Viewer)
//     if (['docx', 'pptx', 'xlsx'].includes(fileExtension!)) {
//       const googleViewerUrl = `https://docs.google.com/gview?url=${file.url}&embedded=true`;
//       return <iframe src={googleViewerUrl} className="w-full h-[calc(100vh-250px)]" title="Document Viewer"></iframe>;
//     }
  
//     // 7. Fallback (Unsupported)
//     return (
//       <div className="text-center">
//         <p>Preview not available for this file type.</p>
//         <a href={file.url} download className="text-blue-500 underline">
//           Download File
//         </a>
//       </div>
//     );
//   };