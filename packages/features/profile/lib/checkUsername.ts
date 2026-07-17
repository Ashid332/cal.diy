import { IS_PREMIUM_USERNAME_ENABLED } from "@calcom/lib/constants";
import { usernameCheck as checkPremiumUsername } from "@calcom/lib/server/username";

import { checkRegularUsername } from "./checkRegularUsername";


export const checkUsername = !IS_PREMIUM_USERNAME_ENABLED ? checkRegularUsername : checkPremiumUsername;
