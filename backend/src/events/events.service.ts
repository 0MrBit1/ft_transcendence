import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) { }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private async findEventOrThrow(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        tags: true,
        organization: { select: { id: true, name: true } },
      },
    });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  // ─── Create ───────────────────────────────────────────────────────────────

  async create(dto: CreateEventDto) {
    // Verify the organizer exists
    const organizer = await this.prisma.user.findUnique({
      where: { id: dto.organizerId },
    });
    if (!organizer || !organizer.isOrganizer) {
      throw new NotFoundException('Organizer not found or user is not an organizer');
    }

    const { tags, ...eventData } = dto;

    return this.prisma.event.create({
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
  }

  // ─── Read ─────────────────────────────────────────────────────────────────

  async findAll(query: {
    tag?: string;
    type?: string;
    page?: number;
    limit?: number;
  }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: any = { status: 'PUBLISHED' };
    if (query.type) where.type = query.type;
    if (query.tag) where.tags = { some: { tag: query.tag } };

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
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
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
    return this.findEventOrThrow(id);
  }

  // ─── Update ───────────────────────────────────────────────────────────────

  async update(id: string, dto: UpdateEventDto) {
    await this.findEventOrThrow(id);

    const { tags, ...fields } = dto;

    const data: any = {};
    if (fields.title !== undefined) data.title = fields.title;
    if (fields.description !== undefined) data.description = fields.description;
    if (fields.type !== undefined) data.type = fields.type;
    if (fields.startTime !== undefined) data.startTime = new Date(fields.startTime);
    if (fields.endTime !== undefined) data.endTime = new Date(fields.endTime);
    if (fields.locationType !== undefined) data.locationType = fields.locationType;
    if (fields.location !== undefined) data.location = fields.location;
    if (fields.capacity !== undefined) {
      data.capacity = fields.capacity;
      // Keep remainingCapacity in sync when capacity changes on a draft/published event
      data.remainingCapacity = fields.capacity;
    }

    // Replace tags when provided — delete existing and re-create
    if (tags !== undefined) {
      data.tags = {
        deleteMany: {},
        create: tags.map((tag) => ({ tag })),
      };
    }

    return this.prisma.event.update({
      where: { id },
      data,
      include: {
        tags: true,
        organizer: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  // ─── Publish ──────────────────────────────────────────────────────────────

  async publish(id: string) {
    const event = await this.findEventOrThrow(id);

    if (event.status === 'PUBLISHED') {
      throw new BadRequestException('Event is already published');
    }
    if (event.status === 'CANCELLED') {
      throw new BadRequestException('Cannot publish a cancelled event');
    }

    return this.prisma.event.update({
      where: { id },
      data: { status: 'PUBLISHED' },
      include: {
        tags: true,
        organization: { select: { id: true, name: true } },
      },
    });
  }

  // ─── Cancel ───────────────────────────────────────────────────────────────

  async cancel(id: string) {
    const event = await this.findEventOrThrow(id);

    if (event.status === 'CANCELLED') {
      throw new BadRequestException('Event is already cancelled');
    }

    return this.prisma.event.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: {
        tags: true,
        organization: { select: { id: true, name: true } },
      },
    });
  }

  // ─── Delete ───────────────────────────────────────────────────────────────

  async remove(id: string) {
    const event = await this.findEventOrThrow(id);

    if (event.status === 'PUBLISHED') {
      throw new BadRequestException(
        'Cannot delete a published event. Cancel it first.',
      );
    }

    await this.prisma.event.delete({ where: { id } });
    return { message: `Event "${event.title}" deleted successfully` };
  }
}
