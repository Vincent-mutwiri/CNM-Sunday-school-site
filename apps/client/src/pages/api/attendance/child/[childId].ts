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

  const { childId } = req.query;

  if (req.method === 'GET') {
    try {
      const { startDate, endDate } = req.query;

      // Verify that the user is the parent of this child or has admin/teacher role
      const isParent = await prisma.family.findFirst({
        where: {
          id: session.user.familyId,
          children: {
            some: { id: childId as string },
          },
        },
      });

      const isAdminOrTeacher = ['ADMIN', 'TEACHER'].includes(session.user.role);

      if (!isParent && !isAdminOrTeacher) {
        return res.status(403).json({ message: 'Not authorized to view this child\'s attendance' });
      }

      let where: any = {
        childId: childId as string,
      };

      if (startDate && endDate) {
        where.AND = [
          { date: { gte: new Date(startDate as string) } },
          { date: { lte: new Date(endDate as string) } },
        ];
      }

      const attendance = await prisma.attendance.findMany({
        where,
        include: {
          schedule: {
            include: {
              class: {
                select: {
                  id: true,
                  name: true,
                  ageRange: true,
                },
              },
              teacher: {
                select: {
                  id: true,
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

      return res.status(200).json({ attendance });
    } catch (error) {
      console.error('Error fetching child attendance:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
