import { z } from 'zod';

export const BookingSchema = z.object({
  body: z.object({
    date: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    facility: z.string(),
  }),
});

export type TBooking = z.infer<typeof BookingSchema>;
