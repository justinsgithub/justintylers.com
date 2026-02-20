"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ContactForm() {
  const submitContact = useMutation(api.contacts.submit);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      await submitContact({
        name: data.get("name") as string,
        email: data.get("email") as string,
        company: (data.get("company") as string) || undefined,
        serviceType: data.get("serviceType") as string,
        message: data.get("message") as string,
      });

      // Also send email notification
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          company: data.get("company"),
          serviceType: data.get("serviceType"),
          message: data.get("message"),
        }),
      });

      setSubmitted(true);
    } catch {
      // Still show success if Convex saved but email failed
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-8 text-center">
        <h3 className="text-xl font-bold">Message sent!</h3>
        <p className="mt-2 text-muted-foreground">
          I&apos;ll get back to you within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required placeholder="Your name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@company.com"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="company">Company (optional)</Label>
        <Input id="company" name="company" placeholder="Your company" />
      </div>

      <div className="space-y-2">
        <Label>What do you need?</Label>
        <Select name="serviceType" required>
          <SelectTrigger>
            <SelectValue placeholder="Select a service" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="custom-software">Custom Business Software</SelectItem>
            <SelectItem value="ai-integration">AI Integration</SelectItem>
            <SelectItem value="web-application">Web Application</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Tell me about your project</Label>
        <Textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder="What are you trying to build? What problem are you solving?"
        />
      </div>

      <Button type="submit" size="lg" disabled={loading}>
        {loading ? "Sending..." : "Send message"}
      </Button>
    </form>
  );
}
