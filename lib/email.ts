import { Resend } from 'resend'
import type { Order, Wholesaler } from './types'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendOrderNotification(order: Order, wholesaler: Wholesaler) {
  if (!wholesaler.email) {
    throw new Error('도매처 이메일 주소가 없습니다.')
  }

  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: [wholesaler.email],
    subject: `[주문 알림] ${order.order_number} - ${order.product_name}`,
    html: buildEmailHtml(order, wholesaler),
  })

  if (error) throw new Error(error.message)
}

function buildEmailHtml(order: Order, wholesaler: Wholesaler): string {
  return `
<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"></head>
<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #1a1a1a; border-bottom: 2px solid #4f46e5; padding-bottom: 10px;">
    📦 새로운 주문이 도착했습니다
  </h2>

  <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
    <tr style="background: #f8f8f8;">
      <th style="padding: 10px; text-align: left; border: 1px solid #ddd; width: 30%;">항목</th>
      <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">내용</th>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">주문번호</td>
      <td style="padding: 10px; border: 1px solid #ddd;">${order.order_number}</td>
    </tr>
    <tr style="background: #f8f8f8;">
      <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">상품명</td>
      <td style="padding: 10px; border: 1px solid #ddd;">${order.product_name}</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">수량</td>
      <td style="padding: 10px; border: 1px solid #ddd;">${order.quantity}개</td>
    </tr>
    <tr style="background: #f8f8f8;">
      <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">판매금액</td>
      <td style="padding: 10px; border: 1px solid #ddd; color: #4f46e5; font-weight: bold;">
        ${order.total_price.toLocaleString()}원
      </td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">고객명</td>
      <td style="padding: 10px; border: 1px solid #ddd;">${order.customer_name}</td>
    </tr>
    <tr style="background: #f8f8f8;">
      <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">연락처</td>
      <td style="padding: 10px; border: 1px solid #ddd;">${order.customer_phone}</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">배송지</td>
      <td style="padding: 10px; border: 1px solid #ddd;">${order.delivery_address}</td>
    </tr>
    ${order.delivery_memo ? `
    <tr style="background: #f8f8f8;">
      <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">배송 메모</td>
      <td style="padding: 10px; border: 1px solid #ddd;">${order.delivery_memo}</td>
    </tr>
    ` : ''}
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">주문 시각</td>
      <td style="padding: 10px; border: 1px solid #ddd;">
        ${new Date(order.created_at).toLocaleString('ko-KR')}
      </td>
    </tr>
  </table>

  <p style="color: #666; font-size: 14px; margin-top: 20px;">
    빠른 배송 처리 부탁드립니다. 감사합니다.
  </p>
</body>
</html>
  `.trim()
}
