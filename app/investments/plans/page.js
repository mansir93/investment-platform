import { getServerSession } from "next-auth/next"
import { authOptions } from "../../api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import Link from "next/link"
import dbConnect from "@/lib/db"
import InvestmentPlan from "@/lib/models/InvestmentPlan"

export default async function InvestmentPlans() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin?callbackUrl=/investments/plans")
  }

  await dbConnect()
  const plans = await InvestmentPlan.find({ isActive: true }).lean()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Investment Plans</h1>

      {plans.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-sm text-center">
          <p className="text-gray-600">No investment plans available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan._id} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold mb-2">{plan.name}</h2>
              <p className="text-gray-600 mb-4">{plan.description}</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Maturity Period:</span>
                  <span className="font-medium">{plan.maturityPeriod} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Interest Rate:</span>
                  <span className="font-medium">
                    {plan.minInterestRate}% - {plan.maxInterestRate}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Minimum Investment:</span>
                  <span className="font-medium">${plan.minInvestmentAmount}</span>
                </div>
              </div>
              <Link
                href={`/investments/new?planId=${plan._id}`}
                className="mt-6 block text-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Invest Now
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
