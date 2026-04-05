import { Shield } from "lucide-react";
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-background border-t border-white/10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Shield className="w-6 h-6" />
              <span className="text-xl font-bold">IntelliVault.AI</span>
            </Link>

            <p className="text-sm text-gray-400">
              Secure digital vault with AI-powered protection, zero-knowledge encryption, and enterprise identity orchestration.
            </p>
            <p className="text-xs text-gray-500 mt-3">
              Hosted in SOC-2 certified data centers. ISO/IEC 27001-ready infrastructure.
            </p>
          </div>

          <div>
            <h4>Product</h4>
            <ul>
              <li><Link href="/features">Features</Link></li>
              <li><Link href="/dashboard">Security</Link></li>
              <li><Link href="/signup">Get Started</Link></li>
              <li><a href="#">Integrations</a></li>
            </ul>
          </div>

          <div>
            <h4>Company</h4>
            <ul>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Press</a></li>
            </ul>
          </div>

          <div>
            <h4>Support</h4>
            <ul>
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Status</a></li>
              <li><Link href="/admin">Admin Panel</Link></li>
              <li><a href="#">SLA</a></li>
            </ul>
          </div>

        </div>

        <div className="pt-6 border-t text-sm text-gray-500">
          © {new Date().getFullYear()} IntelliVault AI
        </div>

      </div>
    </footer>
  );
}
