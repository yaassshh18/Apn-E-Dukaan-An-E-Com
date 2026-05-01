import { useParams } from 'react-router-dom';

const Legal = () => {
    const { section } = useParams();

    const renderContent = () => {
        if (section === 'privacy') {
            return (
                <>
                    <h1 className="text-3xl font-bold mb-2">PRIVACY POLICY</h1>
                    <p className="text-sm text-gray-500 mb-6">Effective Date: 17th April 2026</p>
                    
                    <p className="mb-6 text-gray-700 leading-relaxed">
                        Apn-E-Dukaan is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our platform. This policy is an electronic record in terms of the Information Technology Act, 2000, and does not require any physical or digital signatures.
                    </p>

                    <h2 className="text-xl font-bold mt-8 mb-4">1. INFORMATION WE COLLECT</h2>
                    <p className="mb-4 text-gray-700 leading-relaxed">We collect various types of information to facilitate smooth operation of the Apn-E-Dukaan platform.</p>
                    
                    <h3 className="text-lg font-semibold mt-4 mb-2">Personal Information (PI)</h3>
                    <ul className="list-disc pl-5 text-gray-700 mb-4 space-y-1">
                        <li>When you register or update your profile, we collect: <strong>Identity Data:</strong> Name, email address, and profile photo.</li>
                    </ul>

                    <h3 className="text-lg font-semibold mt-4 mb-2">Business / Seller Data</h3>
                    <ul className="list-disc pl-5 text-gray-700 mb-4 space-y-1">
                        <li>Store details, product listings, pricing, inventory data</li>
                        <li>Business description and category</li>
                    </ul>

                    <h3 className="text-lg font-semibold mt-4 mb-2">Customer Data</h3>
                    <ul className="list-disc pl-5 text-gray-700 mb-4 space-y-1">
                        <li>Delivery address</li>
                        <li>Contact details</li>
                        <li>Purchase preferences</li>
                    </ul>

                    <h3 className="text-lg font-semibold mt-4 mb-2">Sensitive Personal Data or Information (SPDI)</h3>
                    <ul className="list-disc pl-5 text-gray-700 mb-4 space-y-1">
                        <li><strong>Financial Information:</strong> To process transactions, we collect payment-related details. We may use third-party payment gateways (e.g., Stripe or similar services). We store transaction history and payment identifiers but do not store raw credit card details.</li>
                        <li><strong>Passwords:</strong> Encrypted credentials used for authentication.</li>
                    </ul>

                    <h3 className="text-lg font-semibold mt-4 mb-2">Usage & Platform Data</h3>
                    <ol className="list-decimal pl-5 text-gray-700 mb-4 space-y-1">
                        <li>Order history and transaction logs</li>
                        <li>Communication data (chat, support messages)</li>
                        <li>Platform activity (search, browsing, preferences)</li>
                    </ol>

                    <h2 className="text-xl font-bold mt-8 mb-4">2. HOW WE USE YOUR INFORMATION</h2>
                    <p className="mb-4 text-gray-700 leading-relaxed">We use the collected data for the following purposes:</p>
                    <ul className="list-disc pl-5 text-gray-700 mb-4 space-y-2">
                        <li><strong>Service Delivery:</strong> To enable buying, selling, and order management on the platform.</li>
                        <li><strong>Matching & Recommendations:</strong> To help users discover relevant products and stores.</li>
                        <li><strong>Platform Management:</strong> Admins may verify sellers and manage platform activities.</li>
                        <li><strong>AI & Improvements:</strong> Data may be used to improve recommendations and user experience.</li>
                        <li><strong>Financial Processing:</strong> To process payments, commissions, and settlements.</li>
                    </ul>

                    <h2 className="text-xl font-bold mt-8 mb-4">3. DISCLOSURE OF INFORMATION</h2>
                    <p className="mb-4 text-gray-700 leading-relaxed">We may share your information with:</p>
                    <ul className="list-disc pl-5 text-gray-700 mb-4 space-y-2">
                        <li><strong>Service Providers:</strong> Backend services, hosting platforms, and database providers.</li>
                        <li><strong>Payment Processors:</strong> Secure third-party payment gateways.</li>
                        <li><strong>Legal Compliance:</strong> If required under Indian law or government authority.</li>
                        <li><strong>Internal Access:</strong> Administrators may access user data for management and support.</li>
                    </ul>

                    <h2 className="text-xl font-bold mt-8 mb-4">4. DATA SECURITY</h2>
                    <p className="mb-4 text-gray-700 leading-relaxed">We implement reasonable security measures:</p>
                    <ul className="list-disc pl-5 text-gray-700 mb-4 space-y-2">
                        <li><strong>Access Control:</strong> Role-based access for users, sellers, and admins.</li>
                        <li><strong>Database Security:</strong> Secure database practices and restricted data visibility.</li>
                        <li><strong>System Reliability:</strong> Use of secure and modern development frameworks.</li>
                    </ul>

                    <h2 className="text-xl font-bold mt-8 mb-4">5. DATA RETENTION</h2>
                    <ul className="list-disc pl-5 text-gray-700 mb-4 space-y-2">
                        <li><strong>Order Records:</strong> Maintained for order history and user convenience.</li>
                        <li><strong>Financial Records:</strong> Retained as required under Indian tax and accounting laws.</li>
                    </ul>

                    <h2 className="text-xl font-bold mt-8 mb-4">6. YOUR RIGHTS</h2>
                    <p className="mb-4 text-gray-700 leading-relaxed">Under the IT Act and SPDI Rules, you have the right to:</p>
                    <ul className="list-disc pl-5 text-gray-700 mb-4 space-y-2">
                        <li><strong>Access:</strong> View your account and order history</li>
                        <li><strong>Correction:</strong> Update your profile and details</li>
                        <li><strong>Withdrawal:</strong> Request account deletion (subject to admin approval)</li>
                    </ul>

                    <h2 className="text-xl font-bold mt-8 mb-4">7. COOKIES AND LOCAL STORAGE</h2>
                    <p className="mb-4 text-gray-700 leading-relaxed">We use cookies and local storage to:</p>
                    <ul className="list-disc pl-5 text-gray-700 mb-4 space-y-2">
                        <li>Maintain user sessions</li>
                        <li>Improve Performance</li>
                        <li>Enhance user experience</li>
                    </ul>

                    <h2 className="text-xl font-bold mt-8 mb-4">8. GRIEVANCE OFFICER</h2>
                    <p className="mb-4 text-gray-700 leading-relaxed">
                        In accordance with the Information Technology Act, 2000, if you have any complaints or concerns regarding the processing of your personal data, please contact our Grievance Officer:
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6 text-gray-700">
                        <p><strong>Name:</strong> Meet Supeda (Co-Founder)</p>
                        <p><strong>Email:</strong> grievance@apn-e-dukaa.com</p>
                        <p><strong>Address:</strong> Building no. 13, Apn-E-Dukaan, Sion , Mumbai</p>
                    </div>

                    <p className="text-sm text-gray-500 italic border-t pt-4 mt-8">
                        <strong>Disclaimer:</strong> This policy is based on the current technical structure of Apn-E-Dukaan. It is recommended to have this reviewed by legal counsel to ensure compliance with the Digital Personal Data Protection (DPDP) Act, India.
                    </p>
                </>
            );
        } else if (section === 'refund') {
            return (
                <>
                    <h1 className="text-3xl font-bold mb-2 uppercase">REFUND & RETURN POLICY</h1>
                    <p className="text-sm text-gray-500 mb-6">Last Updated: April 2026</p>
                    <p className="mb-6 text-gray-700 leading-relaxed">
                        At Apn-E-Dukaan, we strive to ensure a smooth and trustworthy hyperlocal shopping experience. This Refund & Return Policy outlines the conditions under which refunds, returns, and cancellations are processed.
                    </p>

                    <h2 className="text-xl font-bold mt-8 mb-4">A. ELIGIBILITY</h2>
                    <ul className="list-disc pl-5 text-gray-700 mb-4 space-y-2">
                        <li><strong>Damaged Products:</strong> Items received in a physically damaged condition.</li>
                        <li><strong>Wrong Products:</strong> Items that do not match the description, size, or variant ordered.</li>
                        <li><strong>Missing Items:</strong> Partial orders delivered without prior communication.</li>
                        <li><strong>Seller Non-Compliance:</strong> Failure of the seller to fulfill negotiated terms.</li>
                    </ul>

                    <h2 className="text-xl font-bold mt-8 mb-4">B. NON-REFUNDABLE ITEMS</h2>
                    <p className="mb-4 text-gray-700 leading-relaxed">The following items cannot be returned or refunded unless received damaged:</p>
                    <ul className="list-disc pl-5 text-gray-700 mb-4 space-y-2">
                        <li>Personalized or custom-made goods.</li>
                        <li>Perishable items (food, flowers, etc.).</li>
                        <li>Items marked as &quot;Final Sale&quot; or &quot;Clearance.&quot;</li>
                    </ul>

                    <h2 className="text-xl font-bold mt-8 mb-4">C. REFUND PROCESS</h2>
                    <ol className="list-decimal pl-5 text-gray-700 mb-4 space-y-2">
                        <li><strong>Request Submission:</strong> Buyers must raise a return/refund request within 48 hours of delivery.</li>
                        <li><strong>Approval:</strong> The seller or platform admin reviews the request and evidence (e.g., photos).</li>
                        <li><strong>Return Shipping:</strong> The buyer may need to return the item to the seller&apos;s location, or a pickup will be arranged.</li>
                        <li><strong>Inspection:</strong> The seller inspects the returned item for condition and validity.</li>
                        <li><strong>Refund Timelines:</strong> Approved refunds are initiated within 3-5 business days.</li>
                    </ol>

                    <h2 className="text-xl font-bold mt-8 mb-4">D. PAYMENT REVERSALS</h2>
                    <ul className="list-disc pl-5 text-gray-700 mb-4 space-y-2">
                        <li><strong>Original Payment Source:</strong> Online payments are reversed to the original credit/debit card or bank account.</li>
                        <li><strong>Wallet/Store Credit:</strong> Refunds may be issued as store credit for faster resolution, if agreed upon.</li>
                        <li><strong>COD Refunds:</strong> Cash on Delivery refunds require bank account details from the buyer.</li>
                    </ul>

                    <h2 className="text-xl font-bold mt-8 mb-4">E. SELLER RESPONSIBILITY</h2>
                    <p className="mb-4 text-gray-700 leading-relaxed">
                        Sellers are solely responsible for accurately describing their products and fulfilling orders. Repeated seller disputes, failure to honor returns, or fraudulent behavior will result in severe penalties, including immediate account suspension or termination.
                    </p>

                    <h2 className="text-xl font-bold mt-8 mb-4">F. CANCELLATION POLICY</h2>
                    <ul className="list-disc pl-5 text-gray-700 mb-4 space-y-2">
                        <li><strong>Before Shipment:</strong> Orders can be cancelled freely before the seller marks them as shipped.</li>
                        <li><strong>After Shipment:</strong> Cancellations after shipment are treated as returns and may incur shipping deductions.</li>
                        <li><strong>Negotiated Orders:</strong> Cancellations for items purchased via direct chat negotiation must be mutually agreed upon.</li>
                    </ul>

                    <h2 className="text-xl font-bold mt-8 mb-4">G. CUSTOMER SUPPORT</h2>
                    <p className="mb-4 text-gray-700 leading-relaxed">
                        For any refund or return issues, please contact the seller directly through our chat feature. If the issue is not resolved within 3 business days, you may escalate the matter to Apn-E-Dukaan support via <strong>support@apn-e-dukaan.com</strong>.
                    </p>

                    <h2 className="text-xl font-bold mt-8 mb-4">H. ABUSE PREVENTION</h2>
                    <p className="mb-4 text-gray-700 leading-relaxed">
                        To maintain platform integrity, Apn-E-Dukaan actively monitors for refund fraud. Accounts with excessive, frivolous, or fraudulent return claims may be restricted, suspended, or permanently banned without notice.
                    </p>
                </>
            );
        } else {
            return (
                <>
                    <h1 className="text-3xl font-bold mb-2 uppercase">TERMS AND CONDITIONS</h1>
                    <p className="text-sm text-gray-500 mb-6">Last Updated: April 2026</p>
                    <p className="mb-6 text-gray-700 leading-relaxed">
                        Welcome to Apn-E-Dukaan. By accessing or using our platform, you agree to be bound by these Terms and Conditions. Please read them carefully.
                    </p>

                    <h2 className="text-xl font-bold mt-8 mb-4">A. PLATFORM OVERVIEW</h2>
                    <ul className="list-disc pl-5 text-gray-700 mb-4 space-y-2">
                        <li><strong>Marketplace Purpose:</strong> Apn-E-Dukaan is a hyperlocal digital marketplace connecting local sellers with buyers.</li>
                        <li><strong>Roles:</strong> Users may register as Buyers or Sellers. Administrators manage platform integrity.</li>
                        <li><strong>Responsibilities:</strong> All users must engage in fair, lawful commerce and maintain respectful communication.</li>
                    </ul>

                    <h2 className="text-xl font-bold mt-8 mb-4">B. ACCOUNT TERMS</h2>
                    <ul className="list-disc pl-5 text-gray-700 mb-4 space-y-2">
                        <li><strong>Registration:</strong> You must provide accurate and complete information during registration.</li>
                        <li><strong>Security:</strong> You are responsible for maintaining the confidentiality of your OTPs and account credentials.</li>
                        <li><strong>Suspension:</strong> We reserve the right to suspend or terminate accounts engaging in fraudulent or suspicious activities.</li>
                    </ul>

                    <h2 className="text-xl font-bold mt-8 mb-4">C. BUYER TERMS</h2>
                    <ul className="list-disc pl-5 text-gray-700 mb-4 space-y-2">
                        <li><strong>Purchases:</strong> Buyers are obligated to complete payments for successfully negotiated and ordered items.</li>
                        <li><strong>Negotiation:</strong> Our chat-based negotiation system must be used in good faith.</li>
                        <li><strong>Disputes:</strong> Buyers must attempt to resolve issues directly with the seller before escalating to platform administrators.</li>
                    </ul>

                    <h2 className="text-xl font-bold mt-8 mb-4">D. SELLER TERMS</h2>
                    <ul className="list-disc pl-5 text-gray-700 mb-4 space-y-2">
                        <li><strong>Product Authenticity:</strong> Sellers must only list authentic, legal, and accurately described products.</li>
                        <li><strong>Pricing Transparency:</strong> Sellers must honor negotiated prices and avoid hidden charges.</li>
                        <li><strong>Obligations:</strong> Sellers are strictly responsible for product quality, shipping, and timely delivery.</li>
                        <li><strong>Penalties:</strong> Violation of these terms will result in account strikes or permanent bans.</li>
                    </ul>

                    <h2 className="text-xl font-bold mt-8 mb-4">E. PAYMENTS</h2>
                    <p className="mb-4 text-gray-700 leading-relaxed">
                        We support multiple payment methods including secure online gateways and Cash on Delivery (COD). Apn-E-Dukaan is not liable for technical failures caused by external payment processors. All applicable local taxes are the responsibility of the transacting parties.
                    </p>

                    <h2 className="text-xl font-bold mt-8 mb-4">F. INTELLECTUAL PROPERTY</h2>
                    <p className="mb-4 text-gray-700 leading-relaxed">
                        All platform logos, designs, and code are the property of Apn-E-Dukaan. Sellers retain rights to their product images but grant the platform a license to display them. Unauthorized copying or scraping of platform content is strictly prohibited.
                    </p>

                    <h2 className="text-xl font-bold mt-8 mb-4">G. LIABILITY LIMITATIONS</h2>
                    <p className="mb-4 text-gray-700 leading-relaxed">
                        Apn-E-Dukaan operates solely as an intermediary technology platform. We do not manufacture, store, or inspect the products sold. We hold no liability for product defects, delivery delays, or extreme seller-buyer disputes, although we provide tools to facilitate resolution.
                    </p>

                    <h2 className="text-xl font-bold mt-8 mb-4">H. PRIVACY &amp; DATA USE</h2>
                    <p className="mb-4 text-gray-700 leading-relaxed">
                        Your use of the platform is also governed by our Privacy Policy. We utilize secure OTP verification, encrypted cookies, and modern data security measures to protect your information.
                    </p>

                    <h2 className="text-xl font-bold mt-8 mb-4">I. PROHIBITED ACTIVITIES</h2>
                    <p className="mb-4 text-gray-700 leading-relaxed">Users may not engage in:</p>
                    <ul className="list-disc pl-5 text-gray-700 mb-4 space-y-2">
                        <li>Selling counterfeit, illegal, or restricted goods.</li>
                        <li>Spamming, harassment, or abusive language in chat.</li>
                        <li>Unauthorized access, hacking, or exploiting platform vulnerabilities.</li>
                    </ul>

                    <h2 className="text-xl font-bold mt-8 mb-4">J. GOVERNING LAW</h2>
                    <p className="mb-4 text-gray-700 leading-relaxed">
                        These terms are governed by the laws of India. Any legal disputes arising from the use of Apn-E-Dukaan shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra.
                    </p>

                    <h2 className="text-xl font-bold mt-8 mb-4">K. MODIFICATION RIGHTS</h2>
                    <p className="mb-4 text-gray-700 leading-relaxed">
                        We reserve the right to modify these Terms and Conditions at any time. Continued use of the platform following any changes constitutes your acceptance of the revised terms.
                    </p>
                </>
            );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 py-20 px-6">
            <div className="max-w-4xl mx-auto glass-card p-10 bg-white">
                {renderContent()}
            </div>
        </div>
    );
};

export default Legal;
