
import { Badge } from "@/components/ui/badge";

interface PlanBadgeProps {
  plan: "Basic" | "Standard" | "Premium" | "Pro";
}

export function PlanBadge({ plan }: PlanBadgeProps) {
  const getVariant = (plan: string) => {
    switch (plan) {
      case "Basic":
        return "secondary";
      case "Standard":
        return "outline";
      case "Premium":
        return "default";
      case "Pro":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStyles = (plan: string) => {
    switch (plan) {
      case "Pro":
        return "bg-gradient-to-r from-[#FF577F] to-[#E6447A] text-white border-0";
      case "Premium":
        return "bg-primary/10 text-primary border-primary/20";
      default:
        return "";
    }
  };

  return (
    <Badge 
      variant={getVariant(plan)} 
      className={`${getStyles(plan)} font-medium px-3 py-1`}
    >
      {plan}
    </Badge>
  );
}
