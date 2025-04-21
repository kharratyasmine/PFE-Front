export interface Distribution{
    id?: number;
    name: string;
    function: string;
    partial: boolean;
    complete: boolean;
    devisId: number;
    type: string; 
  }
  
  export interface Visa {
    id?: number;
    devisId: number;
    action: 'Written by' | 'Verified by' | 'Approved by';
    name: string;
    date: string; // format: yyyy-MM-dd
    visa: string;
  }

  export interface ProposalSummary {
    customer: string;
    project: string;
    projectType: string;
    proposalValidity: string;
    estimatedWorkload: string;
    possibleStartDate: Date;
    estimatedEndDate: Date;
    technicalAspect: string;
    organizationalAspect: string;
    commercialAspect: string;
    qualityAspect: string;
  }
  