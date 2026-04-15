import PageMeta from "../../components/common/PageMeta";
import PublicLayout from "../../layout/PublicLayout";


export default function TermsAndConditions() {
    return (
        <>
            <PageMeta
                title="Terms & Conditions | Lapina Bakers"
                description="Terms and Conditions for Lapina Bakers"
            />
            <PublicLayout>
                <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Terms and Conditions</h1>

                    <div className="space-y-6 text-gray-600 dark:text-gray-300">
                        <p>
                            Last updated: {new Date().toLocaleDateString()}
                        </p>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mt-8 mb-4">1. Agreement to Terms</h2>
                            <p>
                                By accessing or using Lapina Bakers, you agree to be bound by these Terms and Conditions.
                                If you disagree with any part of the terms, then you may not access the service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mt-8 mb-4">2. Intellectual Property</h2>
                            <p>
                                The Service and its original content, features and functionality are and will remain the exclusive
                                property of Lapina Bakers and its licensors. The Service is protected by copyright, trademark, and other
                                laws of both the Country and foreign countries.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mt-8 mb-4">3. User Accounts</h2>
                            <p>
                                When you create an account with us, you must provide us information that is accurate, complete, and
                                current at all times. Failure to do so constitutes a breach of the Terms, which may result in
                                immediate termination of your account on our Service.
                            </p>
                            <p className="mt-2">
                                You are responsible for safeguarding the password that you use to access the Service and for any
                                activities or actions under your password.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mt-8 mb-4">4. Orders and Payments</h2>
                            <p>
                                We reserve the right to refuse or cancel your order at any time for certain reasons including but not limited to:
                                product or service availability, errors in the description or price of the product or service, error in your order or other reasons.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mt-8 mb-4">5. Limitation of Liability</h2>
                            <p>
                                In no event shall Lapina Bakers, nor its directors, employees, partners, agents, suppliers, or affiliates,
                                be liable for any indirect, incidental, special, consequential or punitive damages, including without
                                limitation, loss of profits, data, use, goodwill, or other intangible losses.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mt-8 mb-4">6. Changes to Terms</h2>
                            <p>
                                We reserve the right, at our sole discretion, to modify or replace these Terms at any time.
                                By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
                            </p>
                        </section>
                    </div>
                </div>
            </PublicLayout>
        </>
    );
}
