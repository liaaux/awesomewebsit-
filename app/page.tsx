import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import IdeaForm from "@/components/IdeaForm";
import UpvoteButton from "@/components/UpvoteButton";
import Link from "next/link";
import { MessageSquare, MapPin, Calendar, DollarSign, LogOut } from "lucide-react";
import { logoutAction } from "./actions/auth";

export default async function Home() {
  const session = await getSession();
  const ideas = await prisma.idea.findMany({
    include: {
      author: {
        select: { name: true },
      },
      _count: {
        select: { upvotes: true, comments: true },
      },
      upvotes: {
        where: { userId: session?.user?.id },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-gray-50 pb-12">
      <nav className="bg-white border-b border-gray-200 py-4 mb-8 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-black text-indigo-600 tracking-tight">SCHOOL EVENTS</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden sm:inline">Hi, {session?.user?.name}</span>
            <form action={logoutAction}>
              <button type="submit" className="text-gray-500 hover:text-red-600 transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4">
        <IdeaForm />

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-800">Recent Ideas</h2>
          {ideas.length === 0 ? (
            <p className="text-center text-gray-500 py-12 bg-white rounded-xl border border-dashed border-gray-300">
              No ideas yet. Be the first to share one!
            </p>
          ) : (
            ideas.map((idea) => (
              <div key={idea.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:border-indigo-200 transition-colors">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900 leading-tight">
                      <Link href={`/ideas/${idea.id}`} className="hover:text-indigo-600 transition-colors">
                        {idea.title}
                      </Link>
                    </h3>
                    <UpvoteButton
                      ideaId={idea.id}
                      initialCount={idea._count.upvotes}
                      initialHasUpvoted={idea.upvotes.length > 0}
                    />
                  </div>

                  <p className="text-gray-600 mb-6 line-clamp-3">{idea.description}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 text-sm text-gray-500">
                    {idea.suggestedDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-pink-500" />
                        <span>{idea.suggestedDate}</span>
                      </div>
                    )}
                    {idea.suggestedLocation && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-orange-500" />
                        <span>{idea.suggestedLocation}</span>
                      </div>
                    )}
                    {idea.monetaryRequirement && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        <span>{idea.monetaryRequirement}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                      By {idea.author.name} • {new Date(idea.createdAt).toLocaleDateString()}
                    </span>
                    <Link
                      href={`/ideas/${idea.id}`}
                      className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                      {idea._count.comments} Comments
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
