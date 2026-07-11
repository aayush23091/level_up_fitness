import Link from "next/link";
import Logo from "@/components/Logo";

export const metadata = {
  title: "Terms of Service | LevelUp Fitness",
  description:
    "Review the LevelUp Fitness Terms of Service for user responsibilities, coach marketplace rules, payments, and more.",
};

const sections = [
  {
    id: "acceptance-of-terms",
    title: "1. Acceptance of Terms",
    content:
      "By accessing or using LevelUp Fitness (&quot;the Platform&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Platform. We may update these terms from time to time, and continued use of the Platform constitutes acceptance of any changes.",
  },
  {
    id: "account-rules",
    title: "2. Account Rules",
    content:
      "You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account. We reserve the right to suspend or terminate accounts that violate these terms.",
  },
  {
    id: "user-responsibilities",
    title: "3. User Responsibilities",
    content:
      "Users are responsible for their own safety during workouts. You should consult with a healthcare professional before beginning any new fitness program. You agree to use the Platform in accordance with all applicable laws and regulations. You are responsible for ensuring that your use of the Platform does not interfere with or disrupt other users.",
  },
  {
    id: "coach-marketplace-rules",
    title: "4. Coach Marketplace Rules",
    content:
      "Coaches on the Platform are independent professionals and not employees of LevelUp Fitness. While we verify coach credentials, we do not guarantee the quality of any coaching services. Users engage with coaches at their own discretion. Coach availability, pricing, and service offerings are determined by the coaches themselves. Disputes between users and coaches should be resolved directly between the parties.",
  },
  {
    id: "payments-and-coins",
    title: "5. Payments and Coins System",
    content:
      "LevelUp Fitness uses a virtual coin system for certain transactions. Coins can be purchased through the Platform using real currency. Coin purchases are non-refundable except as required by law. Coin values and pricing are subject to change. Unused coins may expire according to the terms specified at the time of purchase. All payment processing is handled by secure third-party providers.",
  },
  {
    id: "fitness-disclaimer",
    title: "6. Fitness Disclaimer",
    content:
      "The information and services provided on LevelUp Fitness are for educational and informational purposes only. They are not intended as medical advice, diagnosis, or treatment. Always seek the advice of a physician or other qualified health provider with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay seeking it because of something you have read on the Platform.",
  },
  {
    id: "prohibited-activities",
    title: "7. Prohibited Activities",
    content: (
      <ul className="list-disc list-inside space-y-2 text-muted">
        <li>Using the Platform for any illegal or unauthorized purpose.</li>
        <li>Harassing, threatening, or intimidating other users or coaches.</li>
        <li>Posting false, misleading, or harmful content.</li>
        <li>Attempting to gain unauthorized access to other user accounts or systems.</li>
        <li>Reverse engineering, scraping, or extracting data from the Platform.</li>
        <li>Using automated systems or bots to access the Platform without permission.</li>
        <li>Impersonating another person or entity.</li>
      </ul>
    ),
  },
  {
    id: "account-termination",
    title: "8. Account Termination",
    content:
      "We reserve the right to suspend or terminate your account at any time, without notice, for conduct that we believe violates these Terms of Service or is harmful to other users, us, or third parties. Upon termination, your right to use the Platform will immediately cease. All provisions of these Terms which by their nature should survive termination shall survive.",
  },
  {
    id: "changes-to-terms",
    title: "9. Changes to Terms",
    content:
      "We reserve the right to modify these Terms of Service at any time. We will notify users of significant changes via email or through the Platform. Your continued use of the Platform after such modifications constitutes your acceptance of the revised terms. We encourage you to review these terms periodically.",
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="w-full flex justify-center py-8">
        <Logo size="auth" />
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        <h1 className="text-3xl lg:text-4xl font-bold mb-2 text-center">
          Terms of Service
        </h1>
        <p className="text-center text-muted text-sm mb-12">
          Last updated: July 2026
        </p>

        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section.id} id={section.id}>
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                {section.title}
              </h2>
              <div className="text-muted leading-relaxed">{section.content}</div>
            </section>
          ))}
        </div>
      </main>

      <footer className="flex w-full justify-center gap-8 py-8 text-xs text-muted">
        <Link
          href="/privacy-policy"
          className="hover:text-accent transition-colors duration-200 uppercase font-semibold"
        >
          Privacy Policy
        </Link>
        <Link
          href="/terms"
          className="hover:text-accent transition-colors duration-200 uppercase font-semibold"
        >
          Terms of Service
        </Link>
        <Link
          href="/cookies"
          className="hover:text-accent transition-colors duration-200 uppercase font-semibold"
        >
          Cookie Policy
        </Link>
      </footer>
    </div>
  );
}
