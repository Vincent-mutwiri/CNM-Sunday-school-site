import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '../../../lib/prisma';
import { Parser } from 'json2csv';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const { startDate, endDate, status, teacherId, classId, childId } = req.query;

      // Verify permissions
      const isAdmin = session.user.role === 'ADMIN';
      const isTeacher = session.user.role === 'TEACHER';
      
      // If it's a child export, verify the user is the parent or has admin/teacher role
      if (childId) {
        const isParent = await prisma.family.findFirst({
          where: {
            id: session.user.familyId,
            children: {
              some: { id: childId as string },
            },
          },
        });

        if (!isParent && !isAdmin && !isTeacher) {
          return res.status(403).json({ message: 'Not authorized to export this data' });
        }
      }

      // Build the where clause based on query parameters
      let where: any = {};

      if (startDate && endDate) {
        where.AND = [
          { date: { gte: new Date(startDate as string) } },
          { date: { lte: new Date(endDate as string) } },
        ];
      }

      if (status) {
        where.status = status;
      }

      if (teacherId) {
        where.schedule = {
          teacherId: teacherId as string,
        };
      }

      if (classId) {
        where.schedule = {
          ...where.schedule,
          classId: classId as string,
        };
      }

      if (childId) {
        where.childId = childId as string;
      }

      // If it's a teacher, only allow exporting their own class data
      if (isTeacher && !isAdmin) {
        where.schedule = {
          ...where.schedule,
          teacherId: session.user.id,
        };
      }

      // Fetch attendance data
      const attendance = await prisma.attendance.findMany({
        where,
        include: {
          child: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          schedule: {
            include: {
              class: {
                select: {
                  name: true,
                },
              },
              teacher: {
                select: {
                  name: true,
                },
              },
            },
          },
          markedBy: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          date: 'desc',
        },
      });

      // Format data for CSV
      const formattedData = attendance.map((record) => ({
        'Child Name': `${record.child.firstName} ${record.child.lastName}`,
        'Class': record.schedule.class.name,
        'Teacher': record.schedule.teacher.name,
        'Date': new Date(record.date).toLocaleDateString(),
        'Status': record.status,
        'Notes': record.notes || '',
        'Marked By': record.markedBy.name,
      }));

      // Convert to CSV
      const json2csv = new Parser();
      const csv = json2csv.parse(formattedData);

      // Set headers for file download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=attendance-export.csv');
      
      return res.status(200).send(csv);
    } catch (error) {
      console.error('Error exporting attendance:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
