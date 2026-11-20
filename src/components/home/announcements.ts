export interface Announcement {
  id: string;
  badge?: string;
  title: string;
  body: string;
  deadline: string; // YYYY-MM-DD
  cta?: { label: string; href: string };
}

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: "appearing-list-launch",
    badge: "New",
    title: "Your appearing list is now in Anviksha",
    body: "Sign in and open the Appearing List tab to see every paper you are appearing in this semester, pulled live from the university exam portal along with the fee details.",
    deadline: "2027-01-04",
    cta: { label: "Open appearing list", href: "/rc" },
  },
  {
    id: "live-circulars-feed",
    badge: "Live Feed",
    title: "Real-Time Examination Circulars & Date-Sheets",
    body: "Stay updated with official GGSIPU notices, revised date-sheets, certified copy inspection schedules, and result declarations pulled directly from ipu.ac.in.",
    deadline: "2027-01-04",
    cta: { label: "Browse notices", href: "/notices" },
  },
];

export function isAnnouncementActive(announcement: Announcement, now: Date = new Date()): boolean {
  const endOfDeadlineDay = new Date(`${announcement.deadline}T23:59:59`);
  return now.getTime() <= endOfDeadlineDay.getTime();
}

export function getActiveAnnouncements(list: Announcement[] = ANNOUNCEMENTS, now: Date = new Date()): Announcement[] {
  return list.filter((announcement) => isAnnouncementActive(announcement, now));
}
