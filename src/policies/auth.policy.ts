import { HTTPException } from "../errors/http.error"
import type { JWTPayload } from "../types/auth.types"

export class AuthPolicy {
  validateTenantAccess(user: JWTPayload, targetCompanyId: string): void {
    if (user.companyId !== targetCompanyId) {
      throw new HTTPException(403, "Tenant access violation: Cross-company access denied")
    }
  }
}

export const authPolicy = new AuthPolicy()
