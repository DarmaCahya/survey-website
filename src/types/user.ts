export type User = {
    id: number;
    email: string;
    name: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
};

export type Progress = {
    totalAssets: number;
    completedAssets: number;
    inProgressAssets: number;
    notStartedAssets: number;
    progressPercentage: number;
    remainingForms: number;
};


export type UserData = {
    user: User;
    progress: Progress;
};