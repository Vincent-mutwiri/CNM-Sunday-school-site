import { Response } from 'express';
import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';
import Attendance from '../models/attendance.model';
import { AuthRequest } from '../middleware/authMiddleware';

export const generateReport = async (req: AuthRequest, res: Response) => {
  const { reportType, format, options } = req.body;

  if (reportType !== 'attendance') {
    return res.status(400).json({ message: 'Unsupported report type' });
  }

  const records = await Attendance.find({}).populate({
    path: 'schedule',
    populate: { path: 'class', select: 'name' }
  }).lean();

  if (format === 'csv') {
    const parser = new Parser();
    const csv = parser.parse(records);
    res.setHeader('Content-Type', 'text/csv');
    return res.send(csv);
  } else {
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);
    records.forEach(r => {
      const cls = (r.schedule as any).class;
      doc.text(`${cls?.name || ''} - ${r.status}`);
    });
    doc.end();
  }
};
