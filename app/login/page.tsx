import AuthForm from "@/components/AuthForm";
import Link from "next/link";

export default function LoginPage() {
  return <><AuthForm /><p className="container muted"><Link href="/admin/login">Admin-Anmeldung</Link></p></>;
}
