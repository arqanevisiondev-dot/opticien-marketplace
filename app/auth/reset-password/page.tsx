import ResetForm from './ResetForm';

export default function ResetPasswordPage({ searchParams }: { searchParams?: { token?: string } }) {
  const token = searchParams?.token ?? null;
  return <ResetForm token={token} />;
}
