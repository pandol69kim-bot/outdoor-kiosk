import { z } from 'zod'

const emptyStringToNull = (value: unknown) => {
  if (typeof value !== 'string') return value

  const trimmedValue = value.trim()
  return trimmedValue === '' ? null : trimmedValue
}

const optionalTrimmedString = z
  .preprocess(emptyStringToNull, z.string().nullable().optional())
  .transform((value) => value ?? null)

const optionalInteger = z
  .preprocess(emptyStringToNull, z.coerce.number().int().nullable().optional())
  .transform((value) => value ?? null)

export const productPayloadSchema = z.object({
  name: z.string().trim().min(1, '상품명을 입력해주세요.'),
  description: optionalTrimmedString,
  price: z.coerce.number().int().positive('0보다 큰 금액을 입력해주세요.'),
  wholesale_price: optionalInteger,
  image_url: optionalTrimmedString,
  wholesaler_id: z
    .preprocess(emptyStringToNull, z.string().uuid().nullable().optional())
    .transform((value) => value ?? null),
  is_active: z.boolean(),
  sort_order: z.coerce.number().int(),
})

export type ProductPayload = z.infer<typeof productPayloadSchema>
