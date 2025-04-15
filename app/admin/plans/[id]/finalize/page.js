"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function FinalizePlan({ params }) {
  const router = useRouter()
  const { id } = params

  const [plan, setPlan] = useState(null)
  const [finalInterestRate, setFinalInterestRate] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await fetch(`/api/investment-plans/${id}`)

        if (!response.ok) {
          throw new Error("Failed to fetch plan")
        }

        const data = await response.json()
        setPlan(data)

        if (data.finalInterestRate !== null) {
          setFinalInterestRate(data.finalInterestRate.toString())
        } else {
          setFinalInterestRate(data.minInterestRate.toString())
        }
      } catch (error) {
        console.error("Error fetching plan:", error)
        setError("Failed to load plan data. Please try again.")
      }
    }

    fetchPlan()
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/investment-plans/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          finalInterestRate: Number.parseFloat(finalInterestRate),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to finalize plan")
      }

      router.push("/admin/plans")
    } catch (error) {
      console.error("Error finalizing plan:", error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!plan) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Finalize Investment Plan</h1>
        <Link href="/admin/plans" className="text-indigo-600 font-medium hover:text-indigo-800 transition-colors">
          Back to Plans
        </Link>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-4">{plan.name}</h2>
        <p className="text-gray-600 mb-4">{plan.description}</p>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-500">Maturity Period:</span>
            <span className="font-medium">{plan.maturityPeriod} days</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Interest Range:</span>
            <span className="font-medium">
              {plan.minInterestRate}% - {plan.maxInterestRate}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Minimum Investment:</span>
            <span className="font-medium">${plan.minInvestmentAmount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Status:</span>
            <span className={`font-medium ${plan.isActive ? "text-green-600" : "text-red-600"}`}>
              {plan.isActive ? "Active" : "Inactive"}
            </span>
          </div>
          {plan.finalInterestRate !== null && (
            <div className="flex justify-between">
              <span className="text-gray-500">Current Final Interest Rate:</span>
              <span className="font-medium">{plan.finalInterestRate}%</span>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm">
        <div className="mb-6">
          <label htmlFor="finalInterestRate" className="block text-sm font-medium text-gray-700 mb-1">
            Final Interest Rate (%)
          </label>
          <input
            id="finalInterestRate"
            type="number"
            min={plan.minInterestRate}
            max={plan.maxInterestRate}
            step="0.01"
            value={finalInterestRate}
            onChange={(e) => setFinalInterestRate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Must be between {plan.minInterestRate}% and {plan.maxInterestRate}%
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-4 rounded-md mb-6">
          <h3 className="text-amber-800 font-medium mb-2">Important Notice</h3>
          <p className="text-amber-700 text-sm">
            Setting the final interest rate will mark all active investments in this plan as matured. This action cannot
            be undone. Investors will be notified automatically.
          </p>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? "Finalizing..." : "Finalize Plan"}
          </button>
          <Link
            href="/admin/plans"
            className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 text-center"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
