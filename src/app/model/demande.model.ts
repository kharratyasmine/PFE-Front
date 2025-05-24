export interface FakeMember {
    name: string;
    role: string;
    initial: string;
    note?: string;
}

export interface Demande {
    id?: number;
    name: string;
    dateDebut: string;
    dateFin: string;
    clientId: number | null;
    clientFirstname?: string;
    projectId: number | null;
    projectName?: string;
    teamMemberIds: number[];         
    fakeMembers?: FakeMember[];     
    scope: string;
    requirements?: string;           
    generatedTeamId?: number;
    generatedDevisId?: number;

}
