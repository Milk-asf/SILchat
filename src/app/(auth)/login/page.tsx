import { getWorkspace } from "@/lib/workspace"
import { LoginForm } from "./login-form"

export default async function LoginPage() {
  const workspace = await getWorkspace()
  return <LoginForm workspace={workspace} />
}
