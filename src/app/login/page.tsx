import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f4f6f5] text-muted-foreground">
          Loading...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
