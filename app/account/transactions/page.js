import { getServerSession } from "next-auth/next"
import { authOptions } from "../../api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import Link from "next/link"
import dbConnect from "@/lib/db"
import Transaction from "@/lib/models/Transaction"
import { formatCurrency } from "@/lib/utils"

export default async function TransactionsPage({ searchParams }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin?callbackUrl=/account/transactions")
  }

  const type = searchParams.type || ""
  const status = searchParams.status || ""

  await dbConnect()

  // Build query
  const query = { user: session.user.id }
  if (type) query.type = type
  if (status) query.status = status

  const transactions = await Transaction.find(query).sort({ createdAt: -1 }).populate("processedBy", "name").lean()

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Transaction History</h1>
        <Link href="/account" className="text-indigo-600 hover:text-indigo-800">
          Back to Account
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div className="flex flex-wrap gap-4 mb-6">
          <Link
            href="/account/transactions"
            className={`px-4 py-2 rounded-md ${
              !type && !status ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-800"
            }`}
          >
            All Transactions
          </Link>
          <Link
            href="/account/transactions?type=deposit"
            className={`px-4 py-2 rounded-md ${
              type === "deposit" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-800"
            }`}
          >
            Deposits
          </Link>
          <Link
            href="/account/transactions?type=withdrawal"
            className={`px-4 py-2 rounded-md ${
              type === "withdrawal" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-800"
            }`}
          >
            Withdrawals
          </Link>
          <Link
            href="/account/transactions?type=investment"
            className={`px-4 py-2 rounded-md ${
              type === "investment" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-800"
            }`}
          >
            Investments
          </Link>
          <Link
            href="/account/transactions?type=maturity"
            className={`px-4 py-2 rounded-md ${
              type === "maturity" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-800"
            }`}
          >
            Maturity Payouts
          </Link>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No transactions found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction._id.toString()}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(transaction.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{transaction.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={transaction.amount > 0 ? "text-green-600" : "text-red-600"}>
                        {formatCurrency(transaction.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          transaction.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : transaction.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : transaction.status === "rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{transaction.description || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
