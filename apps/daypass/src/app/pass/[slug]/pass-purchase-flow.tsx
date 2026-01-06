"use client";

import { useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
} from "@repo/ui";

interface PassType {
  id: string;
  name: string;
  description: string;
  price_cents: number;
  duration_hours: number;
}

interface PassPurchaseFlowProps {
  siteName: string;
  orgName: string;
  passTypes: PassType[];
  slug: string;
}

type Step = "select" | "details" | "payment" | "success";

export function PassPurchaseFlow({
  siteName,
  orgName: _orgName,
  passTypes,
  slug: _slug,
}: PassPurchaseFlowProps) {
  const [step, setStep] = useState<Step>("select");
  const [selectedPass, setSelectedPass] = useState<PassType | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(cents / 100);
  };

  if (step === "select") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{siteName}</CardTitle>
          <CardDescription>Select a pass type</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {passTypes.map((pass) => (
            <button
              key={pass.id}
              onClick={() => {
                setSelectedPass(pass);
                setStep("details");
              }}
              className="w-full p-4 border rounded-lg text-left hover:border-primary hover:bg-accent transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{pass.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {pass.description}
                  </p>
                </div>
                <p className="font-semibold">{formatPrice(pass.price_cents)}</p>
              </div>
            </button>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (step === "details" && selectedPass) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Details</CardTitle>
          <CardDescription>
            {selectedPass.name} - {formatPrice(selectedPass.price_cents)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
            />
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button variant="outline" onClick={() => setStep("select")}>
            Back
          </Button>
          <Button
            className="flex-1"
            onClick={() => setStep("payment")}
            disabled={!name || !email}
          >
            Continue to Payment
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (step === "payment" && selectedPass) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment</CardTitle>
          <CardDescription>
            {selectedPass.name} - {formatPrice(selectedPass.price_cents)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Stripe payment integration will be added here.
          </p>
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm">
              <strong>Name:</strong> {name}
            </p>
            <p className="text-sm">
              <strong>Email:</strong> {email}
            </p>
            <p className="text-sm">
              <strong>Pass:</strong> {selectedPass.name}
            </p>
            <p className="text-sm">
              <strong>Total:</strong> {formatPrice(selectedPass.price_cents)}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button variant="outline" onClick={() => setStep("details")}>
            Back
          </Button>
          <Button className="flex-1" onClick={() => setStep("success")}>
            Pay Now (Demo)
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (step === "success") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pass Issued!</CardTitle>
          <CardDescription>Your pass is ready to use</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-6 bg-primary text-primary-foreground rounded-lg text-center">
            <p className="text-xs uppercase tracking-wide opacity-80">
              Pass Code
            </p>
            <p className="text-2xl font-mono font-bold mt-1">DEMO-XXXX-XXXX</p>
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              <strong>Site:</strong> {siteName}
            </p>
            <p>
              <strong>Valid for:</strong> {selectedPass?.duration_hours} hours
            </p>
            <p>
              <strong>Email:</strong> {email}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            A confirmation email has been sent to {email}.
          </p>
        </CardContent>
      </Card>
    );
  }

  return null;
}
