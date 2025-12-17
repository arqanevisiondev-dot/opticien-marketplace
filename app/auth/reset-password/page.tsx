import ResetForm from './ResetForm';

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  // Await the searchParams Promise
  const params = await searchParams;
  const token = params?.token ?? null;
  
  return <ResetForm token={token} />;
}