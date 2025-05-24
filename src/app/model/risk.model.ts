export interface Risk {
    id?: number;
    description: string;
    origin?: string;
    category?: string;
    openDate?: Date | string;
    dueDate?: Date | string;
    causes?: string;
    consequences?: string;
    appliedMeasures?: string;
    probability?: string;
    gravity?: string;
    criticality?: string;
    measure?: string;
    riskAssessment?: string;
    riskTreatmentDecision?: string;
    justification?: string;
    idAction?: string;
    riskStat?: string;
    closeDate?: Date | string;
    impact?: string;
    mitigationPlan?: string;
  }
  