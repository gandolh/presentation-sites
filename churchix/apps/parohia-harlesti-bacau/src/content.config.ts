import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import {
  siteSchema,
  announcementSchema,
  serviceScheduleSchema,
  campaignSchema,
  staffSchema,
} from '@churchix/schemas';

// Same shared schemas every Churchix church imports — only the data differs.
export const collections = {
  site: defineCollection({ loader: file('src/content/site.json'), schema: siteSchema }),
  schedule: defineCollection({ loader: file('src/content/schedule.json'), schema: serviceScheduleSchema }),
  announcements: defineCollection({
    loader: glob({
      pattern: '**/*.md',
      base: './src/content/announcements',
      generateId: ({ entry }) => entry.replace(/\.md$/, ''),
    }),
    schema: announcementSchema,
  }),
  campaigns: defineCollection({
    loader: glob({
      pattern: '**/*.md',
      base: './src/content/campaigns',
      generateId: ({ entry }) => entry.replace(/\.md$/, ''),
    }),
    schema: campaignSchema,
  }),
  // Optional leadership listing for /despre. Empty/absent → page renders prose only.
  staff: defineCollection({
    loader: glob({
      pattern: '**/*.md',
      base: './src/content/staff',
      generateId: ({ entry }) => entry.replace(/\.md$/, ''),
    }),
    schema: staffSchema,
  }),
};
