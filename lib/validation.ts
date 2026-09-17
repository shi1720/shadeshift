import { z } from "zod";
const id = z.enum(["rail", "north", "rideshare", "holly", "fannin", "west"]);
const packageId = z.enum(["none", "shade", "water", "queue", "complete"]);
const override = z
  .object({
    visitors: z.number().finite().min(0).max(200000).optional(),
    walkMinutes: z.number().finite().min(0).max(120).optional(),
    queueMinutes: z.number().finite().min(0).max(120).optional(),
    shade: z.number().finite().min(0).max(1).optional(),
    residentShare: z.number().finite().min(0).max(1).optional(),
    dailyResidents: z.number().finite().min(0).max(100000).optional(),
  })
  .strict();
export const scenarioSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    budget: z.number().finite().min(0).max(250000),
    attendance: z.number().finite().min(0).max(200000),
    temperature: z.number().finite().min(60).max(115),
    humidity: z.number().finite().min(5).max(100),
    hour: z.number().int().min(10).max(20),
    effectiveness: z.number().finite().min(0).max(100),
    residentMinimum: z.number().finite().min(0).max(100),
    eventDays: z.number().int().min(1).max(365),
    legacyDays: z.number().int().min(0).max(365),
    legacySunlight: z.number().finite().min(0).max(1).default(1),
    costOverrides: z
      .record(packageId, z.number().finite().min(0).max(250000))
      .default({}),
    packages: z.record(id, packageId),
    overrides: z.record(id, override),
  })
  .strict()
  .refine(
    (s) =>
      s.attendance === 0 ||
      ["rail", "north", "rideshare", "holly", "fannin", "west"].some(
        (k) => (s.overrides[k as keyof typeof s.overrides]?.visitors ?? 1) > 0,
      ),
    { message: "Positive attendance requires a positive demand weight." },
  );
