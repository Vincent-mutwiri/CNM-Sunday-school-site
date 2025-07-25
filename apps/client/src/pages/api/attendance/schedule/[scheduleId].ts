import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { prisma } from '../../../../lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { scheduleId } = req.query;

  if (req.method === 'GET') {
    try {
      // Get the schedule with the teacher
      const schedule = await prisma.schedule.findUnique({
        where: { id: scheduleId as string },
        include: {
          class: true,
          teacher: true,
          children: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      if (!schedule) {
        return res.status(404).json({ message: 'Schedule not found' });
      }

      // Check if user is authorized (teacher of this class or admin)
      const isTeacher = session.user.role === 'TEACHER' && schedule.teacherId === session.user.id;
      const isAdmin = session.user.role === 'ADMIN';

      if (!isTeacher && !isAdmin) {
        return res.status(403).json({ message: 'Not authorized to view this schedule' });
      }

      // Get attendance records for this schedule
      const attendance = await prisma.attendance.findMany({
        where: { scheduleId: scheduleId as string },
        include: {
          child: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          markedBy: {
            select: {
              name: true,
            },
          },
        },
      });

      // Create a map of childId to attendance record for easy lookup
      const attendanceMap = new Map(
        attendance.map((record) => [record.childId, record])
      );

      // Create attendance records for all children in the schedule
      const attendanceRecords = schedule.children.map((child) => ({
        child,
        attendance: attendanceMap.get(child.id) || null,
      }));

      return res.status(200).json({
        schedule: {
          id: schedule.id,
          date: schedule.date,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          class: schedule.class,
          teacher: schedule.teacher,
        },
        attendance: attendanceRecords,
      });
    } catch (error) {
      console.error('Error fetching schedule attendance:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
