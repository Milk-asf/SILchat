"use client"

import { useChatContext } from "@/components/providers/chat-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  CreditCard,
  Check,
  Users,
  HardDrive,
  MessageSquare,
  Zap,
} from "lucide-react"

const PLANS = {
  free: {
    name: "Free",
    price: "$0",
    period: "forever",
    features: [
      { icon: Users, text: "Up to 10 members" },
      { icon: MessageSquare, text: "Unlimited messages" },
      { icon: HardDrive, text: "1 GB file storage" },
    ],
  },
  pro: {
    name: "Pro",
    price: "$10",
    period: "per member / month",
    features: [
      { icon: Users, text: "Unlimited members" },
      { icon: MessageSquare, text: "Unlimited messages" },
      { icon: HardDrive, text: "10 GB file storage" },
      { icon: Zap, text: "Priority support" },
    ],
  },
  enterprise: {
    name: "Enterprise",
    price: "Custom",
    period: "contact us",
    features: [
      { icon: Users, text: "Unlimited members" },
      { icon: MessageSquare, text: "Unlimited messages" },
      { icon: HardDrive, text: "Unlimited storage" },
      { icon: Zap, text: "Dedicated support" },
      { icon: CreditCard, text: "Custom billing" },
    ],
  },
}

export function BillingTab() {
  const { workspace } = useChatContext()
  const currentPlan = PLANS[workspace.billing_plan]

  return (
    <div className="space-y-8">
      {/* Current plan */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-medium text-gray-900">Current plan</h3>
          <p className="mt-1 text-xs text-gray-500">
            Manage your workspace subscription
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-lg font-semibold text-gray-900">
                  {currentPlan.name}
                </h4>
                <Badge variant="secondary" className="text-[10px]">
                  Current
                </Badge>
              </div>
              <p className="mt-0.5 text-sm text-gray-500">
                <span className="text-2xl font-bold text-gray-900">
                  {currentPlan.price}
                </span>
                {" "}
                <span className="text-xs">{currentPlan.period}</span>
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-2.5">
            {currentPlan.features.map((feature) => (
              <div
                key={feature.text}
                className="flex items-center gap-2.5 text-sm text-gray-600"
              >
                <Check className="h-3.5 w-3.5 text-green-500" />
                <span>{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upgrade options */}
      {workspace.billing_plan === "free" && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-900">
            Available upgrades
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {(["pro", "enterprise"] as const).map((planKey) => {
              const plan = PLANS[planKey]
              return (
                <div
                  key={planKey}
                  className="rounded-lg border border-gray-200 p-5 transition-colors hover:border-gray-300"
                >
                  <h4 className="text-sm font-semibold text-gray-900">
                    {plan.name}
                  </h4>
                  <p className="mt-0.5 text-xs text-gray-500">
                    <span className="text-lg font-bold text-gray-900">
                      {plan.price}
                    </span>
                    {" "}
                    {plan.period}
                  </p>
                  <div className="mt-4 space-y-2">
                    {plan.features.map((feature) => (
                      <div
                        key={feature.text}
                        className="flex items-center gap-2 text-xs text-gray-500"
                      >
                        <feature.icon className="h-3 w-3" />
                        <span>{feature.text}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 w-full text-xs"
                    onClick={() => {
                      // Placeholder for Stripe integration
                      window.open(
                        "mailto:support@silchat.com?subject=Upgrade to " +
                          plan.name,
                        "_blank"
                      )
                    }}
                  >
                    {planKey === "enterprise"
                      ? "Contact sales"
                      : "Upgrade to " + plan.name}
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Billing info note */}
      <div className="rounded-lg bg-gray-50 p-4">
        <div className="flex items-start gap-3">
          <CreditCard className="mt-0.5 h-4 w-4 text-gray-400" />
          <div>
            <p className="text-xs font-medium text-gray-700">
              Billing & payments
            </p>
            <p className="mt-0.5 text-xs text-gray-500">
              Payment processing is handled securely through Stripe. Contact
              your administrator to manage payment methods, view invoices, or
              update billing information.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
