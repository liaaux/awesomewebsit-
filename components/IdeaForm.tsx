"use client";

import { useActionState } from "react";
import { createIdea } from "@/app/actions/ideas";

export default function IdeaForm() {
  const [state, action, isPending] = useActionState(createIdea, undefined);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Share a New Event Idea</h2>
      <form action={action} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              name="title"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
              placeholder="e.g., Year 12 Gala Night"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              required
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
              placeholder="Tell us more about your idea..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Suggested Date</label>
            <input
              type="text"
              name="suggestedDate"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
              placeholder="e.g., Late November"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Suggested Location</label>
            <input
              type="text"
              name="suggestedLocation"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
              placeholder="e.g., School Hall"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Monetary Requirement</label>
            <input
              type="text"
              name="monetaryRequirement"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
              placeholder="e.g., $20 entry fee"
            />
          </div>
        </div>
        {state?.error && <p className="text-red-500 text-sm">{state.error}</p>}
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-md shadow-sm transition-colors disabled:opacity-50"
        >
          {isPending ? "Posting..." : "Post Idea"}
        </button>
      </form>
    </div>
  );
}
