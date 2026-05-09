import * as pdfjsLib from 'pdfjs-dist'

// Vite resolves this to the correct bundled worker path — avoids CDN version mismatch
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).href

const gradeMap = {
  'A': 4.0, 'A-': 3.7,
  'B+': 3.5, 'B': 3.0, 'B-': 2.7,
  'C+': 2.5, 'C': 2.0, 'C-': 1.7,
  'D': 1.0, 'F': 0.0,
}

export async function parseTranscript(file) {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise

  let fullText = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    // Join all items with a space — blank PDF positioning items produce the multi-space
    // gaps between columns that our regex relies on (see \s{2,} before credits)
    const pageText = content.items.map(item => item.str).join(' ')
    fullText += pageText + '\n'
  }

  return extractCourseData(fullText)
}

function extractCourseData(text) {
  const courses = []

  // The UDST PDF renders each cell as a separate text item.
  // When joined with spaces, inter-column gaps produce multiple spaces (\s{2,}),
  // while intra-title spaces are single.  The pattern exploits this:
  //
  //   PREFIX   NUMBER   Course Title Words   3.00   3.00   A   12.00
  //
  // Groups: 1=prefix  2=number  3=title  4=attempted  5=earned  6=grade  7=points
  //
  // \s{2,} before the first decimal ensures we don't split inside the title.
  // Title is capped at 60 chars to prevent the lazy match from spanning across
  // the EXEMPTIONS section (EN rows) into the first real institutional credit row.
  // Longest real title in UDST transcripts is ~35 chars; EN spans are 200+ chars.
  // Only rows with grade A–F (± suffix) are matched; EN exemptions and in-progress
  // rows (missing both earned credits and grade columns) are naturally excluded.
  const coursePattern = /([A-Z]{2,4})\s+(\d{3,4})\s+(.{1,60}?)\s{2,}(\d+\.\d{2})\s+(\d+\.\d{2})\s+([A-F][+-]?)\s+(\d+\.\d{2})/g

  let match
  while ((match = coursePattern.exec(text)) !== null) {
    const grade = match[6]
    const earned = parseFloat(match[5])

    if (!(grade in gradeMap)) continue  // skip unknown grades
    if (earned === 0) continue           // skip zero-credit rows (edge case)

    courses.push({
      courseCode:  `${match[1]} ${match[2]}`,
      courseTitle: match[3].trim(),
      attempted:   parseFloat(match[4]),
      earned,
      grade,
      gradePoints: gradeMap[grade],
      points:      parseFloat(match[7]),
    })
  }

  // Extract cumulative GPA — last occurrence is the final running GPA
  const cgpaMatches = [...text.matchAll(/Cumulative\s+GPA\s+([\d.]+)/gi)]
  const cumulativeGPA = cgpaMatches.length > 0
    ? parseFloat(cgpaMatches[cgpaMatches.length - 1][1])
    : null

  // Extract total earned credits — last cGPA credits line
  const creditsMatches = [...text.matchAll(/cGPA\s+credits\s+([\d.]+)/gi)]
  const totalCredits = creditsMatches.length > 0
    ? parseFloat(creditsMatches[creditsMatches.length - 1][1])
    : null

  return { courses, cumulativeGPA, totalCredits }
}
