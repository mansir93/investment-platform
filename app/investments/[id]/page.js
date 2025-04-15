import { getServerSession } from "next-auth/next"
import { authOptions } from "../../api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import Link from "next/link"
import dbConnect from "@/lib/db"
import InvestmentOrder from "@/lib/models/InvestmentOrder"
import PaymentReceipt from "@/lib/models/PaymentReceipt"

export default async function InvestmentDetails({ params, searchParams }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin?callbackUrl=/investments")
  }

  const { id } = params
  const success = searchParams.success === "true"

  await dbConnect()
  const order = await InvestmentOrder.findById(id)
    .populate("user", "name email")
    .populate("plan", "name description maturityPeriod minInterestRate maxInterestRate finalInterestRate")

  if (!order) {
    redirect("/investments")
  }

  // Check if user is authorized to view this order
  if (session.user.role !== "admin" && order.user._id.toString() !== session.user.id) {
    redirect("/investments")
  }

  // Get payment receipts for this order
  const receipts = await PaymentReceipt.find({ order: id }).sort({ createdAt: -1 }).lean()

  return (
    <div>
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          Payment receipt uploaded successfully. Your investment is now awaiting approval.
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Investment Details</h1>
        <Link href="/investments" className="text-indigo-600 font-medium hover:text-indigo-800 transition-colors">
          Back to Investments
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-4">{order.plan.name}</h2>
        <p className="text-gray-600 mb-4">{order.plan.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Investment Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Amount:</span>
                <span className="font-medium">${order.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <span className="font-medium capitalize">{order.status.replace(/_/g, " ")}</span>
              </div>
              {order.startDate && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Start Date:</span>
                  <span className="font-medium">{new Date(order.startDate).toLocaleDateString()}</span>
                </div>
              )}
              {order.maturityDate && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Maturity Date:</span>
                  <span className="font-medium">{new Date(order.maturityDate).toLocaleDateString()}</span>
                </div>
              )}
              {order.finalInterestRate && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Final Interest Rate:</span>
                  <span className="font-medium">{order.finalInterestRate}%</span>
                </div>
              )}
              {order.finalAmount && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Final Amount:</span>
                  <span className="font-medium">${order.finalAmount}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Plan Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Maturity Period:</span>
                <span className="font-medium">{order.plan.maturityPeriod} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Interest Range:</span>
                <span className="font-medium">
                  {order.plan.minInterestRate}% - {order.plan.maxInterestRate}%
                </span>
              </div>
              {order.status === "pending_payment" && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment Deadline:</span>
                  <span className="font-medium">{new Date(order.paymentDeadline).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {order.status === "pending_payment" && (
          <div className="mt-4 pt-4 border-t">
            <Link
              href={`/investments/${order._id}/payment`}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Upload Payment Receipt
            </Link>
          </div>
        )}
      </div>

      {receipts.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Payment Receipts</h2>

          <div className="space-y-4">
            {receipts.map((receipt) => (
              <div key={receipt._id} className="border rounded-md p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">Status:</span>
                  <span
                    className={`font-medium ${
                      receipt.status === "approved"
                        ? "text-green-600"
                        : receipt.status === "rejected"
                          ? "text-red-600"
                          : "text-amber-600"
                    }`}
                  >
                    {receipt.status.charAt(0).toUpperCase() + receipt.status.slice(1)}
                  </span>
                </div>

                <div className="mb-4">
                  <img
                    src={receipt.receiptImage || "/placeholder.svg"}
                    alt="Payment Receipt"
                    className="max-h-48 rounded-md"
                  />
                </div>

                {receipt.notes && (
                  <div className="mb-2">
                    <span className="text-gray-500">Notes:</span>
                    <p className="text-gray-700">{receipt.notes}</p>
                  </div>
                )}

                {receipt.reviewNotes && (
                  <div className="mb-2">
                    <span className="text-gray-500">Admin Notes:</span>
                    <p className="text-gray-700">{receipt.reviewNotes}</p>
                  </div>
                )}

                <div className="text-sm text-gray-500">Uploaded on {new Date(receipt.createdAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
