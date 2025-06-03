"use client";
import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from 'next/navigation';
interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

  const navigateWithLoader = async (path: string) => {
    setLoading(true);
    router.push(path);
  };

    useEffect(() => {
    setLoading(false);
  }, [pathname]);
  const fetchAndDownloadDockerImage = async () => {
        setLoading(true);
    try {
      const response = await fetch("/api/load-and-push-ecr", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, 
        },
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        console.error("Error fetching file URL:", errorMessage);
        return;
      }

      const data = await response.json();
      console.log(data, "dataaa");
      setFileUrl(data.imageName[0].s3_url || null);
    } catch (error) {
      console.error("Error during API call:", error);
      alert(
        "An unexpected error occurred while fetching and downloading the Docker image."
      );
    }finally {
      setLoading(false);
    } 
  };

  const handlePushImage = async () => {
    if (!fileUrl) {
      alert("No Docker image downloaded. Please download the image first.");
      return;
    }
    setLoading(true);

    try {
      const repoName =
        prompt("Enter the ECR repository name:", "my-ecr-repo") ||
        "my-ecr-repo";

      const response = await fetch(
        `/api/load-and-push-ecr?repoName=${encodeURIComponent(repoName)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        const errorMessage = await response.text();
        console.error("Error during Docker image push:", errorMessage);
        alert("Failed to push Docker image. Please try again.");
        return;
      }

      const data = await response.json();
      alert(`Docker image successfully pushed to ECR: ${data.imageName}`);
    } catch (error) {
      console.error("Error during API call:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="flex h-screen">
      {loading && (
        <div className="fixed top-0 left-0 w-full h-full bg-white/60 z-50 flex justify-center items-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}

      <aside className="w-64 bg-[#0b1c2c] text-white p-5 flex flex-col shadow-lg">
        <h2 className="text-2xl font-bold border-b-2 border-[#1e3a5f] pb-2 mb-4">Agent Protocol</h2>

        <div className="flex-grow">
          <ul className="space-y-3">
            <li>
              <button onClick={() => navigateWithLoader("/")} className="w-full bg-gradient-to-r from-[#02213b91] to-[#004f8f91] text-white py-2 px-4 rounded-lg font-semibold shadow hover:from-[#0f518691] hover:to-[#007fe791] hover:shadow-lg transition-all">
                Connect Wallet
              </button>
            </li>
            <li>
              <button onClick={() => navigateWithLoader("/upload")} className="w-full bg-gradient-to-r from-[#02213b91] to-[#004f8f91] text-white py-2 px-4 rounded-lg font-semibold shadow hover:from-[#0f518691] hover:to-[#007fe791] hover:shadow-lg transition-all">
                Upload Docker Image
              </button>
            </li>
            <li>
              <button onClick={() => navigateWithLoader("/chat")} className="w-full bg-gradient-to-r from-[#02213b91] to-[#004f8f91] text-white py-2 px-4 rounded-lg font-semibold shadow hover:from-[#0f518691] hover:to-[#007fe791] hover:shadow-lg transition-all">
                Chat Bot
              </button>
            </li>
            <li>
              <button onClick={fetchAndDownloadDockerImage} className="w-full bg-gradient-to-r from-[#02213b91] to-[#004f8f91] text-white py-2 px-4 rounded-lg font-semibold shadow hover:from-[#0f518691] hover:to-[#007fe791] hover:shadow-lg transition-all">
                Download Image
              </button>
                </li>
                <li>
              <button onClick={handlePushImage} className="w-full bg-gradient-to-r from-[#02213b91] to-[#004f8f91] text-white py-2 px-4 rounded-lg font-semibold shadow hover:from-[#0f518691] hover:to-[#007fe791] hover:shadow-lg transition-all">
                Push to Registry
              </button>
                </li>
            <li className="mt-auto">
          <Link href="/donate" className="block text-center bg-[#112b45] text-[#b0c7f2] py-3 rounded-lg shadow-md hover:-translate-y-1 hover:shadow-lg transition-all">
            <h2 className="text-lg">Stripe Payment</h2>
          </Link>
        </li>
          </ul>
        </div>

      
      </aside>
      <main className="flex-1 bg-gray-100 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
