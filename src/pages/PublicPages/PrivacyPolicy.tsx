import PageMeta from "../../components/common/PageMeta";
import PublicLayout from "../../layout/PublicLayout";


export default function PrivacyPolicy() {
    return (
        <>
            <PageMeta
                title="Privacy Policy | Lapina Bakes"
                description="Privacy Policy for Lapina Bakes"
            />
            <PublicLayout>
                <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Privacy Policy</h1>

                    <div className="space-y-6 text-gray-600 dark:text-gray-300">
                        <p>
                            Last updated: {new Date().toLocaleDateString()}
                        </p>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mt-8 mb-4">1. Introduction</h2>
                            <p>
                                Welcome to Lapina Bakes. We respect your privacy and are committed to protecting your personal data.
                                This privacy policy will inform you as to how we look after your personal data when you visit our
                                website and tell you about your privacy rights and how the law protects you.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mt-8 mb-4">2. The Data We Collect</h2>
                            <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
                            <ul className="list-disc pl-6 mt-2 space-y-2">
                                <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
                                <li><strong>Contact Data:</strong> includes billing address, delivery address, email address and telephone numbers.</li>
                                <li><strong>Financial Data:</strong> includes bank account and payment card details.</li>
                                <li><strong>Transaction Data:</strong> includes details about payments to and from you and other details of products and services you have purchased from us.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mt-8 mb-4">3. How We Use Your Data</h2>
                            <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
                            <ul className="list-disc pl-6 mt-2 space-y-2">
                                <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
                                <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                                <li>Where we need to comply with a legal obligation.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mt-8 mb-4">4. Data Security</h2>
                            <p>
                                We have put in place appropriate security measures to prevent your personal data from being accidentally lost,
                                used or accessed in an unauthorised way, altered or disclosed. In addition, we limit access to your personal
                                data to those employees, agents, contractors and other third parties who have a business need to know.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mt-8 mb-4">5. Contact Us</h2>
                            <p>
                                If you have any questions about this privacy policy or our privacy practices, please contact us at support via the support page.
                            </p>
                        </section>
                    </div>
                </div>
            </PublicLayout>
        </>
    );
}
