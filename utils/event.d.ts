import { Event } from '@strapi/database/dist/lifecycles/types';

export type HookEvent = Event & { result: any };
