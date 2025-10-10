import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";

const MS365Callback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const error = searchParams.get("error");

      if (error) {
        setStatus("error");
        setErrorMessage(`OAuth Error: ${error}`);
        setTimeout(() => {
          navigate("/admin/crm/contacts?error=" + encodeURIComponent(error));
        }, 2000);
        return;
      }

      if (!code || !state) {
        setStatus("error");
        setErrorMessage("Missing authorization parameters");
        setTimeout(() => {
          navigate("/admin/crm/contacts?error=missing_params");
        }, 2000);
        return;
      }

      try {
        // Call the edge function with the full URL including the query parameters
        const callbackUrl = window.location.href;
        const response = await fetch(
          `https://pcbpxhzaajbycxwompif.supabase.co/functions/v1/ms365-oauth-callback${window.location.search}`,
          {
            method: "GET",
            redirect: "manual",
          }
        );

        // The edge function will handle the redirect, but if we get here, something went wrong
        if (response.status === 0) {
          // This means a redirect happened, which is expected
          setStatus("success");
          setTimeout(() => {
            navigate("/admin/crm/contacts?ms365=connected");
          }, 1000);
        } else {
          setStatus("error");
          setErrorMessage("Failed to connect Microsoft 365 account");
          setTimeout(() => {
            navigate("/admin/crm/contacts?error=connection_failed");
          }, 2000);
        }
      } catch (error: any) {
        console.error("Error processing MS365 callback:", error);
        setStatus("error");
        setErrorMessage(error.message || "Connection failed");
        setTimeout(() => {
          navigate("/admin/crm/contacts?error=" + encodeURIComponent(error.message));
        }, 2000);
      }
    };

    processCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
      <div className="text-center space-y-4 p-8 bg-card rounded-lg shadow-lg max-w-md">
        {status === "loading" && (
          <>
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <h1 className="text-2xl font-bold">Verbinde Microsoft 365...</h1>
            <p className="text-muted-foreground">
              Bitte warten Sie, während wir Ihr Konto verbinden.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="h-12 w-12 mx-auto rounded-full bg-green-100 flex items-center justify-center">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-green-600">Erfolgreich verbunden!</h1>
            <p className="text-muted-foreground">
              Sie werden weitergeleitet...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="h-12 w-12 mx-auto rounded-full bg-red-100 flex items-center justify-center">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-red-600">Verbindung fehlgeschlagen</h1>
            <p className="text-muted-foreground">{errorMessage}</p>
            <p className="text-sm text-muted-foreground">
              Sie werden zur CRM-Übersicht weitergeleitet...
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default MS365Callback;
