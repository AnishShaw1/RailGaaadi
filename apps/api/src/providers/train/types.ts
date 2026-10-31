import { TrainSummary, TrainStatus, TrainRoute } from '../../domain/types.js';

export interface TrainProvider {
  name: string;
  searchTrains(query: string): Promise<TrainSummary[]>;
  getRunningStatus(trainNumber: string, journeyDate: string): Promise<TrainStatus | null>;
  getRoute(trainNumber: string): Promise<TrainRoute | null>;
}
