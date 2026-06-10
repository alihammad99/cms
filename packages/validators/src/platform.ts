import { z } from 'zod'
import { ROLES, PLANS } from '@manzoom/config'

export const SignupSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
})

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const CreateStoreSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
})

export const InviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(ROLES),
})

export const UpdateStoreSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  currency: z.string().length(3).optional(),
  timezone: z.string().optional(),
  customer_auth_required: z.boolean().optional(),
  logo_url: z.string().url().optional().nullable(),
})

export const PlanName = z.enum(Object.keys(PLANS) as [string, ...string[]])
