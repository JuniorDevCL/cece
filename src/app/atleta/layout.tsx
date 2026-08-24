import { AppShell } from "@/components/app-shell";

export default function AthleteLayout({ children }: LayoutProps<"/atleta">) {
  return <AppShell role="deportista">{children}</AppShell>;
}
