"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function PaymentPage({ params }) {
  const router = useRouter()
  const { id } = params

  const [order, setOrder] = useState(null)
  const [receiptImage, setReceiptImage] = useState(null)
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [previewUrl, setPreviewUrl] = useState("")

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/investment-orders/${id}`)

        if (!response.ok) {
          throw new Error("Failed to fetch order")
        }

        const data = await response.json()

        // Redirect if order is not in pending_payment status
        if (data.status !== "pending_payment") {
          router.push(`/investments/${id}`)
          return
        }

        setOrder(data)
      } catch (error) {
        console.error("Error fetching order:", error)
        setError("Failed to load investment order. Please try again.")
      }
    }

    fetchOrder()
  }, [id, router])

  const handleImageChange = (e) => {
    const file = e.target.files[0]

    if (file) {
      setReceiptImage(file)

      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!receiptImage) {
      setError("Please upload a receipt image")
      setIsLoading(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append("orderId", id)
      formData.append("receiptImage", receiptImage)
      formData.append("notes", notes)

      const response = await fetch("/api/payment-receipts", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload payment receipt")
      }

      router.push(`/investments/${id}?success=true`)
    } catch (error) {
      console.error("Error uploading receipt:", error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!order) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Upload Payment Receipt</h1>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-4">{order.plan.name}</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-500">Investment Amount:</span>
            <span className="font-medium">${order.amount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Payment Deadline:</span>
            <span className="font-medium">{new Date(order.paymentDeadline).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm">
        <div className="mb-4">
          <label htmlFor="receiptImage" className="block text-sm font-medium text-gray-700 mb-1">
            Payment Receipt
          </label>
          <input
            id="receiptImage"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
          <p className="text-sm text-gray-500 mt-1">Upload a screenshot or photo of your payment receipt</p>
        </div>

        {previewUrl && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-1">Preview:</p>
            <img src={previewUrl || "/placeholder.svg"} alt="Receipt preview" className="max-h-48 rounded-md" />
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            rows="3"
          ></textarea>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? "Uploading..." : "Submit Payment"}
          </button>
          <Link
            href={`/investments/${id}`}
            className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 text-center"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
