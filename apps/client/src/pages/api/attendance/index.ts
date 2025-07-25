import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '../../../lib/prisma';

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
      const { startDate, endDate, status, teacherId, classId } = req.query;

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
        where.teacherId = teacherId;
      }

      if (classId) {
        where.classId = classId;
      }

      const attendance = await prisma.attendance.findMany({
        where,
        include: {
          child: {
            select: {
              id: true,
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

      return res.status(200).json(attendance);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { scheduleId, records } = req.body;
      const teacherId = session.user.id;

      // Verify that the teacher is assigned to this schedule
      const schedule = await prisma.schedule.findUnique({
        where: { id: scheduleId },
        select: { teacherId: true },
      });

      if (!schedule) {
        return res.status(404).json({ message: 'Schedule not found' });
      }

      if (schedule.teacherId !== teacherId) {
        return res.status(403).json({ message: 'Not authorized to mark attendance for this schedule' });
      }

      // Delete existing attendance for this schedule
      await prisma.attendance.deleteMany({
        where: { scheduleId },
      });

      // Create new attendance records
      const attendanceRecords = await Promise.all(
        records.map((record: any) =>
          prisma.attendance.create({
            data: {
              status: record.status,
              notes: record.notes || '',
              childId: record.childId,
              scheduleId,
              markedById: teacherId,
              date: new Date(),
            },
          })
        )
      );

      return res.status(200).json({ message: 'Attendance marked successfully', attendanceRecords });
    } catch (error) {
      console.error('Error marking attendance:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
