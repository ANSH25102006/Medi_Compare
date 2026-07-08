import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onActionClick?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  onActionClick,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto my-6"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-primary/80 mb-4 border border-border shadow-sm">
        <Icon className="h-7 w-7 text-primary" />
      </div>
      <h3 className="text-base font-bold text-foreground">{title}</h3>
      <p className="text-xs text-muted-foreground mt-2 max-w-sm leading-relaxed">{description}</p>
      {actionText && onActionClick && (
        <Button
          onClick={onActionClick}
          className="mt-5 rounded-full font-semibold shadow-sm transition-all duration-200 active:scale-97 cursor-pointer"
        >
          {actionText}
        </Button>
      )}
    </motion.div>
  );
}
