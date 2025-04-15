import Link from "next/link"
import { getServerSession } from "next-auth/next"
import { authOptions } from "./api/auth/[...nextauth]/route"
import TestTailwind from "@/components/TestTailwind"

export default async function Home() {
  let session
  let plans = []

  try {
    session = await getServerSession(authOptions)

    // Import these inside the try block to prevent server errors if DB connection fails
    const dbConnect = (await import("@/lib/db")).default
    const InvestmentPlan = (await import("@/lib/models/InvestmentPlan")).default

    await dbConnect()
    plans = await InvestmentPlan.find({ isActive: true }).limit(3).lean()
  } catch (error) {
    console.error("Error loading home page data:", error)
    // Continue rendering with empty plans array
  }

  return (
    <div className="space-y-10">
      {/* Add the test component at the top */}
      <TestTailwind />

      <section className="text-center py-10">
        <h1 className="text-4xl font-bold mb-4">Welcome to Our Investment Platform</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Grow your wealth with our carefully curated investment plans. Start your investment journey today.
        </p>
        {!session && (
          <div className="mt-8">
            <Link
              href="/auth/signin"
              className="bg-indigo-600 text-white px-6 py-3 rounded-md font-medium hover:bg-indigo-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Featured Investment Plans</h2>
        {plans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan._id.toString()}
                className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
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
                  {session ? (
                    <Link
                      href={`/investments/new?planId=${plan._id}`}
                      className="mt-6 block text-center bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700 transition-colors"
                    >
                      Invest Now
                    </Link>
                  ) : (
                    <Link
                      href="/auth/signin"
                      className="mt-6 block text-center bg-gray-200 text-gray-800 px-4 py-2 rounded-md font-medium hover:bg-gray-300 transition-colors"
                    >
                      Sign In to Invest
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <p className="text-gray-600">No investment plans available at the moment.</p>
            {session?.user.role === "admin" && (
              <Link
                href="/admin/plans/new"
                className="mt-4 inline-block text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
              >
                Create your first investment plan
              </Link>
            )}
          </div>
        )}
      </section>

      <section className="bg-gray-50 p-8 rounded-lg">
        <h2 className="text-2xl font-bold mb-6">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-indigo-100 text-indigo-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              1
            </div>
            <h3 className="text-lg font-semibold mb-2">Choose a Plan</h3>
            <p className="text-gray-600">
              Browse our investment plans and select one that matches your financial goals.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-indigo-100 text-indigo-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              2
            </div>
            <h3 className="text-lg font-semibold mb-2">Make Payment</h3>
            <p className="text-gray-600">Complete your investment by making a payment and uploading the receipt.</p>
          </div>
          <div className="text-center">
            <div className="bg-indigo-100 text-indigo-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              3
            </div>
            <h3 className="text-lg font-semibold mb-2">Watch It Grow</h3>
            <p className="text-gray-600">Once approved, your investment starts growing until it reaches maturity.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
