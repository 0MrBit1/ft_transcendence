import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) { }

  async create(dto: CreateEventDto) {
    // Verify the organizer exists
    const organizer = await this.prisma.user.findUnique({
      where: { id: dto.organizerId },
    });
    if (!organizer || !organizer.isOrganizer) {
      throw new NotFoundException('Organizer not found or user is not an organizer');
    }

    const { tags, ...eventData } = dto;

    const event = await this.prisma.event.create({
      data: {
        title: eventData.title,
        description: eventData.description,
        type: eventData.type,
        startTime: new Date(eventData.startTime),
        endTime: eventData.endTime ? new Date(eventData.endTime) : null,
        locationType: eventData.locationType,
        location: eventData.location,
        capacity: eventData.capacity ?? null,
        remainingCapacity: eventData.capacity ?? null,
        organizerId: eventData.organizerId,
        tags: tags?.length
          ? { create: tags.map((tag) => ({ tag })) }
          : undefined,
      },
      include: {
        tags: true,
        organizer: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return event;
  }

  async findAll(query: { tag?: string; type?: string; page?: number; limit?: number }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: any = { status: 'PUBLISHED' };

    if (query.type) {
      where.type = query.type;
    }

    if (query.tag) {
      where.tags = { some: { tag: query.tag } };
    }

    const [events, total] = await this.prisma.$transaction([
      this.prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startTime: 'asc' },
        include: {
          tags: true,
          organizer: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      this.prisma.event.count({ where }),
    ]);

    return {
      data: events,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findAllDebug() {
    const events = await this.prisma.event.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        tags: true,
        organizer: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    return { data: events, meta: { total: events.length } };
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        tags: true,
        organizer: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }
}
