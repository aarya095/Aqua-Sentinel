const API_BASE_URL = "http://127.0.0.1:8000";


export async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);

    if (!response.ok) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}


export async function runNewAnalysis() {
  const response = await fetch(
    `${API_BASE_URL}/api/analysis/run`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(
      errorData?.detail || "Failed to run new analysis"
    );
  }

  return response.json();
}


export async function getOperationsSummary() {
  const response = await fetch(
    `${API_BASE_URL}/api/operations/summary`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch operations summary");
  }

  return response.json();
}


export async function getActiveIncidents() {
  const response = await fetch(
    `${API_BASE_URL}/api/operations/incidents`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch active incidents");
  }

  return response.json();
}

export async function getLatestResponsePlan() {
  const response = await fetch(
    `${API_BASE_URL}/api/operations/latest-response-plan`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch latest response plan");
  }

  return response.json();
}

export async function getResponsePlanHistory() {
  const response = await fetch(
    `${API_BASE_URL}/api/operations/response-plan-history`
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(
      errorData?.detail || "Failed to fetch response plan history"
    );
  }

  return response.json();
}