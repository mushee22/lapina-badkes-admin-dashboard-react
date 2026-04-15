import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function Login() {
  return (
    <>
      <PageMeta
        title="React.js Login | Lapina Bakers Admin - React Tailwind Admin Dashboard"
        description="Login page using Lapina Bakers Admin React components"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}