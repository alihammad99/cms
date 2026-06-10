import { z } from 'zod'

const FIELD_TYPES = [
  'text', 'long_text', 'number', 'integer', 'boolean',
  'enum', 'json', 'timestamp', 'relation', 'media',
] as const

export const CreateCollectionSchema = z.object({
  name: z
    .string()
    .min(2)
    .max(64)
    .regex(/^[a-z_][a-z0-9_]*$/, 'Collection name must be snake_case'),
  label: z.string().min(1).max(100),
  label_ar: z.string().min(1).max(100),
  realtime: z.boolean().default(false),
})

export const AddFieldSchema = z.object({
  field: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z_][a-z0-9_]*$/, 'Field name must be snake_case'),
  type: z.enum(FIELD_TYPES),
  required: z.boolean().default(false),
  default_value: z.string().nullable().default(null),
  label: z.string().min(1).max(100),
  label_ar: z.string().min(1).max(100),
  enum_options: z.string().nullable().default(null),
  relation_collection: z.string().nullable().default(null),
})

export const UpdateFieldSchema = AddFieldSchema.partial().omit({ field: true, type: true })

export const SetPermissionSchema = z.object({
  action: z.enum(['list', 'read', 'create', 'update', 'delete']),
  level: z.enum(['public', 'authenticated', 'customer', 'admin', 'owner']),
})

export const CreateWebhookSchema = z.object({
  url: z.string().url(),
  events: z.array(z.string()).min(1),
  secret: z.string().optional(),
})

export const CreateApiKeySchema = z.object({
  name: z.string().min(1).max(100),
  expires_at: z.string().datetime().optional().nullable(),
})

export const OtpRequestSchema = z.object({
  phone: z.string().min(10).max(20),
})

export const OtpVerifySchema = z.object({
  phone: z.string().min(10).max(20),
  code: z.string().length(6),
})

export const ListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  filter: z.string().optional(),
})
