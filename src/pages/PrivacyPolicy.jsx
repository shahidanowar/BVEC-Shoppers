import React from 'react'

export default function PrivacyPolicy() {
    return (
        <div className="privacy-page">
            <div className="privacy-container">
                <div className="privacy-header">
                    <h1>Privacy Policy</h1>
                    <p>Last updated: {new Date().toLocaleDateString()}</p>
                </div>

                <div className="privacy-card">
                    <section className="privacy-section">
                        <h2>1. Introduction</h2>
                        <p>Welcome to BVEC Shoppers. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.</p>
                    </section>

                    <section className="privacy-section">
                        <h2>2. Information We Collect</h2>
                        <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
                        <ul>
                            <li><strong>Identity Data:</strong> includes first name, last name, and college ID.</li>
                            <li><strong>Contact Data:</strong> includes email address and phone number (for WhatsApp integration).</li>
                            <li><strong>Listing Data:</strong> includes details about products you list for sale.</li>
                            <li><strong>Profile Data:</strong> includes your username or similar identifier, and your interests.</li>
                        </ul>
                    </section>

                    <section className="privacy-section">
                        <h2>3. How We Use Your Information</h2>
                        <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
                        <ul>
                            <li>To register you as a new user.</li>
                            <li>To facilitate the buying and selling process between students.</li>
                            <li>To enable communication via WhatsApp between buyers and sellers.</li>
                            <li>To improve our website, services, and user experience.</li>
                        </ul>
                    </section>

                    <section className="privacy-section">
                        <h2>4. Data Security</h2>
                        <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those who have a business need to know.</p>
                    </section>

                    <section className="privacy-section">
                        <h2>5. WhatsApp Integration</h2>
                        <p>BVEC Shoppers facilitates communication between buyers and sellers through WhatsApp. By using the "Chat on WhatsApp" feature, you agree to share your phone number with the other party to enable this communication.</p>
                    </section>

                    <section className="privacy-section">
                        <h2>6. Contact Us</h2>
                        <p>If you have any questions about this privacy policy or our privacy practices, please contact us through the college council or the BVEC Shoppers administrator.</p>
                    </section>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .privacy-page {
                    padding: 40px 20px;
                    background: var(--bg-primary);
                    min-height: calc(100vh - var(--navbar-height));
                }
                .privacy-container {
                    max-width: 800px;
                    margin: 0 auto;
                    animation: fadeUpLogin 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .privacy-header {
                    margin-bottom: 32px;
                    text-align: center;
                }
                .privacy-header h1 {
                    font-size: 2.5rem;
                    color: var(--text-primary);
                    margin-bottom: 8px;
                }
                .privacy-header p {
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                }
                .privacy-card {
                    background: var(--bg-card);
                    padding: 40px;
                    border-radius: var(--radius-lg);
                    box-shadow: var(--shadow-md);
                    border: 1px solid var(--border);
                }
                .privacy-section {
                    margin-bottom: 32px;
                }
                .privacy-section:last-child {
                    margin-bottom: 0;
                }
                .privacy-section h2 {
                    font-size: 1.25rem;
                    color: var(--accent);
                    margin-bottom: 16px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .privacy-section p {
                    color: var(--text-primary);
                    line-height: 1.7;
                    margin-bottom: 12px;
                }
                .privacy-section ul {
                    padding-left: 20px;
                    color: var(--text-primary);
                }
                .privacy-section li {
                    margin-bottom: 8px;
                    line-height: 1.6;
                }
                @media (max-width: 640px) {
                    .privacy-card {
                        padding: 24px;
                    }
                    .privacy-header h1 {
                        font-size: 2rem;
                    }
                }
            `}} />
        </div>
    )
}
