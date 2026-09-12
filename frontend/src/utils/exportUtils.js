/**
 * Export Utilities for Room-wise, Student-wise, and Examination Reports
 */

// Helper to trigger browser CSV download
const downloadCSV = (filename, csvContent) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportRoomWiseCSV = (arrangement) => {
  if (!arrangement || !arrangement.allocations) return;

  const headers = ['Building', 'Room Number', 'Row', 'Column', 'Seat Number', 'Roll Number', 'Student Name', 'Department', 'Subject'];
  const rows = arrangement.allocations.map((a) => [
    `"${a.building || ''}"`,
    `"${a.roomNumber || ''}"`,
    a.row,
    a.col,
    a.seatNumber,
    `"${a.rollNo || ''}"`,
    `"${a.studentName || ''}"`,
    `"${a.departmentCode || ''}"`,
    `"${a.subjectCode || ''}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const filename = `${arrangement.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_roomwise.csv`;
  downloadCSV(filename, csvContent);
};

export const exportStudentWiseCSV = (arrangement) => {
  if (!arrangement || !arrangement.allocations) return;

  const headers = ['Roll Number', 'Student Name', 'Department', 'Subject', 'Building', 'Room Number', 'Row', 'Column', 'Seat Number'];
  
  // Sort allocations alphabetically by Roll Number
  const sortedAllocations = [...arrangement.allocations].sort((a, b) =>
    a.rollNo.localeCompare(b.rollNo)
  );

  const rows = sortedAllocations.map((a) => [
    `"${a.rollNo || ''}"`,
    `"${a.studentName || ''}"`,
    `"${a.departmentCode || ''}"`,
    `"${a.subjectCode || ''}"`,
    `"${a.building || ''}"`,
    `"${a.roomNumber || ''}"`,
    a.row,
    a.col,
    a.seatNumber,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const filename = `${arrangement.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_studentwise.csv`;
  downloadCSV(filename, csvContent);
};

export const printArrangementReport = (arrangement) => {
  if (!arrangement || !arrangement.allocations) return;

  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) return;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Exam Seating Arrangement Report — ${arrangement.title}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; color: #1e293b; }
          h1 { font-size: 20px; text-transform: uppercase; border-bottom: 2px solid #0f172a; padding-bottom: 8px; margin-bottom: 4px; }
          .sub { font-size: 12px; color: #64748b; margin-bottom: 20px; }
          .metrics { display: flex; gap: 15px; margin-bottom: 20px; background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 12px; }
          .metrics div { flex: 1; }
          .metrics strong { display: block; font-size: 16px; color: #0284c7; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
          th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
          th { background-color: #f1f5f9; font-weight: bold; text-transform: uppercase; }
          tr:nth-child(even) { background-color: #f8fafc; }
          .badge { background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-weight: bold; }
          @media print {
            body { padding: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h1>OFFICIAL EXAMINATION SEATING ARRANGEMENT REPORT</h1>
            <p class="sub">${arrangement.title} • Generated on ${new Date(arrangement.createdAt).toLocaleString()}</p>
          </div>
          <button onclick="window.print()" style="padding: 8px 16px; background: #0284c7; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">Print / Save PDF</button>
        </div>

        <div class="metrics">
          <div>Status: <strong>${arrangement.status}</strong></div>
          <div>Total Candidates: <strong>${arrangement.metrics?.allocatedSeats || 0}</strong></div>
          <div>Capacity Utilization: <strong>${arrangement.metrics?.utilizationRate || 0}%</strong></div>
          <div>Anti-Cheating Score: <strong>${arrangement.metrics?.softConstraintScore || 100}/100</strong></div>
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Roll Number</th>
              <th>Student Name</th>
              <th>Department</th>
              <th>Subject</th>
              <th>Building</th>
              <th>Room</th>
              <th>Seat Coordinates</th>
            </tr>
          </thead>
          <tbody>
            ${arrangement.allocations.map((a, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td><span class="badge">${a.rollNo}</span></td>
                <td>${a.studentName}</td>
                <td>${a.departmentCode}</td>
                <td>${a.subjectCode}</td>
                <td>${a.building}</td>
                <td>${a.roomNumber}</td>
                <td>Row ${a.row}, Col ${a.col} (Seat #${a.seatNumber})</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
