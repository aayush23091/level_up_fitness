import Link from "next/link";
import Logo from "@/components/Logo";

export const metadata = {
  title: "Privacy Policy | LevelUp Fitness",
  description:
    "Learn how LevelUp Fitness collects, uses, and protects your personal information and fitness data.",
};

const sections = [
  {
    id: "introduction",
    title: "1. Introduction",
    content:
      "LevelUp Fitness (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our fitness platform. By accessing or using LevelUp Fitness, you agree to the collection and use of information in accordance with this policy.",
  },
  {
    id: "information-we-collect",
    title: "2. Information We Collect",
    content: (
      <>
        <p className="mb-4">
          We collect information to provide better services to all our users. The types of information we collect include:
        </p>
        <ul className="list-disc list-inside space-y-2 mb-4 text-muted">
          <li>
            <span className="text-foreground font-medium">Account Information:</span> Name, email address, phone number, username, and password when you register.
          </li>
          <li>
            <span className="text-foreground font-medium">Profile Information:</span> Gender, age, height, weight, fitness goals, and profile photo.
          </li>
          <li>
            <span className="text-foreground font-medium">Fitness Data:</span> Body measurements, workout preferences, nutrition logs, and performance metrics.
          </li>
          <li>
            <span className="text-foreground font-medium">Workout History:</span> Completed exercises, sets, reps, duration, and intensity levels.
          </li>
          <li>
            <span className="text-foreground font-medium">Progress Data:</span> Weight changes, body fat percentage, strength gains, and milestone achievements.
          </li>
          <li>
            <span className="text-foreground font-medium">Coach Interactions:</span> Messages, session notes, feedback, and personalized recommendations from coaches.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "how-we-use-information",
    title: "3. How We Use Information",
    content: (
      <ul className="list-disc list-inside space-y-2 text-muted">
        <li>Provide core fitness services including workout plans and progress tracking.</li>
        <li>Personalize your experience with tailored workout recommendations.</li>
        <li>Track and display your fitness progress over time.</li>
        <li>Enable communication between users and coaches.</li>
        <li>Process payments and manage coin-based transactions.</li>
        <li>Send important updates, security alerts, and support messages.</li>
        <li>Improve platform features, performance, and user experience.</li>
        <li>Detect and prevent fraudulent activity or abuse.</li>
      </ul>
    ),
  },
  {
    id: "data-protection",
    title: "4. Data Protection",
    content:
      "We implement industry-standard security measures to protect your personal data. This includes encryption of sensitive information, secure socket layer (SSL) technology, regular security audits, and access controls. We retain your data only for as long as necessary to provide our services or as required by law. You can request deletion of your account and associated data at any time through your account settings.",
  },
  {
    id: "third-party-services",
    title: "5. Third-Party Services",
    content:
      "LevelUp Fitness may integrate with third-party services for authentication, analytics, and payment processing. These services have their own privacy policies, and we encourage you to review them. We do not sell your personal data to third parties. We may share aggregated, anonymized data for research and platform improvement purposes.",
  },
  {
    id: "user-rights",
    title: "6. User Rights",
    content:
      "You have the right to access, correct, or delete your personal information. You can update your profile settings at any time. You may opt out of non-essential communications. For data protection inquiries or to exercise your rights, please contact us using the information provided below.",
  },
  {
    id: "contact-information",
    title: "7. Contact Information",
    content:
      "If you have questions or concerns about this Privacy Policy, please contact us at privacy@levelupfitness.com. We will respond to your inquiry within 30 days.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="w-full flex justify-center py-8">
        <Logo size="auth" />
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        <h1 className="text-3xl lg:text-4xl font-bold mb-2 text-center">
          Privacy Policy
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
