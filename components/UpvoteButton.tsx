"use client";

import { toggleUpvote } from "@/app/actions/ideas";
import { ThumbsUp } from "lucide-react";
import { useState, useTransition } from "react";

interface UpvoteButtonProps {
  ideaId: string;
  initialCount: number;
  initialHasUpvoted: boolean;
}

export default function UpvoteButton({ ideaId, initialCount, initialHasUpvoted }: UpvoteButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [count, setCount] = useState(initialCount);
  const [hasUpvoted, setHasUpvoted] = useState(initialHasUpvoted);

  const handleToggle = () => {
    startTransition(async () => {
      // Optimistic update
      setCount(prev => hasUpvoted ? prev - 1 : prev + 1);
      setHasUpvoted(prev => !prev);

      const result = await toggleUpvote(ideaId);
      if (result?.error) {
        // Rollback
        setCount(prev => hasUpvoted ? prev + 1 : prev - 1);
        setHasUpvoted(prev => !prev);
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold transition-all ${
        hasUpvoted
          ? "bg-indigo-600 text-white"
          : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
      }`}
    >
      <ThumbsUp className={`w-4 h-4 ${hasUpvoted ? "fill-current" : ""}`} />
      {count}
    </button>
  );
}
