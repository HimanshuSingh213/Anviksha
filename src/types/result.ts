export interface StudentProfile {
    nrollno: string;
    stname: string;
    byoa: number;
    yoa: number;
    prgcode: string;
    prgname: string;
    icode: string;
    iname: string;
}

export interface ResultData {
    report?: string;
    stprofile?: StudentProfile;
    header?: string[];
    stresult?: any[][];
}
