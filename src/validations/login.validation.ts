import { z } from "zod";

export const LoginSchema = z.object({
  enrollment: z.string().min(1, "Enrollment number is required").regex(/^\d{11}$/, "Enrollment number must be exactly 11 digits"),
  password: z.string().min(1, "Password is required"),
  captcha: z.string().min(1, "CAPTCHA code is required").regex(/^(?=.*[a-zA-Z])(?=.*\d).{7}$/, "CAPTCHA must contain 7 letters"),
});


export type LoginInput = z.infer<typeof LoginSchema>;