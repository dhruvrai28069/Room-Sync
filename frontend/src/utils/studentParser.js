/**
 * Smart Auto-Detect Student Import Parser
 * Parses user input in CSV, Tab-separated, or Space-separated formats.
 * Recognizes Roll Numbers, Department Codes, Semesters, Sections, and Emails by type and pattern.
 */

export function parseStudentImportText(input, availableDepartments = []) {
  if (!input || typeof input !== 'string' || !input.trim()) {
    return [];
  }

  const raw = input.trim();

  // 1. Check if input is JSON array
  if (raw.startsWith('[')) {
    try {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        return arr.map((item) => ({
          rollNo: String(item.rollNo || item.roll_no || item.roll || '').toUpperCase().trim(),
          name: String(item.name || item.fullName || item.full_name || '').trim(),
          departmentCode: String(item.departmentCode || item.department || item.dept || '').toUpperCase().trim(),
          semester: Number(item.semester || item.sem || 1),
          section: String(item.section || item.sec || 'A').toUpperCase().trim(),
          email: String(item.email || '').trim(),
        }));
      }
    } catch (e) {
      // Fallback to text parser
    }
  }

  // Set of department codes from database + common standard department codes
  const knownDeptCodes = new Set(
    availableDepartments.map((d) => (d.code || d).toUpperCase().trim())
  );
  ['IT', 'CS', 'CSE', 'ME', 'MECH', 'EE', 'EEE', 'ECE', 'CE', 'CIVIL', 'AI', 'DS', 'MATH', 'PHY', 'CHEM'].forEach((c) =>
    knownDeptCodes.add(c)
  );

  const defaultDeptCode = availableDepartments[0]?.code || 'IT';

  // Split input into lines
  const rawLines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const parsedStudents = [];

  for (const line of rawLines) {
    if (!line) continue;

    // A) If line contains commas, parse as CSV
    if (line.includes(',')) {
      const parts = line.split(',').map((p) => p.trim());
      if (parts.length >= 2) {
        let rollNo = parts[0] ? parts[0].toUpperCase() : '';
        let name = parts[1] || '';
        let departmentCode = parts[2] ? parts[2].toUpperCase() : '';
        let semester = parts[3] ? parseInt(parts[3], 10) : 1;
        let section = parts[4] ? parts[4].toUpperCase() : 'A';
        let email = parts[5] || '';

        // If part[2] is a number and no department code specified
        if (!isNaN(parts[2]) && parts[2] !== '' && !parts[3]) {
          semester = parseInt(parts[2], 10);
          departmentCode = defaultDeptCode;
        }

        parsedStudents.push({
          rollNo: rollNo.trim(),
          name: name.trim(),
          departmentCode: departmentCode.trim() || defaultDeptCode,
          semester: isNaN(semester) || semester <= 0 ? 1 : semester,
          section: section.trim() || 'A',
          email: email.trim(),
        });
        continue;
      }
    }

    // B) If line contains tabs (\t), parse as Tab-separated (Excel)
    if (line.includes('\t')) {
      const parts = line.split('\t').map((p) => p.trim());
      if (parts.length >= 2) {
        parsedStudents.push({
          rollNo: parts[0].toUpperCase(),
          name: parts[1] || '',
          departmentCode: parts[2] ? parts[2].toUpperCase() : defaultDeptCode,
          semester: parts[3] && !isNaN(parts[3]) ? parseInt(parts[3], 10) : 1,
          section: parts[4] ? parts[4].toUpperCase() : 'A',
          email: parts[5] || '',
        });
        continue;
      }
    }

    // C) Space-separated tokenization with Type & Pattern recognition
    // Splitting by whitespace
    const tokens = line.split(/\s+/);
    if (tokens.length === 0) continue;

    // Check if line contains multiple entries pasted continuously (e.g. IT101 Rahul IT 6 A IT102 Priya IT 6 B)
    const entryStartIndices = [];
    tokens.forEach((tok, idx) => {
      const isRollNoLike = /^[A-Z0-9_-]{3,12}$/i.test(tok) && (/[A-Z]/i.test(tok) && /\d/.test(tok));
      if (idx === 0 || isRollNoLike) {
        if (idx === 0) {
          entryStartIndices.push(idx);
        } else {
          // Check if previous token was section/sem or department, indicating start of new entry
          const prevTok = tokens[idx - 1].toUpperCase();
          if (/^[1-8]$/.test(prevTok) || /^[A-Z]$/.test(prevTok) || knownDeptCodes.has(prevTok)) {
            entryStartIndices.push(idx);
          }
        }
      }
    });

    // Chunk tokens into entry groups
    const tokenChunks = [];
    if (entryStartIndices.length > 1) {
      for (let i = 0; i < entryStartIndices.length; i++) {
        const start = entryStartIndices[i];
        const end = i < entryStartIndices.length - 1 ? entryStartIndices[i + 1] : tokens.length;
        tokenChunks.push(tokens.slice(start, end));
      }
    } else {
      tokenChunks.push(tokens);
    }

    // Process each token chunk
    for (const chunk of tokenChunks) {
      if (chunk.length === 0) continue;

      let rollNo = chunk[0].toUpperCase();
      let nameParts = [];
      let departmentCode = '';
      let semester = 1;
      let section = 'A';
      let email = '';

      for (let i = 1; i < chunk.length; i++) {
        const tok = chunk[i];
        const tokUpper = tok.toUpperCase();

        // Email pattern
        if (tok.includes('@') && tok.includes('.')) {
          email = tok.toLowerCase();
          continue;
        }

        // Known department code pattern
        if (knownDeptCodes.has(tokUpper) && !departmentCode) {
          departmentCode = tokUpper;
          continue;
        }

        // Semester: 1-8
        if (/^[1-8]$/.test(tok) && !chunk.slice(i + 1).some((t) => /^[1-8]$/.test(t))) {
          semester = parseInt(tok, 10);
          continue;
        }

        // Section: Single char A-Z
        if (/^[A-Z]$/.test(tokUpper) && tokUpper !== departmentCode && i >= chunk.length - 2) {
          section = tokUpper;
          continue;
        }

        // Otherwise, part of student name
        nameParts.push(tok);
      }

      // Fallback check if department code was included in nameParts
      if (!departmentCode && nameParts.length > 1) {
        const lastWord = nameParts[nameParts.length - 1].toUpperCase();
        if (/^[A-Z]{2,6}$/.test(lastWord)) {
          departmentCode = lastWord;
          nameParts.pop();
        }
      }

      parsedStudents.push({
        rollNo,
        name: nameParts.join(' ').trim() || rollNo,
        departmentCode: departmentCode || defaultDeptCode,
        semester: isNaN(semester) || semester <= 0 ? 1 : semester,
        section: section || 'A',
        email,
      });
    }
  }

  return parsedStudents;
}
