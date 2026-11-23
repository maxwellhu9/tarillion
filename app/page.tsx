/**
 * Route for the home page (`/`).
 *
 * This is a Server Component. It runs only on the server, where it loads the
 * currently signed in user. If the user is not logged in, they are redirected
 * to the login page. Otherwise, the interactive home page (`home-page.tsx`)
 * is rendered with the user passed in as a prop.
 *
 * @author Ajay Gandecha <agandecha@unc.edu>
 * @license MIT
 * @see https://comp426-25f.github.io/
 */

import HomePage from "./home-page";
import { requireUser } from "@/utils/supabase/auth";

export default async function Page() {
  const user = await requireUser();
  return <HomePage user={user} />;
}
