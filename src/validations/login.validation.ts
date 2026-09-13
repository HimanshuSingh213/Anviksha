import { z } from "zod";

export const LoginSchema = z.object({
  enrollment: z.string().trim().min(1, "Enrollment number is required"),
  password: z.string().trim().min(1, "Password is required"),
  captcha: z.string().trim().min(1, "CAPTCHA code is required"),
});

export type LoginInput = z.infer<typeof LoginSchema>;
