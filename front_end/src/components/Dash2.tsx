"use client";

import { useState } from "react";
import { CopilotPopup } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, X, Search } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useCopilotReadable } from "@copilotkit/react-core";

interface NewsItem {
  id: string;
  title: string;
  content: string;
}

const fetchNews = async (topic: string): Promise<NewsItem[]> => {
  const response = await fetch("https://news-aggregator-production-a8fd.up.railway.app/api/get-news", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic }),
  });

  if (!response.ok) {
    toast.error("An error occurred, please try again.");
    return [];
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    toast.error("Unexpected API response format.");
    return [];
  }

  return data as NewsItem[];
};

const updateHistory = async (topic: string) => {
  const response = await fetch("/api/history", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic }),
  });
  if (!response.ok) throw new Error("Failed to update history");
};

export default function Dashboard() {
  const [topic, setTopic] = useState<string>("");
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  useCopilotReadable({
    description: "The state of the searched news topics",
    value: JSON.stringify(news),
  });

  const handleSearch = async (searchTopic: string) => {
    if (!searchTopic.trim()) {
      toast.warn("Please enter a topic to search");
      return;
    }

    setLoading(true);
    setTopic(searchTopic);
    try {
      const results = await fetchNews(searchTopic);
      setNews(results);
      await updateHistory(searchTopic);

      if (results.length === 0) {
        toast.info(`No news found for "${searchTopic}"`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 flex flex-col antialiased">
      
     
      <img
        src="/globe.jpg"
        alt="News Banner"
        className="w-full h-64 object-cover mb-4"
      />

      <header className="flex justify-center py-6">
        <h1 className="text-4xl font-extrabold text-orange-600">
          AI News
        </h1>
      </header>

      {/* Search Bar */}
      <div className="container mx-auto px-4 flex justify-center mb-8">
        <Input
          className="w-full md:w-3/5 rounded-full border-0 bg-white text-black focus:ring-orange-500 placeholder-gray-500 px-5 py-3 shadow-lg"
          placeholder="Search here"
          value={topic}
          required
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch(topic)}
        />
        <Button
          className="ml-4 rounded-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 transition-all duration-300 ease-in-out shadow-md"
          onClick={() => handleSearch(topic)}
        >
          <Search className="h-5 w-5 text-white" />
        </Button>
      </div>

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-16 w-16 text-orange-600 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {news.map((item) => (
              <Card
                key={item.id}
                className="group cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 rounded-lg overflow-hidden border border-gray-200"
                onClick={() => setSelectedNews(item)}
              >
                <CardHeader className="bg-orange-100 p-4">
                  <CardTitle className="line-clamp-2 font-semibold text-black text-base">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 bg-white text-gray-700 line-clamp-3">
                  <p className="line-clamp-3">{item.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {news.length === 0 && !loading && (
          <div className="text-center py-16 text-gray-500">
            <p className="text-xl font-semibold">AI News Search </p>
            <p className="text-sm mt-2">Find any news fast on one click!</p>
          </div>
        )}
      </main>

      {selectedNews && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedNews(null)}
        >
          <Card
            className="w-full max-w-3xl max-h-[85vh] overflow-auto bg-white rounded-lg shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="sticky top-0 bg-orange-600 text-white flex justify-between p-5 rounded-t-lg">
              <CardTitle className="text-xl font-bold">
                {selectedNews.title}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-orange-700/30 rounded-full"
                onClick={() => setSelectedNews(null)}
              >
                <X className="h-6 w-6" />
              </Button>
            </CardHeader>
            <CardContent className="p-6 text-gray-800 space-y-4">
              <p className="leading-relaxed text-base">
                {selectedNews.content}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <CopilotPopup
        className="mb-36"
        labels={{
          title: "News Assistant",
          initial: "Hi! 👋 Need help understanding a news topic?",
        }}
      />
    </div>
  );
}
