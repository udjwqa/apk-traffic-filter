import type {
  TrafficDataPoint,
  RejectionReason,
} from "@/lib/types/dashboard";
import { TrafficChart } from "./traffic-chart";
import { RejectionChart } from "./rejection-chart";

interface ChartsSectionProps {
  trafficData: TrafficDataPoint[];
  rejectionReasons: RejectionReason[];
  isLoading: boolean;
}

export function ChartsSection({
  trafficData,
  rejectionReasons,
  isLoading,
}: ChartsSectionProps) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <TrafficChart data={trafficData} isLoading={isLoading} />
      <RejectionChart data={rejectionReasons} isLoading={isLoading} />
    </div>
  );
}
