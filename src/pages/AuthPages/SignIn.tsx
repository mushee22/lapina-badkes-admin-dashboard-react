import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="SignIn Page | Lapina Bakers Admin Dashboard"
        description="This is SignIn Page for Lapina Bakers Admin"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
