'use client'
import { useEffect, useState } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ImageUpload } from '@/components/ui/ImageUpload'
import type { Product, Wholesaler } from '@/lib/types'

const schema = z.object({
  name: z.string().min(1, '상품명을 입력해주세요.'),
  description: z.string().optional(),
  price: z.number().positive('0보다 큰 금액을 입력해주세요.'),
  wholesale_price: z.number().optional().nullable(),
  wholesaler_id: z.string().optional().nullable(),
  is_active: z.boolean(),
  sort_order: z.number().int(),
})

type ProductFormValues = z.infer<typeof schema>
export type ProductSubmitValues = ProductFormValues & { image_url: string | null }

interface ProductFormProps {
  defaultValues?: Partial<Product>
  onSubmit: (values: ProductSubmitValues) => Promise<void>
  loading: boolean
}

export function ProductForm({ defaultValues, onSubmit, loading }: ProductFormProps) {
  const [wholesalers, setWholesalers] = useState<Wholesaler[]>([])
  const [imageUrl, setImageUrl] = useState<string | null>(defaultValues?.image_url || null)

  const { register, handleSubmit, formState: { errors } } = useForm<ProductFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name || '',
      description: defaultValues?.description || '',
      price: defaultValues?.price ?? ('' as unknown as number),
      wholesale_price: defaultValues?.wholesale_price ?? null,
      wholesaler_id: defaultValues?.wholesaler_id || null,
      is_active: defaultValues?.is_active ?? true,
      sort_order: defaultValues?.sort_order ?? 0,
    },
  })

  useEffect(() => {
    fetch('/api/wholesalers').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setWholesalers(data)
    })
  }, [])

  const handleFormSubmit: SubmitHandler<ProductFormValues> = (values) => {
    return onSubmit({ ...values, image_url: imageUrl })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-5">
      <ImageUpload value={imageUrl} onChange={setImageUrl} />

      <Input
        label="상품명 *"
        placeholder="맛있는 사과"
        {...register('name')}
        error={errors.name?.message}
      />

      <Textarea
        label="상품 설명"
        placeholder="상품에 대한 간단한 설명을 입력해주세요."
        rows={3}
        {...register('description')}
        error={errors.description?.message}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="판매가 (원) *"
          type="number"
          placeholder="10000"
          {...register('price', { valueAsNumber: true })}
          error={errors.price?.message}
        />
        <Input
          label="도매 원가 (원)"
          type="number"
          placeholder="7000"
          {...register('wholesale_price', { valueAsNumber: true })}
          error={errors.wholesale_price?.message}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">연결 도매처</label>
        <select
          {...register('wholesaler_id')}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="">도매처 선택 (선택사항)</option>
          {wholesalers.map(w => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="정렬 순서"
          type="number"
          placeholder="0"
          {...register('sort_order', { valueAsNumber: true })}
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">노출 여부</label>
          <select
            {...register('is_active', { setValueAs: (v: string) => v === 'true' })}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="true">노출</option>
            <option value="false">숨김</option>
          </select>
        </div>
      </div>

      <Button type="submit" size="lg" loading={loading} className="w-full mt-2">
        {defaultValues?.id ? '저장하기' : '등록하기'}
      </Button>
    </form>
  )
}
