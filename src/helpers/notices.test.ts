import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchGGSIPUNotices } from "./notices";

const mockHtml = `
<table>
  <tr>
    <td>Final Datesheet for B.Tech 4th Sem May 2026</td>
    <td><a href="/Pubinfo2026/datesheet123.pdf">Click here</a></td>
    <td>25-08-2026</td>
  </tr>
  <tr>
    <td>Declared Result of BCA 2nd Semester</td>
    <td><a href="http://www.ipu.ac.in/results/bca2.pdf">Download</a></td>
    <td>24-08-2026</td>
  </tr>
  <tr>
    <td>Inspection of Evaluated Answer Sheets for BBA</td>
    <td><a href="/Pubinfo2026/inspection.pdf">List</a></td>
    <td>20-08-2026</td>
  </tr>
</table>
`;

describe("fetchGGSIPUNotices", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("parses HTML notices table correctly into structured objects", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => mockHtml,
    } as any);

    const notices = await fetchGGSIPUNotices();
    expect(notices).toHaveLength(3);

    expect(notices[0].title).toBe("Final Datesheet for B.Tech 4th Sem May 2026");
    expect(notices[0].category).toBe("Datesheet");
    expect(notices[0].url).toBe("http://www.ipu.ac.in/Pubinfo2026/datesheet123.pdf");

    expect(notices[1].title).toBe("Declared Result of BCA 2nd Semester");
    expect(notices[1].category).toBe("Result");
    expect(notices[1].url).toBe("http://www.ipu.ac.in/results/bca2.pdf");

    expect(notices[2].category).toBe("Inspection");
  });

  it("handles fetch network failure gracefully by returning empty array", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network timeout"));

    const notices = await fetchGGSIPUNotices();
    expect(notices).toEqual([]);
  });
});
