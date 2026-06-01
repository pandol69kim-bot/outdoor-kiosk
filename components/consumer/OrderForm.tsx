'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const schema = z.object({
  customer_name: z.string().min(2, '이름은 2자 이상 입력해주세요.'),
  customer_phone: z
    .string()
    .regex(/^01[0-9]-?\d{3,4}-?\d{4}$/, '올바른 전화번호를 입력해주세요. (예: 010-1234-5678)'),
  delivery_address: z.string().min(5, '주소를 5자 이상 입력해주세요.'),
  delivery_memo: z.string().optional(),
})

export type OrderFormValues = z.infer<typeof schema>

interface OrderFormProps {
  onSubmit: (values: OrderFormValues) => Promise<void>
  loading: boolean
  submitLabel?: string
}

export function OrderForm({ onSubmit, loading, submitLabel = '주문하기' }: OrderFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<OrderFormValues>({
    resolver: zodResolver(schema),
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <Input
        label="주문자 이름 *"
        placeholder="홍길동"
        {...register('customer_name')}
        error={errors.customer_name?.message}
      />
      <Input
        label="연락처 *"
        placeholder="010-1234-5678"
        type="tel"
        {...register('customer_phone')}
        error={errors.customer_phone?.message}
      />
      <Input
        label="배송지 주소 *"
        placeholder="서울특별시 강남구 테헤란로 123, 456호"
        {...register('delivery_address')}
        error={errors.delivery_address?.message}
      />
      <Textarea
        label="배송 메모 (선택)"
        placeholder="문 앞에 놓아주세요"
        rows={3}
        {...register('delivery_memo')}
        error={errors.delivery_memo?.message}
      />

      <Button type="submit" size="xl" loading={loading} className="w-full mt-2">
        {submitLabel}
      </Button>
    </form>
  )
}
