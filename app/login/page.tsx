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


export default function LoginPage() {
  return (
    <div className="min-h-screen px-4 py-8 flex flex-col items-center">
      <div className="flex flex-col gap-8 w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl">
        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>Log in to your account</CardTitle>
            <p className="text-gray-600">Don't have an account? Sign up for an account now.</p>
          </CardHeader>
          <CardContent>
            <form>
              <div className="grid gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="current-email">Email</Label>
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
            <Button className="font-bold">Log in →</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
