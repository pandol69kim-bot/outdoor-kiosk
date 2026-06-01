'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { Wholesaler } from '@/lib/types'

const schema = z.object({
  name: z.string().min(1, '업체명을 입력해주세요.'),
  contact: z.string().optional(),
  phone: z.string().optional(),
  email: z.union([z.string().email('올바른 이메일을 입력해주세요.'), z.literal('')]).optional(),
  notify_type: z.enum(['email', 'manual']),
  memo: z.string().optional(),
})

export type WholesalerFormValues = z.infer<typeof schema>

interface WholesalerFormProps {
  defaultValues?: Partial<Wholesaler>
  onSubmit: (values: WholesalerFormValues) => Promise<void>
  loading: boolean
}

export function WholesalerForm({ defaultValues, onSubmit, loading }: WholesalerFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<WholesalerFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name || '',
      contact: defaultValues?.contact || '',
      phone: defaultValues?.phone || '',
      email: defaultValues?.email || '',
      notify_type: defaultValues?.notify_type || 'email',
      memo: defaultValues?.memo || '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <Input
        label="업체명 *"
        placeholder="신선마트 주식회사"
        {...register('name')}
        error={errors.name?.message}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="담당자명"
          placeholder="홍길동"
          {...register('contact')}
          error={errors.contact?.message}
        />
        <Input
          label="연락처"
          placeholder="02-1234-5678"
          type="tel"
          {...register('phone')}
          error={errors.phone?.message}
        />
      </div>

      <Input
        label="이메일"
        placeholder="order@example.com"
        type="email"
        {...register('email')}
        error={errors.email?.message}
      />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">주문 전달 방식</label>
        <select
          {...register('notify_type')}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="email">이메일 자동 발송</option>
          <option value="manual">관리자 수동 전달</option>
        </select>
      </div>

      <Textarea
        label="메모"
        placeholder="특이사항이나 주의사항을 입력해주세요."
        rows={3}
        {...register('memo')}
      />

      <Button type="submit" size="lg" loading={loading} className="w-full mt-2">
        {defaultValues?.id ? '저장하기' : '등록하기'}
      </Button>
    </form>
  )
}
