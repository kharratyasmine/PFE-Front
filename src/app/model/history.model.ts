export interface History {
    id?: number;
    action: string;
    modificationDescription: string;
    name: string;
    version : string;
    date: Date;
    devisId?: number;
  }
  
 export interface GroupedHistory {
    version: string;
    description: string;
    actions: { [action: string]: History };
  }
  