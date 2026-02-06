"use client"

import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MembersTab } from "./members-tab"
import { WorkspaceTab } from "./workspace-tab"
import { BillingTab } from "./billing-tab"
import { ArrowLeft, Users, Paintbrush, CreditCard } from "lucide-react"

export function SettingsContent() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex h-14 items-center gap-3 border-b border-gray-200 px-6">
        <Link
          href="/chat"
          className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          aria-label="Back to chat"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-sm font-semibold text-gray-900">Settings</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-6 py-8">
          <Tabs defaultValue="members" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-gray-100/80">
              <TabsTrigger
                value="members"
                className="flex items-center gap-2 text-xs"
              >
                <Users className="h-3.5 w-3.5" />
                Members
              </TabsTrigger>
              <TabsTrigger
                value="workspace"
                className="flex items-center gap-2 text-xs"
              >
                <Paintbrush className="h-3.5 w-3.5" />
                Workspace
              </TabsTrigger>
              <TabsTrigger
                value="billing"
                className="flex items-center gap-2 text-xs"
              >
                <CreditCard className="h-3.5 w-3.5" />
                Billing
              </TabsTrigger>
            </TabsList>

            <TabsContent value="members">
              <MembersTab />
            </TabsContent>

            <TabsContent value="workspace">
              <WorkspaceTab />
            </TabsContent>

            <TabsContent value="billing">
              <BillingTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
