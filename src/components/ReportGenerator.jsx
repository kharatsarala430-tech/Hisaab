import jsPDF from 'jspdf';

export const generateReport = (summary) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Hisaab - Financial Report", 14, 20);

  doc.setFontSize(12);
  doc.text(`Period: ${summary.period}`, 14, 32);
  doc.text(`Total Income: Rs. ${summary.income}`, 14, 42);
  doc.text(`Total Expense: Rs. ${summary.expense}`, 14, 50);
  doc.text(`EMI Paid: Rs. ${summary.emi}`, 14, 58);
  doc.text(`Total Savings: Rs. ${summary.savings}`, 14, 66);
  doc.text(`Net Balance: Rs. ${summary.income - summary.expense - summary.emi}`, 14, 78);

  doc.save("Hisaab-Report.pdf");
};
