'use client'
import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { useUser } from "@/context/UserContext";

export default function LoginPage() {
  const { setCurrentUser } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null); // Clear previous errors
    console.log(email)
    console.log(password)

    try {
      const response = await axios.post("https://api.firmsnap.com/users/log_in", {
        user: { email, password },
      });

      const { token, user } = response.data;

      localStorage.setItem("authToken", token);
      setCurrentUser(user);

      const expirationDays = 7;
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + expirationDays);
      document.cookie = `authToken=${token}; expires=${expirationDate.toUTCString()}; path=/; Secure; SameSite=Strict`;

      window.location.href = "/";
    } catch (err) {
      if (err instanceof Error) {
        console.error("Login failed:", err.message);
      }
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 flex flex-col items-center">
      <div className="flex flex-col gap-8 w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl">
        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>Log in to your account</CardTitle>
            <p className="text-gray-600">
              Don&#39;t have an account? Sign up for an account now.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="grid gap-4">
                {error && <p className="text-red-500">{error}</p>}
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="current-email">Email</Label>
                  <Input
                    id="current-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="email-password">Password</Label>
                  <Input
                    id="email-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
              <CardFooter className="flex justify-end">
                <Button type="submit" className="font-bold">
                  Log in →
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
