import bcrypt from "bcryptjs"
import { toUserResponse } from "../dto/auth.dto"
import { HTTPException } from "../errors/http.error"
import { userRepository } from "../repositories/user.repository"
import type { LoginInput, RegisterInput } from "../schemas/auth.schema"
import type { AuthResponse, UserResponse } from "../types/auth.types"
import { generateToken } from "../utils/jwt"

export class AuthService {
  async register(input: RegisterInput): Promise<AuthResponse> {
    const existingUser = await userRepository.findByEmail(input.email)
    if (existingUser) {
      throw new HTTPException(409, "Email is already registered")
    }

    const passwordHash = await bcrypt.hash(input.password, 10)
    const user = await userRepository.createUserWithCompany(input, passwordHash)

    const token = await generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      department: user.department,
      companyId: user.company_id,
    })

    return {
      user: toUserResponse(user),
      token,
    }
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    const user = await userRepository.findByEmail(input.email)
    if (!user) {
      throw new HTTPException(401, "Invalid email or password")
    }

    const isValidPassword = await bcrypt.compare(input.password, user.password_hash)
    if (!isValidPassword) {
      throw new HTTPException(401, "Invalid email or password")
    }

    const token = await generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      department: user.department,
      companyId: user.company_id,
    })

    return {
      user: toUserResponse(user),
      token,
    }
  }

  async getMe(userId: string): Promise<UserResponse> {
    const user = await userRepository.findById(userId)
    if (!user) {
      throw new HTTPException(404, "User not found")
    }

    return toUserResponse(user)
  }
}

export const authService = new AuthService()
