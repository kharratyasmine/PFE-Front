export interface Deliveries {
    id: number;
    deliveriesName: string;
    description: string;
    version: string;
    plannedDate: string;
    effectiveDate: string;
    status: 'Planned' | 'Delivered' | 'Late';
    deliverySupport?: string;
    customerFeedback?: 'Accepted' | 'Refused' | 'No Feedback';
    psrId: number;
    
  }
  