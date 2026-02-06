import { getWorkspace } from "@/lib/workspace"
import { SignupForm } from "./signup-form"

export default async function SignupPage() {
  const workspace = await getWorkspace()
  return <SignupForm workspace={workspace} />
}
