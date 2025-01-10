import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"


export default function SettingsPage() {
  return (
    <div className="min-h-screen px-4 py-8 flex flex-col items-center">
      {/* Header Section */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold">Account Settings</h1>
        <p className="text-gray-600">Manage your account email address and password settings</p>
      </div>

      {/* Cards Section */}
      <div className="flex flex-col gap-8 w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl">
        {/* Change Email Card */}
        <Card>
          <CardHeader>
            <CardTitle>Change Email</CardTitle>
          </CardHeader>
          <CardContent>
            <form>
              <div className="grid gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="current-email">Current Email</Label>
                  <Input id="current-email"/>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="email-password">Password</Label>
                  <Input id="email-password" type="password"/>
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button>Update Email</Button>
          </CardFooter>
        </Card>

        {/* Change Password Card */}
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form>
              <div className="grid gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password"/>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password"/>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password"/>
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button>Update Password</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

