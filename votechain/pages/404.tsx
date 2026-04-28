import Head from "next/head";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function NotFoundPage() {
  return (
    <>
      <Head>
        <title>Page Not Found — VoteChain</title>
      </Head>
      <Navbar />

      <main className="min-h-screen bg-[#F7F8FB] px-4 py-16">
        <section className="mx-auto max-w-lg text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-au-gold">
            VoteChain
          </p>
          <h1 className="mt-3 font-heading text-4xl font-bold text-au-blue">
            Page Not Found
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-gray-500">
            This page is not part of the current ACOMSS election flow.
          </p>
          <div className="mt-8 flex justify-center">
            <Link href="/" className="btn-primary">
              Back to Home
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
