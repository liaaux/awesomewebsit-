import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BarChart3, Users, ThumbsUp, Percent } from "lucide-react";

export default async function StatsPage() {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  // Total unique non-admin users
  const totalNonAdminUsers = await prisma.user.count({
    where: { role: { not: "ADMIN" } },
  });

  // Ideas with non-admin upvote counts
  const ideasWithStats = await prisma.idea.findMany({
    include: {
      author: { select: { name: true } },
      upvotes: {
        where: {
          user: { role: { not: "ADMIN" } }
        }
      }
    }
  });

  const stats = ideasWithStats.map(idea => {
    const voteCount = idea.upvotes.length;
    const engagementRate = totalNonAdminUsers > 0
      ? (voteCount / totalNonAdminUsers) * 100
      : 0;

    return {
      id: idea.id,
      title: idea.title,
      author: idea.author.name,
      voteCount,
      engagementRate: engagementRate.toFixed(1)
    };
  }).sort((a, b) => b.voteCount - a.voteCount);

  return (
    <main className="min-h-screen bg-gray-50 pb-12">
      <nav className="bg-white border-b border-gray-200 py-4 mb-8 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 flex justify-between items-center">
          <Link href="/admin" className="flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-800 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Panel</span>
          </Link>
          <h1 className="text-xl font-black text-indigo-600 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            VOTING STATISTICS
          </h1>
          <div className="w-20"></div> {/* Spacer */}
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="text-center sm:text-left">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Total Eligible Voters</p>
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <Users className="w-8 h-8 text-indigo-600" />
              <span className="text-4xl font-black text-gray-900">{totalNonAdminUsers}</span>
            </div>
            <p className="text-xs text-gray-400 mt-2 italic">(Excludes admin accounts)</p>
          </div>
          <div className="h-px w-full sm:h-12 sm:w-px bg-gray-100"></div>
          <div className="text-center sm:text-right">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Active Ideas</p>
            <span className="text-4xl font-black text-gray-900">{stats.length}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">Event Idea</th>
                <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Votes</th>
                <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Engagement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-6">
                    <p className="font-black text-gray-900 leading-tight mb-1">{item.title}</p>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">By {item.author}</p>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center justify-center gap-2">
                      <ThumbsUp className="w-4 h-4 text-pink-500" />
                      <span className="font-black text-gray-800">{item.voteCount}</span>
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <div className="inline-flex items-center gap-1 bg-green-50 text-green-600 px-3 py-1 rounded-full text-sm font-black">
                      {item.engagementRate}%
                    </div>
                  </td>
                </tr>
              ))}
              {stats.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-12 text-center text-gray-400 italic">No ideas found to calculate statistics.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
