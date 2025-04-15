// "use client"

// import { useState } from "react"
// import { useRouter } from "next/navigation"
// import Link from "next/link"

// export default function NewUser() {
//   const router = useRouter()

//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     password: "",
//     role: "user",
//     isGoogleAuthEnabled: false,
//   })
//   const [isLoading, setIsLoading] = useState(false)
//   const [error, setError] = useState("")

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target
//     setFormData({
//       ...formData,
//       [name]: type === "checkbox" ? checked : value,
//     })
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setIsLoading(true)
//     setError("")

//     try {
//       const response = await fetch("/api/users", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(formData),
//       })

//       const data = await response.json()

//       if (!response.ok) {
//         throw new Error(data.error || "Failed to create user")
//       }

//       router.push("/admin/users")
//     } catch (error) {
//       console.error("Error creating user:", error)
//       setError(error.message)
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   return (
//     <div className="max-w-md mx-auto">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold">Add New User</h1>
//         <Link href="/admin/users" className="text-indigo-600 font-medium hover:text-indigo-800 transition-colors">
//           Back to Users
//         </Link>
//       </div>

//       {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

//       <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm">
//         <div className="mb-4">
//           <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
//             Name
//           </label>
//           <input
//             id="name"
//             name="name"
//             type="text"
//             value={formData.name}
//             onChange={handleChange}
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//             required
//           />
//         </div>

//         <div className="mb-4">
//           <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
//             Email
//           </label>
//           <input
//             id="email"
//             name="email"
//             type="email"
//             value={formData.email}
//             onChange={handleChange}
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//             required
//           />
//         </div>

//         <div className="mb-4">
//           <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
//             Password
//           </label>
//           <input
//             id="password"
//             name="password"
//             type="password"
//             value={formData.password}
//             onChange={handleChange}
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//             required
//           />
//         </div>

//         <div className="mb-4">
//           <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
//             Role
//           </label>
//           <select
//             id="role"
//             name="role"
//             value={formData.role}
//             onChange={handleChange}
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//           >
//             <option value="user">User</option>
//             <option value="admin">Admin</option>
//           </select>
//         </div>

//         <div className="mb-4">
//           <div className="flex items-center">
//             <input
//               id="isGoogleAuthEnabled"
//               name="isGoogleAuthEnabled"
//               type="checkbox"
//               checked={formData.isGoogleAuthEnabled}
//               onChange={handleChange}
//               className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
//             />
//             <label htmlFor="isGoogleAuthEnabled" className="ml-2 block text-sm text-gray-700">
//               Enable Google Authentication
//             </label>
//           </div>
//         </div>

//         <div className="flex space-x-4">
//           <button
//             type="submit"
//             disabled={isLoading}
//             className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
//           >
//             {isLoading ? "Creating..." : "Create User"}
//           </button>
//           <Link
//             href="/admin/users"
//             className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 text-center"
//           >
//             Cancel
//           </Link>
//         </div>
//       </form>
//     </div>
//   )
// }

import React from 'react'

const page = () => {
  return (
    <div>
      
    </div>
  )
}

export default page
