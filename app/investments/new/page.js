"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

export default function NewInvestment() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planId = searchParams.get("planId")

  const [plan, setPlan] = useState(null)
  const [amount, setAmount] = useState("")
  const [useAccountBalance, setUseAccountBalance] = useState(false)
  const [accountBalance, setAccountBalance] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!planId) {
      router.push("/investments/plans")
      return
    }

    const fetchData = async () => {
      try {
        // Fetch plan details
        const planResponse = await fetch(`/api/investment-plans/${planId}`)

        if (!planResponse.ok) {
          throw new Error("Failed to fetch plan")
        }

        const planData = await planResponse.json()
        setPlan(planData)
        setAmount(planData.minInvestmentAmount)

        // Fetch user account balance
        const userResponse = await fetch("/api/users/me")

        if (userResponse.ok) {
          const userData = await userResponse.json()
          setAccountBalance(userData.accountBalance)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Failed to load investment plan. Please try again.")
      }
    }

    fetchData()
  }, [planId, router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Validate amount
      if (useAccountBalance && Number.parseFloat(amount) > accountBalance) {
        throw new Error("Insufficient account balance")
      }

      const response = await fetch("/api/investment-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId,
          amount: Number.parseFloat(amount),
          useAccountBalance,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create investment")
      }

      if (useAccountBalance) {
        router.push(`/investments/${data._id}?success=true`)
      } else {
        router.push(`/investments/${data._id}/payment`)
      }
    } catch (error) {
      console.error("Error creating investment:", error)
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
      <h1 className="text-2xl font-bold mb-6">New Investment</h1>

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
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm">
        <div className="mb-4">
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Investment Amount
          </label>
          <input
            id="amount"
            type="number"
            min={plan.minInvestmentAmount}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
          <p className="text-sm text-gray-500 mt-1">Minimum investment: ${plan.minInvestmentAmount}</p>
        </div>

        <div className="mb-6">
          <div className="flex items-center">
            <input
              id="useAccountBalance"
              type="checkbox"
              checked={useAccountBalance}
              onChange={(e) => setUseAccountBalance(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              disabled={accountBalance < Number.parseFloat(amount)}
            />
            <label htmlFor="useAccountBalance" className="ml-2 block text-sm text-gray-700">
              Use account balance for this investment
            </label>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Your current balance: ${accountBalance.toFixed(2)}
            {accountBalance < Number.parseFloat(amount) && (
              <span className="text-red-500 ml-2">Insufficient balance</span>
            )}
          </p>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? "Processing..." : "Invest Now"}
          </button>
          <Link
            href="/investments/plans"
            className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 text-center"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
