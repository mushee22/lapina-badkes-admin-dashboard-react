import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function Login() {
  return (
    <>
      <PageMeta
        title="React.js Login | Lapina Bakes Admin - React Tailwind Admin Dashboard"
        description="Login page using Lapina Bakes Admin React components"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}