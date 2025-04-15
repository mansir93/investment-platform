"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function DepositPage() {
  const router = useRouter()
  const [amount, setAmount] = useState("")
  const [reference, setReference] = useState("")
  const [receiptImage, setReceiptImage] = useState(null)
  const [previewUrl, setPreviewUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

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

    if (!amount || Number.parseFloat(amount) <= 0) {
      setError("Please enter a valid amount")
      setIsLoading(false)
      return
    }

    if (!receiptImage) {
      setError("Please upload a receipt image")
      setIsLoading(false)
      return
    }

    try {
      // First, upload the receipt image
      const formData = new FormData()
      formData.append("file", receiptImage)

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload receipt image")
      }

      const uploadData = await uploadResponse.json()
      const receiptImageUrl = uploadData.url

      // Then create the transaction
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "deposit",
          amount: Number.parseFloat(amount),
          reference,
          receiptImage: receiptImageUrl,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create deposit request")
      }

      router.push("/account?success=deposit")
    } catch (error) {
      console.error("Error creating deposit:", error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Deposit Funds</h1>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h2 className="text-lg font-semibold mb-4">Bank Transfer Details</h2>
        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Bank Name:</span>
            <span className="font-medium">Example Bank</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Account Name:</span>
            <span className="font-medium">Investment Platform Ltd</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Account Number:</span>
            <span className="font-medium">1234567890</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Sort Code:</span>
            <span className="font-medium">12-34-56</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Reference:</span>
            <span className="font-medium">Your Email Address</span>
          </div>
        </div>
        <p className="text-sm text-gray-500 italic">
          Please make your transfer and then upload the receipt below. Your deposit will be processed within 24 hours.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm">
        <div className="mb-4">
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Deposit Amount ($)
          </label>
          <input
            id="amount"
            type="number"
            min="1"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="reference" className="block text-sm font-medium text-gray-700 mb-1">
            Reference (Optional)
          </label>
          <input
            id="reference"
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          <p className="text-sm text-gray-500 mt-1">Reference number or transaction ID from your bank transfer</p>
        </div>

        <div className="mb-4">
          <label htmlFor="receiptImage" className="block text-sm font-medium text-gray-700 mb-1">
            Receipt Image
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

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? "Processing..." : "Submit Deposit"}
          </button>
          <Link
            href="/account"
            className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 text-center"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
