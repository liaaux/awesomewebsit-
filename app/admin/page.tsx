import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, Lightbulb, ShieldAlert, BarChart3, ArrowLeft, Trash2, Pin, PinOff, Ban, UserCheck } from "lucide-react";
import { deleteIdea, togglePinIdea, toggleBanUser } from "@/app/actions/admin";

export default async function AdminDashboard() {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const users = await prisma.user.findMany({
    where: { role: { not: "ADMIN" } },
    orderBy: { email: "asc" },
  });

  const ideas = await prisma.idea.findMany({
    include: {
      author: { select: { name: true, email: true } },
    },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
  });

  return (
    <main className="min-h-screen bg-gray-50 pb-12">
      <nav className="bg-white border-b border-gray-200 py-4 mb-8 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-800 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Site</span>
          </Link>
          <h1 className="text-xl font-black text-pink-600 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6" />
            ADMIN PANEL
          </h1>
          <Link href="/admin/stats" className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors">
            <BarChart3 className="w-4 h-4" />
            Statistics
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Management */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center gap-2 bg-gray-50">
              <Users className="w-5 h-5 text-indigo-600" />
              <h2 className="font-black text-gray-800 uppercase tracking-wider text-sm">User Management</h2>
            </div>
            <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
              {users.map((user) => (
                <div key={user.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    {user.isBanned && (
                      <span className="inline-block mt-1 bg-red-100 text-red-600 text-[10px] font-black px-2 py-0.5 rounded uppercase">Banned</span>
                    )}
                  </div>
                  <form action={async () => { "use server"; await toggleBanUser(user.id); }}>
                    <button
                      type="submit"
                      className={`p-2 rounded-lg transition-colors ${user.isBanned ? "bg-green-50 text-green-600 hover:bg-green-100" : "bg-red-50 text-red-600 hover:bg-red-100"}`}
                      title={user.isBanned ? "Unban User" : "Ban User"}
                    >
                      {user.isBanned ? <UserCheck className="w-5 h-5" /> : <Ban className="w-5 h-5" />}
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Idea Management */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center gap-2 bg-gray-50">
              <Lightbulb className="w-5 h-5 text-orange-600" />
              <h2 className="font-black text-gray-800 uppercase tracking-wider text-sm">Idea Management</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {ideas.map((idea) => (
                <div key={idea.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-black text-gray-900 text-lg leading-tight">{idea.title}</h3>
                      <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mt-1">By {idea.author.name} ({idea.author.email})</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <form action={async () => { "use server"; await togglePinIdea(idea.id); }}>
                        <button
                          type="submit"
                          className={`p-2 rounded-lg transition-colors ${idea.isPinned ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-400 hover:text-orange-600"}`}
                          title={idea.isPinned ? "Unpin Idea" : "Pin Idea"}
                        >
                          {idea.isPinned ? <PinOff className="w-5 h-5" /> : <Pin className="w-5 h-5" />}
                        </button>
                      </form>
                      <form action={async () => { "use server"; await deleteIdea(idea.id); }}>
                        <button
                          type="submit"
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                          title="Delete Idea"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </form>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2 mt-2">{idea.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
