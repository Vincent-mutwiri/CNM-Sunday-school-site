import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');
    const teacherId = searchParams.get('teacherId');
    const classId = searchParams.get('classId');

    let where: any = {};

    if (startDate && endDate) {
      where.AND = [
        { date: { gte: new Date(startDate) } },
        { date: { lte: new Date(endDate) } },
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

    // If user is a teacher, only show their classes
    if (session.user.role === 'TEACHER') {
      where.teacherId = session.user.id;
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

    return NextResponse.json(attendance);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { scheduleId, records } = await req.json();
    const teacherId = session.user.id;

    // Verify that the teacher is assigned to this schedule
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
      select: { teacherId: true },
    });

    if (!schedule) {
      return NextResponse.json(
        { message: 'Schedule not found' },
        { status: 404 }
      );
    }

    if (schedule.teacherId !== teacherId) {
      return NextResponse.json(
        { message: 'Not authorized to mark attendance for this schedule' },
        { status: 403 }
      );
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

    return NextResponse.json({
      message: 'Attendance marked successfully',
      attendanceRecords,
    });
  } catch (error) {
    console.error('Error marking attendance:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
