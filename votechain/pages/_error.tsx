import type { NextPageContext } from "next";
import Head from "next/head";
import Link from "next/link";
import Navbar from "@/components/Navbar";

interface ErrorPageProps {
  statusCode?: number;
}

export default function ErrorPage({ statusCode }: ErrorPageProps) {
  const title = statusCode ? `Error ${statusCode}` : "Application Error";

  return (
    <>
      <Head>
        <title>{title} — VoteChain</title>
      </Head>
      <Navbar />

      <main className="min-h-screen bg-[#F7F8FB] px-4 py-16">
        <section className="mx-auto max-w-lg text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-au-gold">
            VoteChain
          </p>
          <h1 className="mt-3 font-heading text-4xl font-bold text-au-blue">
            {title}
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-gray-500">
            Something interrupted this page. You can return home and continue from the main election flow.
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

ErrorPage.getInitialProps = ({ res, err }: NextPageContext): ErrorPageProps => {
  const statusCode = res?.statusCode ?? err?.statusCode ?? 404;
  return { statusCode };
};
