import { CartClient } from './CartClient'

export const revalidate = 3600

export default function CartPage() {
  return <CartClient />
}
