import AuthForm from "@/components/AuthForm";

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <>
    {error === "not-admin" && <p className="container" role="alert">Dieses Konto hat keine Administratorrechte.</p>}
    <AuthForm adminMode />
  </>;
}
