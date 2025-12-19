"use client";
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  IconBrandGithub,
  IconBrandGoogle,
  IconBrandOnlyfans,
} from "@tabler/icons-react";
import { InputForm } from "@/components/patient/inpufForm";

export default function SignupFormDemo() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted");
  };
  return (
    <div className=" max-w-lg mx-auto shadow-2xl rounded-none bg-grey/30 bg-clip-border p-2 md:rounded-2xl md:p-8 dark:bg-black">
      <InputForm />

      <div className="absolute z-[-1] top-10 left-[-10rem] w-96 h-96 bg-blue-400/30 dark:bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute z-[-1] bottom-0 right-0 w-96 h-96 bg-green-400/20 dark:bg-green-400/10 rounded-full blur-3xl animate-pulse" />
    </div>
  );
}
