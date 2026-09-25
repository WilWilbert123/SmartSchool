import ExcelJS from 'exceljs';
// @ts-ignore
import { saveAs } from 'file-saver';
import { calculateTermGrade, calculateFinalGrade3Terms } from './deped-eclass-record';

// Export everything perfectly styled
export const exportFullECRToExcel = async (
  schoolInfo: any,
  students: any[],
  term1Scores: any,
  term2Scores: any,
  term3Scores: any,
  wwHPS: number[],
  ptHPS: number[],
  exHPS: number[]
) => {
  const wb = new ExcelJS.Workbook();
  wb.creator = "SmartSchool E-Class Record";
  wb.created = new Date();

  // Helper styles
  const borderAll: Partial<ExcelJS.Borders> = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' },
  };

  const borderThick: Partial<ExcelJS.Borders> = {
    top: { style: 'medium' },
    left: { style: 'medium' },
    bottom: { style: 'medium' },
    right: { style: 'medium' },
  };

  const headerFont = { name: 'Arial', size: 10, bold: true };
  const titleFont = { name: 'Arial', size: 16, bold: true };
  const dataFont = { name: 'Arial', size: 10 };

  const centerAlign: Partial<ExcelJS.Alignment> = { vertical: 'middle', horizontal: 'center', wrapText: true };
  const leftAlign: Partial<ExcelJS.Alignment> = { vertical: 'middle', horizontal: 'left' };

  // Helper to add DepEd Header to a worksheet
  const addDepEdHeader = (ws: ExcelJS.Worksheet, title: string) => {
    ws.mergeCells('A1:U1');
    ws.getCell('A1').value = "DEPARTMENT OF EDUCATION";
    ws.getCell('A1').font = { ...titleFont, size: 12 };
    ws.getCell('A1').alignment = centerAlign;

    ws.mergeCells('A2:U2');
    ws.getCell('A2').value = "OFFICIAL ELECTRONIC CLASS RECORD (ECR)";
    ws.getCell('A2').font = { ...titleFont, size: 11 };
    ws.getCell('A2').alignment = centerAlign;

    ws.mergeCells('A3:U3');
    ws.getCell('A3').value = title;
    ws.getCell('A3').font = titleFont;
    ws.getCell('A3').alignment = centerAlign;

    ws.getCell('B5').value = "REGION:";
    ws.getCell('B5').font = headerFont;
    ws.getCell('C5').value = schoolInfo.region;
    ws.getCell('E5').value = "DIVISION:";
    ws.getCell('E5').font = headerFont;
    ws.getCell('F5').value = schoolInfo.division;
    ws.getCell('H5').value = "SCHOOL ID:";
    ws.getCell('H5').font = headerFont;
    ws.getCell('I5').value = schoolInfo.schoolId;

    ws.getCell('B6').value = "SCHOOL NAME:";
    ws.getCell('B6').font = headerFont;
    ws.getCell('C6').value = schoolInfo.schoolName;
    ws.getCell('H6').value = "SCHOOL YEAR:";
    ws.getCell('H6').font = headerFont;
    ws.getCell('I6').value = schoolInfo.schoolYear;

    ws.getCell('B7').value = "TEACHER:";
    ws.getCell('B7').font = headerFont;
    ws.getCell('C7').value = schoolInfo.teacher;
    ws.getCell('E7').value = "SUBJECT:";
    ws.getCell('E7').font = headerFont;
    ws.getCell('F7').value = schoolInfo.subject;
    ws.getCell('H7').value = "GRADE & SEC:";
    ws.getCell('H7').font = headerFont;
    ws.getCell('I7').value = `${schoolInfo.gradeLevel} - ${schoolInfo.section}`;
    
    ws.addRow([]); // Blank row
  };

  // --- SHEET 1: INPUT DATA ---
  const wsInput = wb.addWorksheet("INPUT DATA", { pageSetup: { paperSize: 9, orientation: 'portrait' }});
  wsInput.columns = [
    { width: 5 }, { width: 15 }, { width: 35 }, { width: 15 }
  ];
  addDepEdHeader(wsInput, "REGISTERED LEARNERS & SCHOOL INFORMATION");
  
  const inputStartRow = 9;
  wsInput.getRow(inputStartRow).values = ["", "LEARNER NUMBER", "LEARNER NAME", "GENDER"];
  wsInput.getRow(inputStartRow).font = headerFont;
  wsInput.getRow(inputStartRow).alignment = centerAlign;
  ['B', 'C', 'D'].forEach(col => wsInput.getCell(`${col}${inputStartRow}`).border = borderAll);

  students.forEach((s, i) => {
    const row = wsInput.getRow(inputStartRow + 1 + i);
    row.values = ["", s.studentNumber, s.name, s.gender];
    row.font = dataFont;
    row.getCell(2).alignment = centerAlign;
    row.getCell(3).alignment = leftAlign;
    row.getCell(4).alignment = centerAlign;
    ['B', 'C', 'D'].forEach(col => row.getCell(col).border = borderAll);
  });


  // --- TERM SHEETS 1, 2, 3 ---
  const createTermSheet = (termKey: string, sheetName: string, scoresData: any) => {
    const ws = wb.addWorksheet(sheetName, { pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 1 }});
    ws.columns = [
      { width: 35 }, // A: Name
      ...Array(5).fill({ width: 5 }), // B-F: WW1-5
      { width: 7 }, { width: 6 }, { width: 6 }, // G-I: Total, PS, WS
      ...Array(3).fill({ width: 5 }), // J-L: PT1-3
      { width: 7 }, { width: 6 }, { width: 6 }, // M-O: Total, PS, WS
      ...Array(3).fill({ width: 5 }), // P-R: EX1-3
      { width: 7 }, { width: 6 }, { width: 6 }, // S-U: Total, PS, WS
      { width: 8 }, { width: 8 }, { width: 15 }, { width: 10 } // V-Y: IG, TG, Desc, Rem
    ];

    addDepEdHeader(ws, `CLASS RECORD - ${sheetName}`);

    const headerRow1 = 9;
    const headerRow2 = 10;
    const headerRow3 = 11;
    
    // Mappings for nested headers
    ws.mergeCells(`A${headerRow1}:A${headerRow2}`);
    ws.getCell(`A${headerRow1}`).value = "LEARNERS' NAMES";
    ws.getCell(`A${headerRow1}`).alignment = centerAlign;

    ws.mergeCells(`B${headerRow1}:I${headerRow1}`);
    ws.getCell(`B${headerRow1}`).value = "WRITTEN WORKS (20%)";
    ws.getCell(`B${headerRow1}`).alignment = centerAlign;
    
    ws.mergeCells(`J${headerRow1}:O${headerRow1}`);
    ws.getCell(`J${headerRow1}`).value = "PERFORMANCE TASKS (60%)";
    ws.getCell(`J${headerRow1}`).alignment = centerAlign;

    ws.mergeCells(`P${headerRow1}:U${headerRow1}`);
    ws.getCell(`P${headerRow1}`).value = "EXAMINATIONS (20%)";
    ws.getCell(`P${headerRow1}`).alignment = centerAlign;

    ['V', 'W', 'X', 'Y'].forEach(col => {
      ws.mergeCells(`${col}${headerRow1}:${col}${headerRow2}`);
      ws.getCell(`${col}${headerRow1}`).alignment = centerAlign;
    });
    ws.getCell(`V${headerRow1}`).value = "INITIAL GRADE";
    ws.getCell(`W${headerRow1}`).value = "TERM GRADE";
    ws.getCell(`X${headerRow1}`).value = "DESCRIPTOR";
    ws.getCell(`Y${headerRow1}`).value = "REMARK";

    // Row 2 sub-headers
    const wwCols = ['B','C','D','E','F','G','H','I'];
    const wwHeaders = ['1','2','3','4','5','Total','PS','WS'];
    wwCols.forEach((col, i) => { ws.getCell(`${col}${headerRow2}`).value = wwHeaders[i]; ws.getCell(`${col}${headerRow2}`).alignment = centerAlign; });

    const ptCols = ['J','K','L','M','N','O'];
    const ptHeaders = ['1','2','3','Total','PS','WS'];
    ptCols.forEach((col, i) => { ws.getCell(`${col}${headerRow2}`).value = ptHeaders[i]; ws.getCell(`${col}${headerRow2}`).alignment = centerAlign; });

    const exCols = ['P','Q','R','S','T','U'];
    const exHeaders = ['ST1','ST2','TE','Total','PS','WS'];
    exCols.forEach((col, i) => { ws.getCell(`${col}${headerRow2}`).value = exHeaders[i]; ws.getCell(`${col}${headerRow2}`).alignment = centerAlign; });

    // Row 3 HPS
    ws.getCell(`A${headerRow3}`).value = "HIGHEST POSSIBLE SCORE";
    ws.getCell(`A${headerRow3}`).alignment = leftAlign;
    
    const hpsRow = ws.getRow(headerRow3);
    wwHPS.forEach((hps, i) => hpsRow.getCell(i+2).value = hps);
    hpsRow.getCell(7).value = 100; hpsRow.getCell(8).value = 100; hpsRow.getCell(9).value = '20%';
    
    ptHPS.forEach((hps, i) => hpsRow.getCell(i+10).value = hps);
    hpsRow.getCell(13).value = 100; hpsRow.getCell(14).value = 100; hpsRow.getCell(15).value = '60%';

    exHPS.forEach((hps, i) => hpsRow.getCell(i+16).value = hps);
    hpsRow.getCell(19).value = 100; hpsRow.getCell(20).value = 100; hpsRow.getCell(21).value = '20%';
    hpsRow.getCell(22).value = 100; hpsRow.getCell(23).value = 100; hpsRow.getCell(24).value = '-'; hpsRow.getCell(25).value = '-';

    // Style headers
    for (let r = headerRow1; r <= headerRow3; r++) {
      ws.getRow(r).font = headerFont;
      for (let c = 1; c <= 25; c++) {
        ws.getCell(r, c).border = borderAll;
        if (r === headerRow3 && c > 1) {
          ws.getCell(r, c).alignment = centerAlign;
          ws.getCell(r, c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
        }
      }
    }

    let currentRow = headerRow3 + 1;
    
    const drawGroup = (gender: string) => {
      const group = students.filter(s => s.gender === gender);
      if (group.length > 0) {
        ws.mergeCells(`A${currentRow}:Y${currentRow}`);
        ws.getCell(`A${currentRow}`).value = `--- ${gender} LEARNERS ---`;
        ws.getCell(`A${currentRow}`).font = { ...headerFont, color: { argb: gender === 'MALE' ? 'FF0000FF' : 'FFFF00FF' } };
        ws.getCell(`A${currentRow}`).border = borderAll;
        ws.getCell(`A${currentRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6E6E6' } };
        currentRow++;

        group.forEach(s => {
          const calc = calculateTermGrade({
            writtenWorks: scoresData[s.id]?.ww || [0,0,0,0,0],
            writtenWorksHPS: wwHPS,
            performanceTasks: scoresData[s.id]?.pt || [0,0,0],
            performanceTasksHPS: ptHPS,
            examScores: scoresData[s.id]?.ex || [0,0,0],
            examHPS: exHPS
          });

          const r = ws.getRow(currentRow);
          r.font = dataFont;
          r.getCell(1).value = s.name; r.getCell(1).alignment = leftAlign;
          
          const sData = scoresData[s.id] || { ww:[0,0,0,0,0], pt:[0,0,0], ex:[0,0,0] };
          sData.ww.forEach((v:any, i:any) => r.getCell(i+2).value = v);
          r.getCell(7).value = calc.wwTotal; r.getCell(8).value = `${calc.wwPS}%`; r.getCell(9).value = calc.wwWS;
          
          sData.pt.forEach((v:any, i:any) => r.getCell(i+10).value = v);
          r.getCell(13).value = calc.ptTotal; r.getCell(14).value = `${calc.ptPS}%`; r.getCell(15).value = calc.ptWS;

          sData.ex.forEach((v:any, i:any) => r.getCell(i+16).value = v);
          r.getCell(19).value = calc.exTotal; r.getCell(20).value = `${calc.exPS}%`; r.getCell(21).value = calc.exWS;

          r.getCell(22).value = calc.initialGrade;
          r.getCell(23).value = calc.transmutedGrade;
          r.getCell(24).value = calc.descriptor;
          r.getCell(25).value = calc.remark;

          for (let c = 1; c <= 25; c++) {
             r.getCell(c).border = borderAll;
             if (c > 1) r.getCell(c).alignment = centerAlign;
          }
          currentRow++;
        });
      }
    };

    drawGroup('MALE');
    drawGroup('FEMALE');
  };

  createTermSheet('term1', 'TERM 1', term1Scores);
  createTermSheet('term2', 'TERM 2', term2Scores);
  createTermSheet('term3', 'TERM 3', term3Scores);

  // --- FINAL GRADES SHEET ---
  const wsFinal = wb.addWorksheet("FINAL GRADES", { pageSetup: { paperSize: 9, orientation: 'portrait', fitToPage: true, fitToWidth: 1 }});
  wsFinal.columns = [
    { width: 35 }, { width: 10 }, { width: 10 }, { width: 10 }, { width: 10 }, { width: 15 }, { width: 15 }, { width: 15 }
  ];
  addDepEdHeader(wsFinal, "CLASS RECORD - FINAL SUMMARY GRADES");

  const fHeaderRow = 9;
  wsFinal.getRow(fHeaderRow).values = ["LEARNERS' NAMES", "GENDER", "TERM 1", "TERM 2", "TERM 3", "FINAL GRADE", "DESCRIPTOR", "REMARK"];
  wsFinal.getRow(fHeaderRow).font = headerFont;
  wsFinal.getRow(fHeaderRow).alignment = centerAlign;
  for (let c=1; c<=8; c++) wsFinal.getCell(fHeaderRow, c).border = borderAll;

  let fRow = fHeaderRow + 1;
  const drawFinalGroup = (gender: string) => {
    const group = students.filter(s => s.gender === gender);
    if (group.length > 0) {
      wsFinal.mergeCells(`A${fRow}:H${fRow}`);
      wsFinal.getCell(`A${fRow}`).value = `--- ${gender} LEARNERS ---`;
      wsFinal.getCell(`A${fRow}`).font = { ...headerFont, color: { argb: gender === 'MALE' ? 'FF0000FF' : 'FFFF00FF' } };
      wsFinal.getCell(`A${fRow}`).border = borderAll;
      wsFinal.getCell(`A${fRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6E6E6' } };
      fRow++;

      group.forEach(s => {
        const t1 = calculateTermGrade({ writtenWorks: term1Scores[s.id]?.ww || [0,0,0,0,0], writtenWorksHPS: wwHPS, performanceTasks: term1Scores[s.id]?.pt || [0,0,0], performanceTasksHPS: ptHPS, examScores: term1Scores[s.id]?.ex || [0,0,0], examHPS: exHPS }).transmutedGrade;
        const t2 = calculateTermGrade({ writtenWorks: term2Scores[s.id]?.ww || [0,0,0,0,0], writtenWorksHPS: wwHPS, performanceTasks: term2Scores[s.id]?.pt || [0,0,0], performanceTasksHPS: ptHPS, examScores: term2Scores[s.id]?.ex || [0,0,0], examHPS: exHPS }).transmutedGrade;
        const t3 = calculateTermGrade({ writtenWorks: term3Scores[s.id]?.ww || [0,0,0,0,0], writtenWorksHPS: wwHPS, performanceTasks: term3Scores[s.id]?.pt || [0,0,0], performanceTasksHPS: ptHPS, examScores: term3Scores[s.id]?.ex || [0,0,0], examHPS: exHPS }).transmutedGrade;
        const final = calculateFinalGrade3Terms(t1, t2, t3);

        const r = wsFinal.getRow(fRow);
        r.values = [s.name, s.gender, t1, t2, t3, final.finalGrade, final.descriptor, final.remark];
        r.font = dataFont;
        r.getCell(1).alignment = leftAlign;
        for (let c=2; c<=8; c++) r.getCell(c).alignment = centerAlign;
        for (let c=1; c<=8; c++) r.getCell(c).border = borderAll;
        fRow++;
      });
    }
  };
  drawFinalGroup('MALE');
  drawFinalGroup('FEMALE');

  const buffer = await wb.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `DepEd_ECR_${schoolInfo.gradeLevel.replace(/\s+/g, '_')}_${schoolInfo.subject.replace(/\s+/g, '_')}.xlsx`);
};
