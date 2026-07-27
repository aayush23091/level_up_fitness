import Link from "next/link";
import Logo from "@/components/Logo";

export const metadata = {
  title: "Cookie Policy | LevelUp Fitness",
  description:
    "Understand how LevelUp Fitness uses cookies and similar technologies to enhance your experience.",
};

const sections = [
  {
    id: "what-are-cookies",
    title: "1. What Are Cookies",
    content:
      "Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently, provide a better user experience, and give information to website owners. Cookies may be &quot;session cookies&quot; which are deleted when you close your browser, or &quot;persistent cookies&quot; which remain on your device for a set period.",
  },
  {
    id: "cookies-we-use",
    title: "2. Cookies We Use",
    content: (
      <ul className="list-disc list-inside space-y-2 text-muted">
        <li>
          <span className="text-foreground font-medium">Authentication Cookies:</span> Essential for keeping you logged in and securing your account session.
        </li>
        <li>
          <span className="text-foreground font-medium">Preference Cookies:</span> Remember your settings such as theme (dark/light mode) and display preferences.
        </li>
        <li>
          <span className="text-foreground font-medium">Analytics Cookies:</span> Help us understand how users interact with the Platform so we can improve our services.
        </li>
      </ul>
    ),
  },
  {
    id: "why-we-use-cookies",
    title: "3. Why We Use Cookies",
    content:
      "We use cookies to ensure the Platform functions correctly, to remember your preferences, to understand how you use our services, and to improve your overall experience. Cookies help us provide secure, personalized, and efficient access to your fitness data and workout plans.",
  },
  {
    id: "managing-cookies",
    title: "4. Managing Cookies",
    content:
      "Most web browsers allow you to manage cookies through their settings. You can set your browser to refuse cookies or delete existing cookies. However, please note that disabling essential cookies may affect the functionality of the Platform. For detailed instructions on managing cookies, please refer to your browser&apos;s help documentation.",
  },
  {
    id: "updates",
    title: "5. Updates",
    content:
      "We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or our data practices. Any changes will be posted on this page with an updated effective date. Continued use of the Platform following any changes indicates your acceptance of the revised Cookie Policy.",
  },
];

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="w-full flex justify-center py-8">
        <Logo size="auth" />
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        <h1 className="text-3xl lg:text-4xl font-bold mb-2 text-center">
          Cookie Policy
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
