"use client";

import { useActionState, useState } from "react";
import { createComment, updateComment } from "@/app/actions/comments";
import { User, Edit2 } from "lucide-react";

interface CommentSectionProps {
  ideaId: string;
  comments: any[];
  currentUserId: string;
}

export default function CommentSection({ ideaId, comments, currentUserId }: CommentSectionProps) {
  const [state, action, isPending] = useActionState(createComment, undefined);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Comments ({comments.length})</h2>

      <form action={action} className="mb-8">
        <input type="hidden" name="ideaId" value={ideaId} />
        <div className="flex flex-col gap-2">
          <textarea
            name="content"
            required
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            placeholder="What do you think of this idea?"
          />
          {state?.error && <p className="text-red-500 text-sm">{state.error}</p>}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50"
            >
              {isPending ? "Posting..." : "Post Comment"}
            </button>
          </div>
        </div>
      </form>

      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                <User className="w-6 h-6" />
              </div>
            </div>
            <div className="flex-grow">
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-gray-800">{comment.author.name}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(comment.createdAt).toLocaleString()}
                    {comment.updatedAt !== comment.createdAt && " (edited)"}
                  </span>
                </div>

                {editingId === comment.id ? (
                  <EditCommentForm
                    comment={comment}
                    onCancel={() => setEditingId(null)}
                    onSuccess={() => setEditingId(null)}
                  />
                ) : (
                  <>
                    <p className="text-gray-600 whitespace-pre-wrap">{comment.content}</p>
                    {comment.authorId === currentUserId && (
                      <button
                        onClick={() => setEditingId(comment.id)}
                        className="mt-3 flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-indigo-600 transition-colors"
                      >
                        <Edit2 className="w-3 h-3" />
                        Edit Comment
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EditCommentForm({ comment, onCancel, onSuccess }: { comment: any, onCancel: () => void, onSuccess: () => void }) {
  const [state, action, isPending] = useActionState(async (prevState: any, formData: FormData) => {
    const result = await updateComment(prevState, formData);
    if (!result?.error) {
      onSuccess();
    }
    return result;
  }, undefined);

  return (
    <form action={action} className="mt-2">
      <input type="hidden" name="commentId" value={comment.id} />
      <textarea
        name="content"
        defaultValue={comment.content}
        required
        rows={2}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
      />
      {state?.error && <p className="text-red-500 text-sm">{state.error}</p>}
      <div className="flex justify-end gap-2 mt-2">
        <button
          type="button"
          onClick={onCancel}
          className="text-sm font-semibold text-gray-500 hover:text-gray-700 px-3 py-1"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold py-1 px-4 rounded transition-colors disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
