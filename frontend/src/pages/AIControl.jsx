import AIControlHeader from "../components/ai-control/AIControlHeader";
import AssessmentStatus from "../components/ai-control/AssessmentStatus";
import AgentWorkflow from "../components/ai-control/AgentWorkflow";
import AssessmentSummary from "../components/ai-control/AssessmentSummary";
import PrioritizedIncidents from "../components/ai-control/PrioritizedIncidents";
import ResponsePlan from "../components/ai-control/ResponsePlan";
import ApprovalControls from "../components/ai-control/ApprovalControls";

import aiResponse from "../../public/data/aiResponse";

function AIControl() {
  return (
    <div>
      
      <AIControlHeader />
      <AssessmentStatus />
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AgentWorkflow />
        <AssessmentSummary />
      </div>

      <PrioritizedIncidents />

      <ResponsePlan />
      <ApprovalControls />

    </div>
  );
}

export default AIControl;