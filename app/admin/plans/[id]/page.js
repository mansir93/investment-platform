"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function EditPlan({ params }) {
  const router = useRouter()
  const { id } = params

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    maturityPeriod: 30,
    minInterestRate: 5,
    maxInterestRate: 10,
    minInvestmentAmount: 100,
    isActive: true,
  })
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
        setFormData({
          name: data.name,
          description: data.description,
          maturityPeriod: data.maturityPeriod,
          minInterestRate: data.minInterestRate,
          maxInterestRate: data.maxInterestRate,
          minInvestmentAmount: data.minInvestmentAmount,
          isActive: data.isActive,
        })
      } catch (error) {
        console.error("Error fetching plan:", error)
        setError("Failed to load plan data. Please try again.")
      }
    }

    fetchPlan()
  }, [id])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : type === "number" ? Number.parseFloat(value) : value,
    })
  }

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
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update plan")
      }

      router.push("/admin/plans")
    } catch (error) {
      console.error("Error updating plan:", error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Investment Plan</h1>
        <Link href="/admin/plans" className="text-indigo-600 font-medium hover:text-indigo-800 transition-colors">
          Back to Plans
        </Link>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm">
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Plan Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          ></textarea>
        </div>

        <div className="mb-4">
          <label htmlFor="maturityPeriod" className="block text-sm font-medium text-gray-700 mb-1">
            Maturity Period (days)
          </label>
          <input
            id="maturityPeriod"
            name="maturityPeriod"
            type="number"
            min="1"
            value={formData.maturityPeriod}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="minInterestRate" className="block text-sm font-medium text-gray-700 mb-1">
              Min Interest Rate (%)
            </label>
            <input
              id="minInterestRate"
              name="minInterestRate"
              type="number"
              min="0"
              step="0.01"
              value={formData.minInterestRate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="maxInterestRate" className="block text-sm font-medium text-gray-700 mb-1">
              Max Interest Rate (%)
            </label>
            <input
              id="maxInterestRate"
              name="maxInterestRate"
              type="number"
              min="0"
              step="0.01"
              value={formData.maxInterestRate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="minInvestmentAmount" className="block text-sm font-medium text-gray-700 mb-1">
            Minimum Investment Amount ($)
          </label>
          <input
            id="minInvestmentAmount"
            name="minInvestmentAmount"
            type="number"
            min="0"
            step="0.01"
            value={formData.minInvestmentAmount}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        <div className="mb-4">
          <div className="flex items-center">
            <input
              id="isActive"
              name="isActive"
              type="checkbox"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
              Active
            </label>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? "Updating..." : "Update Plan"}
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
