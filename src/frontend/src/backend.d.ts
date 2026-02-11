import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Sedekah {
    completed: boolean;
    paymentLink?: string;
    amount?: bigint;
}
export interface Murojaah {
    verseStart: bigint;
    surah: string;
    verseEnd: bigint;
}
export interface Sholat {
    asr: boolean;
    maghrib: boolean;
    fajr: boolean;
    isha: boolean;
    tarawih: boolean;
    dhuha: boolean;
    dhuhr: boolean;
    qiyamulLail: boolean;
}
export type Date_ = bigint;
export interface Tahfidz {
    verseStart: bigint;
    surah: string;
    verseEnd: bigint;
}
export interface Tilawah {
    verseStart: bigint;
    surah: string;
    verseEnd: bigint;
}
export interface Task {
    murojaah?: Murojaah;
    sholat?: Sholat;
    tilawah?: Tilawah;
    tahfidz?: Tahfidz;
    fasting?: Fasting;
    sedekah?: Sedekah;
}
export interface Fasting {
    note?: string;
    isFasting: boolean;
}
export interface DailyContent {
    motivation: string;
    hadith: string;
    quranReflection: string;
}
export interface UserProfile {
    name: string;
    isActive: boolean;
    email: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createOrUpdateContent(contentType: bigint, content: DailyContent): Promise<void>;
    createOrUpdateTask(date: Date_, task: Task): Promise<void>;
    createOrUpdateTaskForUser(user: Principal, date: Date_, task: Task): Promise<void>;
    createUser(user: Principal, profile: UserProfile): Promise<void>;
    deactivateUser(user: Principal): Promise<void>;
    deleteContent(contentType: bigint): Promise<void>;
    getAllUsers(): Promise<Array<Principal>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getContents(): Promise<Array<DailyContent>>;
    getSedekahPaymentLink(): Promise<string>;
    getTask(date: Date_): Promise<Task | null>;
    getTaskForUser(user: Principal, date: Date_): Promise<Task | null>;
    getTasksInRange(startDate: Date_, endDate: Date_): Promise<Array<[Date_, Task]>>;
    getTasksInRangeForUser(user: Principal, startDate: Date_, endDate: Date_): Promise<Array<[Date_, Task]>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserStatistics(user: Principal, startDate: Date_, endDate: Date_): Promise<{
        tilawahEntries: bigint;
        fastingDays: bigint;
        tahfidzEntries: bigint;
        murojaahEntries: bigint;
        sholatStats: {
            asr: bigint;
            maghrib: bigint;
            fajr: bigint;
            isha: bigint;
            tarawih: bigint;
            dhuha: bigint;
            dhuhr: bigint;
            qiyamulLail: bigint;
        };
        sedekahDays: bigint;
    }>;
    isCallerAdmin(): Promise<boolean>;
    reactivateUser(user: Principal): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setSedekahPaymentLink(link: string): Promise<void>;
    updateUserProfile(user: Principal, profile: UserProfile): Promise<void>;
}
