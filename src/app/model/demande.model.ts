export interface Demande {

    id? : number;
    name: string;
    dateDebut : string;
    dateFin : string;
    clientId: number | null;
    clientFirstname?: string;
    projectId: Number | null;
    projectName? : string;
    teamMemberIds: Set<number>; 
    requirements:string;
    scope:string;

}