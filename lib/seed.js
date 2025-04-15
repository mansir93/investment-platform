import bcrypt from "bcryptjs"

/**
 * Seeds the database with a default admin user
 */
export async function seedDefaultAdmin() {
  try {
    // Import User model dynamically to avoid circular dependencies
    const User = (await import("./models/User")).default

    // Check if admin user already exists
    const adminExists = await User.findOne({ email: "admin@gmail.com" })

    if (adminExists) {
      console.log("Default admin user already exists")
      return
    }

    // Create admin user with specified password
    const defaultPassword = "Mansir12"
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(defaultPassword, salt)

    // Create admin user
    const admin = await User.create({
      name: "Admin User",
      email: "admin@gmail.com",
      password: hashedPassword,
      role: "admin",
      isGoogleAuthEnabled: false,
      isEmailVerified: true,
    })

    console.log("Default admin user created successfully")
    return admin
  } catch (error) {
    console.error("Error seeding default admin:", error)
  }
}
