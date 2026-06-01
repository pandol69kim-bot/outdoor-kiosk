import { z } from 'zod'

const emptyStringToNull = (value: unknown) => {
  if (typeof value !== 'string') return value

  const trimmedValue = value.trim()
  return trimmedValue === '' ? null : trimmedValue
}

const customerFieldsSchema = z.object({
  customer_name: z.string().trim().min(2, '이름은 2자 이상 입력해주세요.'),
  customer_phone: z
    .string()
    .trim()
    .regex(/^01[0-9]-?\d{3,4}-?\d{4}$/, '올바른 전화번호를 입력해주세요. (예: 010-1234-5678)'),
  delivery_address: z.string().trim().min(5, '주소를 5자 이상 입력해주세요.'),
  delivery_memo: z
    .preprocess(emptyStringToNull, z.string().trim().nullable().optional())
    .transform((value) => value ?? null),
})

const orderItemSchema = z.object({
  product_id: z.string().uuid('상품 정보가 올바르지 않습니다.'),
  quantity: z.number().int().min(1, '수량은 1개 이상이어야 합니다.').max(99, '수량은 최대 99개까지 가능합니다.'),
})

export const createOrderInputSchema = customerFieldsSchema.extend(orderItemSchema.shape)

export const createBatchOrderInputSchema = customerFieldsSchema.extend({
  items: z.array(orderItemSchema).min(1, '장바구니가 비어 있습니다.'),
})

export type CreateBatchOrderInput = z.infer<typeof createBatchOrderInputSchema>
