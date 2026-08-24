import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandLogo({
  size = 40,
  className,
  priority = false,
}: {
  size?: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/logo.png"
      alt="Escudo del club Excelsior"
      width={size}
      height={size}
      priority={priority}
      className={cn("object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]", className)}
    />
  );
}

export function BrandWordmark({
  size = 40,
  subtitle = "Preparación física",
  className,
}: {
  size?: number;
  subtitle?: string | null;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <BrandLogo size={size} />
      <div className="leading-tight">
        <p className="font-heading text-lg font-extrabold tracking-tight">
          EXCELSIOR
        </p>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
