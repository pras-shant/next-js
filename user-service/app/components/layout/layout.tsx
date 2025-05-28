"use client";
import { ReactNode, useEffect, useState } from "react";
import "./layout.css"; // Import the CSS file for styling
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
  // Fetch and download Docker image from the backend
  const fetchAndDownloadDockerImage = async () => {
        setLoading(true);
    try {
      const response = await fetch("/api/load-and-push-ecr", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Replace with your token logic
        },
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        console.error("Error fetching file URL:", errorMessage);
        // alert("Failed to fetch and download Docker image. Please try again.");
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

  // Push the Docker image to ECR
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
    <div className="layout-container">
      {loading && (
        <div className="loader-overlay">
          <div className="spinner" />
        </div>
      )}
      <aside className="layout-sidebar">
        <h2>Agent Protocol</h2>
        <div className="nav-links-container">
          <ul>
            <li>
               <button onClick={() => navigateWithLoader('/')}>Connect Wallet</button>
            </li>
            <li>
               <button onClick={() => navigateWithLoader('/upload')}>Upload Docker Image</button>
            </li>
            <li>
                   <button onClick={() => navigateWithLoader('/chat')}>Chat Bot</button>

            </li>
            <li>
              <>
                <button onClick={fetchAndDownloadDockerImage}>
                  Download Image
                </button>

                <button onClick={handlePushImage}>Push to Registry</button>
              </>
            </li>
          </ul>
        </div>
        <div className="donate-container">
          <Link href="/donate" className="card elements-style-background">
            <h2 className="bottom">Donate with Elements</h2>
            <img src="/elements-card-payment.svg" alt="Donate" />
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="layout-main">{children}</main>
    </div>
  );
}
