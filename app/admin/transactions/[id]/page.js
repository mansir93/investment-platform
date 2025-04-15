import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import Link from "next/link"
import dbConnect from "@/lib/db"
import Transaction from "@/lib/models/Transaction"
import { formatCurrency } from "@/lib/utils"

export default async function TransactionDetail({ params }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "admin") {
    redirect("/")
  }

  await dbConnect()
  const transaction = await Transaction.findById(params.id)
    .populate("user", "name email accountBalance")
    .populate("processedBy", "name email")
    .populate("relatedInvestment")

  if (!transaction) {
    redirect("/admin/transactions")
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Transaction Details</h1>
        <Link href="/admin/transactions" className="text-indigo-600 hover:text-indigo-800">
          Back to Transactions
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Transaction Information</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="font-medium">{transaction._id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium capitalize">{transaction.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className={`font-medium ${transaction.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatCurrency(transaction.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span
                  className={`font-medium ${
                    transaction.status === "completed"
                      ? "text-green-600"
                      : transaction.status === "pending"
                        ? "text-amber-600"
                        : transaction.status === "rejected"
                          ? "text-red-600"
                          : "text-gray-600"
                  }`}
                >
                  {transaction.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{new Date(transaction.createdAt).toLocaleString()}</span>
              </div>
              {transaction.description && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Description:</span>
                  <span className="font-medium">{transaction.description}</span>
                </div>
              )}
              {transaction.reference && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Reference:</span>
                  <span className="font-medium">{transaction.reference}</span>
                </div>
              )}
              {transaction.rejectionReason && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Rejection Reason:</span>
                  <span className="font-medium">{transaction.rejectionReason}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">User Information</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{transaction.user.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{transaction.user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Account Balance:</span>
                <span className="font-medium">{formatCurrency(transaction.user.accountBalance)}</span>
              </div>
              {transaction.processedBy && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Processed By:</span>
                    <span className="font-medium">{transaction.processedBy.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Processed On:</span>
                    <span className="font-medium">{new Date(transaction.updatedAt).toLocaleString()}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {transaction.receiptImage && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Receipt Image</h2>
            <img
              src={transaction.receiptImage || "/placeholder.svg"}
              alt="Receipt"
              className="max-w-full h-auto max-h-96 rounded-md"
            />
          </div>
        )}

        {transaction.status === "pending" && (
          <div className="mt-6 flex space-x-4">
            <Link
              href={`/admin/transactions/${transaction._id}/approve`}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Approve Transaction
            </Link>
            <Link
              href={`/admin/transactions/${transaction._id}/reject`}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Reject Transaction
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
