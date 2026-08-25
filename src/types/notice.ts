export type NoticeCategory = "Result" | "Datesheet" | "Inspection" | "Notice";

export interface GGSIPUNotice {
  id: string;
  title: string;
  date: string;
  url: string;
  category: NoticeCategory;
}
