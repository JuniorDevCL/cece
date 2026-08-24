import { AppShell } from "@/components/app-shell";

export default function PFLayout({ children }: LayoutProps<"/pf">) {
  return <AppShell role="pf">{children}</AppShell>;
}
