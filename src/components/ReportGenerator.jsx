import jsPDF from 'jspdf';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

const getNativeDirectory = async () => {
  try {
    return Directory.Documents;
  } catch (error) {
    return Directory.External;
  }
};

const savePdfNative = async (pdfBase64, fileName) => {
  const directory = await getNativeDirectory();
  const result = await Filesystem.writeFile({
    path: fileName,
    data: pdfBase64,
    directory,
    recursive: true,
  });
  return result.uri || result.uri;
};

const sharePdfNative = async (fileName, uri) => {
  await Share.share({
    title: 'Hisaab Report',
    text: 'Here is your Hisaab financial report.',
    url: uri,
    dialogTitle: 'Share Hisaab Report',
  });
};

const getBase64FromDataUri = (dataUri) => {
  const prefix = 'data:application/pdf;base64,';
  if (dataUri.startsWith(prefix)) {
    return dataUri.substring(prefix.length);
  }
  return dataUri;
};

export const generateReport = async (summary) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text('Hisaab - Financial Report', 14, 20);

  doc.setFontSize(12);
  doc.text(`Period: ${summary.period}`, 14, 32);
  doc.text(`Total Income: Rs. ${summary.income}`, 14, 42);
  doc.text(`Total Expense: Rs. ${summary.expense}`, 14, 50);
  doc.text(`EMI Paid: Rs. ${summary.emi}`, 14, 58);
  doc.text(`Total Savings: Rs. ${summary.savings}`, 14, 66);
  doc.text(`Net Balance: Rs. ${summary.income - summary.expense - summary.emi}`, 14, 78);

  const fileName = 'Hisaab-Report.pdf';

  if (Capacitor.isNativePlatform()) {
    try {
      const dataUri = doc.output('datauristring');
      const base64 = getBase64FromDataUri(dataUri);
      const fileUri = await savePdfNative(base64, fileName);
      await sharePdfNative(fileName, fileUri);
      alert(`Report saved and ready to share: ${fileUri}`);
    } catch (error) {
      console.error('Native PDF save failed', error);
      alert('Unable to save report natively. Please try again.');
    }
  } else {
    doc.save(fileName);
  }
};
