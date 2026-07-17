import { redirect } from "next/navigation";

export default function Home() {
  // Middleware handles role-based routing,
  // but as a fallback, we redirect to login here.
  redirect("/login");
}
