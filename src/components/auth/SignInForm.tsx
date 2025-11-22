import SignInFormView from "./SignInFormView";
import { useSignInForm } from "./useSignInForm";

export default function SignInForm() {
  const {
    control,
    errors,
    isSubmitting,
    showPassword,
    setShowPassword,
    error,
    formSubmit,
  } = useSignInForm();

  return (
    <SignInFormView
      control={control}
      errors={errors}
      isSubmitting={isSubmitting}
      showPassword={showPassword}
      onTogglePassword={() => setShowPassword(!showPassword)}
      errorMessage={error}
      onSubmit={formSubmit}
    />
  );
}
