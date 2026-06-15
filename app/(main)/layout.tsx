import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import BottomNav from "@/components/BottomNav";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 pb-24 md:pb-0">{children}</main>
      <BottomNav />
    </div>
  );
}
