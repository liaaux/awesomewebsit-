import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Calendar, DollarSign, LogOut } from "lucide-react";
import UpvoteButton from "@/components/UpvoteButton";
import CommentSection from "@/components/CommentSection";
import { logoutAction } from "../../actions/auth";

export default async function IdeaDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const session = await getSession();

  const idea = await prisma.idea.findUnique({
    where: { id },
    include: {
      author: { select: { name: true } },
      comments: {
        include: { author: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { upvotes: true } },
      upvotes: { where: { userId: session?.user?.id } },
    },
  });

  if (!idea) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-12">
      <nav className="bg-white border-b border-gray-200 py-4 mb-8 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-800 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back to Feed</span>
          </Link>
          <h1 className="text-xl font-black text-indigo-600 tracking-tight">SCHOOL EVENTS</h1>
          <form action={logoutAction}>
            <button type="submit" className="text-gray-500 hover:text-red-600 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </form>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-3xl font-black text-gray-900 leading-tight">
                {idea.title}
              </h2>
              <UpvoteButton
                ideaId={idea.id}
                initialCount={idea._count.upvotes}
                initialHasUpvoted={idea.upvotes.length > 0}
              />
            </div>

            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                {idea.author.name?.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-gray-800">{idea.author.name}</p>
                <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">
                  Posted on {new Date(idea.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="prose prose-indigo max-w-none mb-10">
              <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-wrap">
                {idea.description}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-gray-100">
              {idea.suggestedDate && (
                <div>
                  <div className="flex items-center gap-2 text-pink-500 font-bold mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-wider">Date</span>
                  </div>
                  <p className="text-gray-700 font-medium">{idea.suggestedDate}</p>
                </div>
              )}
              {idea.suggestedLocation && (
                <div>
                  <div className="flex items-center gap-2 text-orange-500 font-bold mb-1">
                    <MapPin className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-wider">Location</span>
                  </div>
                  <p className="text-gray-700 font-medium">{idea.suggestedLocation}</p>
                </div>
              )}
              {idea.monetaryRequirement && (
                <div>
                  <div className="flex items-center gap-2 text-green-500 font-bold mb-1">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-wider">Budget</span>
                  </div>
                  <p className="text-gray-700 font-medium">{idea.monetaryRequirement}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <CommentSection
          ideaId={idea.id}
          comments={idea.comments}
          currentUserId={session?.user?.id || ""}
          currentUserRole={session?.user?.role}
        />
      </div>
    </main>
  );
}
