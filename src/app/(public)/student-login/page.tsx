"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, UserCircle } from "lucide-react";
import { studentLoginSchema, type StudentLoginInput } from "@/features/auth/auth.schema";
import { studentLoginAction } from "@/features/auth/auth.actions";
import { useRouter } from "next/navigation";

export default function StudentLoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StudentLoginInput>({
    resolver: zodResolver(studentLoginSchema),
  });

  const onSubmit = async (data: StudentLoginInput) => {
    setServerError(null);
    const result = await studentLoginAction(data);
    
    if (result.error) {
      setServerError(result.error);
    } else {
      router.push("/student/dashboard"); 
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md bg-card border rounded-2xl shadow-sm p-8 flex flex-col items-center">
        <div className="h-12 w-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
          <UserCircle className="h-6 w-6 text-blue-500" />
        </div>
        
        <h1 className="text-2xl font-bold tracking-tight mb-2">Student Portal</h1>
        <p className="text-sm text-muted-foreground mb-8 text-center">
          Enter your student number to access your grades and ID.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full max-w-sm">
          {serverError && (
            <div className="p-3 text-sm font-medium bg-destructive/15 text-destructive rounded-lg border border-destructive/20">
              {serverError}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">
              Student Number
            </label>
            <input
              {...register("studentNumber")}
              type="text"
              placeholder="e.g. 2024-00123"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {errors.studentNumber && (
              <p className="text-sm text-destructive">{errors.studentNumber.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">
              Password
            </label>
            <input
              {...register("password")}
              type="password"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2 mt-4"
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
