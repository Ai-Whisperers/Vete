import { useState } from 'react';

const ExportReports = () => {
  const [reportType, setReportType] = useState('pdf');

  const handleExport = async () => {
    // Implement report export logic here
  };

  return (
    <div>
      <h2>Export Reports</h2>
      <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
        <option value="pdf">PDF</option>
        <option value="csv">CSV</option>
        <option value="excel">Excel</option>
      </select>
      <button onClick={handleExport}>Export</button>
    </div>
  );
};

export default ExportReports;