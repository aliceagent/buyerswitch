import Link from "next/link";

export default function NotFound() {
  return (
    <div className="p-12">
      <h1 className="text-2xl font-semibold text-navy">Page not found</h1>
      <p className="mt-2 text-ink-muted">This concept UI has no matching route.</p>
      <Link href="/demo/ready" className="mt-4 inline-block text-lightblue">
        Explore demo
      </Link>
    </div>
  );
}
