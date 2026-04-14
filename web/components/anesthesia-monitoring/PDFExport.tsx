import { useState } from 'react';
import { Document, Page, pdf } from '@react-pdf/renderer';

const PDFExport = () => {
  const [records, setRecords] = useState([]);

  const handleExportPDF = () => {
    const doc = new Document();
    const page = new Page();
    page.addText('Anesthesia Monitoring Records');
    records.forEach((record) => {
      page.addText(`Patient: ${record.patient_name}`);
      page.addText(`Procedure: ${record.procedure_name}`);
      page.addText(`Vital Signs: ${record.vital_signs}`);
    });
    pdf(doc).then((pdfDoc) => {
      const pdfBlob = new Blob([pdfDoc], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = pdfUrl;
      a.download = 'anesthesia-monitoring-records.pdf';
      a.click();
    });
  };

  return (
    <div>
      <h2>PDF Export</h2>
      <button onClick={handleExportPDF}>Export PDF</button>
    </div>
  );
};

export default PDFExport;