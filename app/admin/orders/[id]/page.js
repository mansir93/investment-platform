import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import Link from "next/link"
import dbConnect from "@/lib/db"
import InvestmentOrder from "@/lib/models/InvestmentOrder"
import PaymentReceipt from "@/lib/models/PaymentReceipt"

export default async function AdminOrderDetails({ params }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "admin") {
    redirect("/")
  }

  const { id } = params

  await dbConnect()
  const order = await InvestmentOrder.findById(id)
    .populate("user", "name email")
    .populate("plan", "name description maturityPeriod minInterestRate maxInterestRate finalInterestRate")

  if (!order) {
    redirect("/admin/orders")
  }

  // Get payment receipts for this order
  const receipts = await PaymentReceipt.find({ investmentOrder: id })

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Order Details</h1>
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="orderId">
            Order ID:
          </label>
          <p className="text-gray-700 text-base">{order._id}</p>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="user">
            User:
          </label>
          <p className="text-gray-700 text-base">
            <Link href={`/admin/users/${order.user._id}`} className="text-blue-500 hover:underline">
              {order.user.name} ({order.user.email})
            </Link>
          </p>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="plan">
            Investment Plan:
          </label>
          <p className="text-gray-700 text-base">{order.plan.name}</p>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="amount">
            Amount:
          </label>
          <p className="text-gray-700 text-base">${order.amount}</p>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">
            Status:
          </label>
          <p className="text-gray-700 text-base">{order.status}</p>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="createdAt">
            Created At:
          </label>
          <p className="text-gray-700 text-base">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="paymentReceipts">
            Payment Receipts:
          </label>
          <ul className="list-disc pl-5">
            {receipts.map((receipt) => (
              <li key={receipt._id} className="text-gray-700 text-base">
                <Link
                  href={receipt.receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Receipt - {new Date(receipt.createdAt).toLocaleString()}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center justify-between">
          <Link
            href="/admin/orders"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    </div>
  )
}
