import BottomNav from "@/components/BottomNav";
import { auth } from "@/lib/auth";

export default async function UsernameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      {session && <BottomNav />}
    </div>
  );
}
