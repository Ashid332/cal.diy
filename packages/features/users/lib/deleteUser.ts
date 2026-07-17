import { deleteStripeCustomer } from "@calcom/app-store/stripepayment/lib/customer";
import type { User } from "@calcom/prisma/client";
import { UserRepository } from "@calcom/features/users/repositories/UserRepository";

export async function deleteUser(user: Pick<User, "id" | "email" | "metadata">) {
  // If 2FA is disabled or totpCode is valid then delete the user from stripe and database
  await deleteStripeCustomer(user).catch(console.warn);
  // Remove my account
  const userRepository = new UserRepository();
  await userRepository.delete({ id: user.id });
}
