import { getServerSession } from "next-auth/next"
import { authOptions } from "../api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import Link from "next/link"
import dbConnect from "@/lib/db"
import InvestmentOrder from "@/lib/models/InvestmentOrder"

export default async function Investments() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin?callbackUrl=/investments")
  }

  await dbConnect()
  const orders = await InvestmentOrder.find({ user: session.user.id })
    .populate("plan", "name maturityPeriod minInterestRate maxInterestRate finalInterestRate")
    .sort({ createdAt: -1 })
    .lean()

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Investments</h1>
        <Link
          href="/investments/plans"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
        >
          New Investment
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-sm text-center">
          <p className="text-gray-600 mb-4">You don't have any investments yet.</p>
          <Link
            href="/investments/plans"
            className="text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
          >
            Browse Investment Plans
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold mb-2">{order.plan.name}</h2>
                  <div className="space-y-1">
                    <p className="text-gray-600">
                      Amount: <span className="font-medium">${order.amount}</span>
                    </p>
                    <p className="text-gray-600">
                      Status: <span className="font-medium capitalize">{order.status.replace(/_/g, " ")}</span>
                    </p>
                    {order.startDate && (
                      <p className="text-gray-600">
                        Start Date:{" "}
                        <span className="font-medium">{new Date(order.startDate).toLocaleDateString()}</span>
                      </p>
                    )}
                    {order.maturityDate && (
                      <p className="text-gray-600">
                        Maturity Date:{" "}
                        <span className="font-medium">{new Date(order.maturityDate).toLocaleDateString()}</span>
                      </p>
                    )}
                    {order.finalInterestRate && (
                      <p className="text-gray-600">
                        Final Interest Rate: <span className="font-medium">{order.finalInterestRate}%</span>
                      </p>
                    )}
                    {order.finalAmount && (
                      <p className="text-gray-600">
                        Final Amount: <span className="font-medium">${order.finalAmount}</span>
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <Link
                    href={`/investments/${order._id}`}
                    className="text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>

              {order.status === "pending_payment" && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-amber-600 mb-2">
                    Payment required by: {new Date(order.paymentDeadline).toLocaleString()}
                  </p>
                  <Link
                    href={`/investments/${order._id}/payment`}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Upload Payment Receipt
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
