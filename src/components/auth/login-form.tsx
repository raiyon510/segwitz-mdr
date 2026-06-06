"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar, Gavel } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { SegwitzLogo } from "@/components/brand/segwitz-logo";

const features = [
  {
    icon: Calendar,
    title: "Structured meetings",
    description: "Agendas, notes, and outcomes in a consistent flow.",
  },
  {
    icon: Gavel,
    title: "Traceable decisions",
    description: "Link decisions to meetings and owners without losing context.",
  },
];

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    const result = await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      toast.error("Invalid email or password");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[38%_1fr]">
      {/* Left brand panel — matches reference screenshot */}
      <aside className="relative hidden min-h-screen flex-col bg-[#073b4c] lg:flex">
        <div className="absolute inset-0 bg-gradient-to-b from-[#062a36] via-[#073b4c] to-[#0a4558]" />

        <div className="relative z-10 flex h-full flex-col px-10 py-12 xl:px-14 xl:py-14">
          <SegwitzLogo variant="light" size="sm" showMark={false} />

          <div className="mt-20 max-w-[340px] space-y-5 xl:mt-24">
            <h1 className="text-[2rem] font-semibold leading-[1.15] tracking-tight text-white xl:text-[2.35rem]">
              Meeting &amp; decision repository
            </h1>
            <p className="text-[15px] leading-relaxed text-white/75">
              Capture meetings, decisions, and follow-ups in one place. Built for teams
              that need clarity and auditability.
            </p>
          </div>

          <div className="mt-auto space-y-8 pb-2 pt-16">
            <div className="space-y-7">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="flex gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/25">
                      <Icon className="h-4 w-4 text-white/90" strokeWidth={1.75} />
                    </div>
                    <div className="space-y-1 pt-0.5">
                      <p className="text-sm font-semibold text-white">{feature.title}</p>
                      <p className="text-sm leading-relaxed text-white/65">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-sm text-white/45">© SegWitz</p>
          </div>
        </div>
      </aside>

      {/* Right sign-in panel */}
      <div className="relative flex min-h-screen flex-col bg-[#eef1f0] dark:bg-[#eef1f0]">
        <div className="absolute right-6 top-6 sm:right-8 sm:top-8">
          <div className="rounded-full border border-border/50 bg-white shadow-sm">
            <ThemeToggle />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-20 sm:px-12">
          <div className="w-full max-w-[440px]">
            <div className="mb-8 lg:hidden">
              <SegwitzLogo variant="dark" size="md" showMark={false} />
            </div>

            <div className="rounded-2xl border border-[#dfe4e2] bg-white px-8 py-10 shadow-[0_8px_30px_rgba(7,59,76,0.06)] sm:px-10 sm:py-11">
              <div className="mb-8 space-y-2.5">
                <h2 className="text-[1.65rem] font-semibold tracking-tight text-[#1a2e28]">
                  Sign in
                </h2>
                <p className="text-sm leading-relaxed text-[#6b7c75]">
                  Use your SegWitz Supabase account credentials.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-[#344e41]">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="h-11 rounded-lg border-[#dfe4e2] bg-[#eef1f0] text-[#1a2e28] shadow-none placeholder:text-[#9aa8a2] focus-visible:border-[#073b4c] focus-visible:bg-white focus-visible:ring-[#073b4c]/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-[#344e41]">
                    Password
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="h-11 rounded-lg border-[#dfe4e2] bg-[#eef1f0] text-[#1a2e28] shadow-none placeholder:text-[#9aa8a2] focus-visible:border-[#073b4c] focus-visible:bg-white focus-visible:ring-[#073b4c]/20"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="mt-1 h-11 w-full rounded-lg bg-[#073b4c] text-sm font-medium text-white shadow-none hover:bg-[#062f3c]"
                >
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
