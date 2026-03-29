'use client';

import dynamic from "next/dynamic";

const EditorPage = dynamic(() => import("@/features/editor/components/EditorPage"), {
  ssr: false,
  loading: () => (
    <main className="flex min-h-screen items-center justify-center bg-black text-sm text-zinc-400">
      Loading workspace...
    </main>
  ),
});

export default function HomePage() {
  return <EditorPage />;
}
