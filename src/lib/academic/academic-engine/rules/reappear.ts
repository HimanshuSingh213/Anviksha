import {
  decodeStatus,
  getDefaultCredit,
  isSubjectPassed,
  resolvePaperCredit,
} from "../subject-results";
import type {
  ReappearSessionPlan,
  ReappearSubject,
  SubjectResult,
} from "@/types/result";

/**
 * Type guard verifying whether an input array consists of domain SubjectResult objects.
 *
 * @param items - Array of unknown objects
 * @returns True if array contains parsed SubjectResult objects
 */
function isSubjectResults(items: unknown[]): items is SubjectResult[] {
  return (
    items.length > 0 &&
    typeof items[0] === "object" &&
    items[0] !== null &&
    "semantic" in items[0]
  );
}

/**
 * Analyzes uncleared subjects (backlogs, detentions, absentees) and schedules them into odd-semester (winter)
 * and even-semester (summer) re-appear examination sessions with priority rankings.
 *
 * @param allResults - List of SubjectResults or raw marksheet rows
 * @param customCredits - Optional map of user-overridden paper credits
 * @returns Structured ReappearSessionPlan with session windows, backlog lists, and risk credits
 */
export function getReappearSessionPlan(
  allResults: SubjectResult[] | any[][],
  customCredits: Record<string, number | null> = {}
): ReappearSessionPlan {
  // Fast path: if already parsed subject results are provided, evaluate without re-parsing
  if (isSubjectResults(allResults)) {
    const oddTermBacklogs: ReappearSubject[] = [];
    const evenTermBacklogs: ReappearSubject[] = [];
    let totalCreditsAtRisk = 0;

    let maxSemEvaluated = 0;
    allResults.forEach((subject) => {
      const semNum = Number(subject.semester);
      if (!isNaN(semNum) && semNum >= 1 && semNum > maxSemEvaluated) {
        maxSemEvaluated = semNum;
      }
    });

    allResults.forEach((subject) => {
      const semNum = Number(subject.semester);
      if (isNaN(semNum) || semNum < 1) return;

      const semantic = subject.semantic;
      const isPassed = isSubjectPassed(semantic);
      if (!isPassed) {
        const isOddSem = semNum % 2 !== 0;
        const credit = subject.credits.value ?? 0;
        totalCreditsAtRisk += credit;

        let priority: "HIGH" | "MEDIUM" | "STANDARD" = "STANDARD";
        let priorityReason = "Standard re-appear timeline";

        if (semantic === "DETAINED") {
          priority = "HIGH";
          priorityReason = "Attendance / Subject Detention (Registration Required)";
        } else if (semNum <= 2 && maxSemEvaluated >= 3) {
          priority = "HIGH";
          priorityReason = "First Year Backlog (Promotional Standing Critical)";
        } else if (credit >= 4) {
          priority = "HIGH";
          priorityReason = `High Credit Weight (${credit} Credits Impact)`;
        } else if (semNum % 2 !== maxSemEvaluated % 2) {
          priority = "MEDIUM";
          priorityReason = "Immediate Upcoming Exam Window";
        }

        const item: ReappearSubject = {
          semester: semNum,
          paperCode: subject.rawCode,
          subjectTitle: subject.name,
          marks: subject.total !== undefined ? subject.total : "–",
          maxMarks: subject.maxMarks ?? 100,
          credit,
          isOddSem,
          resultState: semantic,
          sessionType: isOddSem ? "ODD_TERM" : "EVEN_TERM",
          sessionWindow: isOddSem
            ? "Typical Nov - Dec Winter Window"
            : "Typical May - Jun Summer Window",
          priority,
          priorityReason,
        };

        if (isOddSem) {
          oddTermBacklogs.push(item);
        } else {
          evenTermBacklogs.push(item);
        }
      }
    });

    const priorityOrder = { HIGH: 0, MEDIUM: 1, STANDARD: 2 };
    oddTermBacklogs.sort(
      (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority] || a.semester - b.semester
    );
    evenTermBacklogs.sort(
      (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority] || a.semester - b.semester
    );

    const oddTermCredits = oddTermBacklogs.reduce((acc, curr) => acc + curr.credit, 0);
    const evenTermCredits = evenTermBacklogs.reduce((acc, curr) => acc + curr.credit, 0);
    const totalBacklogs = oddTermBacklogs.length + evenTermBacklogs.length;
    const cleanRecord = totalBacklogs === 0;

    let nextRecommendedSession: "ODD" | "EVEN" | "NONE" = "NONE";
    let nextSessionLabel = "All Semesters Cleared";

    if (!cleanRecord) {
      const nextIsEven = maxSemEvaluated % 2 !== 0;
      if (nextIsEven) {
        if (evenTermBacklogs.length > 0) {
          nextRecommendedSession = "EVEN";
        } else if (oddTermBacklogs.length > 0) {
          nextRecommendedSession = "ODD";
        } else {
          nextRecommendedSession = "NONE";
        }
        nextSessionLabel = "Typical Upcoming: May - Jun (Even Term Re-appear)";
      } else {
        if (oddTermBacklogs.length > 0) {
          nextRecommendedSession = "ODD";
        } else if (evenTermBacklogs.length > 0) {
          nextRecommendedSession = "EVEN";
        } else {
          nextRecommendedSession = "NONE";
        }
        nextSessionLabel = "Typical Upcoming: Nov - Dec (Odd Term Re-appear)";
      }
    }

    return {
      totalBacklogs,
      totalCreditsAtRisk,
      oddTermBacklogs,
      evenTermBacklogs,
      oddTermCredits,
      evenTermCredits,
      nextRecommendedSession,
      nextSessionLabel,
      cleanRecord,
    };
  }

  // Fallback path: parse raw rows
  const oddTermBacklogs: ReappearSubject[] = [];
  const evenTermBacklogs: ReappearSubject[] = [];
  let totalCreditsAtRisk = 0;

  let maxSemEvaluated = 0;
  allResults.forEach((row) => {
    const semNum = Number(row[0]);
    if (!isNaN(semNum) && semNum >= 1 && semNum > maxSemEvaluated) {
      maxSemEvaluated = semNum;
    }
  });

  allResults.forEach((row) => {
    const semNum = Number(row[0]);
    if (isNaN(semNum) || semNum < 1) return;

    const rawTotal = row[5];
    const statusCode = row[6];
    const paperCode = String(row[1] ?? "");
    const subjectTitle = String(row[2] ?? "");
    const credit = resolvePaperCredit(paperCode, customCredits, getDefaultCredit(subjectTitle));

    const semantic = decodeStatus(statusCode, rawTotal);
    const isPassed = isSubjectPassed(semantic);

    if (!isPassed) {
      const isOddSem = semNum % 2 !== 0;
      totalCreditsAtRisk += credit;

      let priority: "HIGH" | "MEDIUM" | "STANDARD" = "STANDARD";
      let priorityReason = "Standard re-appear timeline";

      if (semantic === "DETAINED") {
        priority = "HIGH";
        priorityReason = "Attendance / Subject Detention (Registration Required)";
      } else if (semNum <= 2 && maxSemEvaluated >= 3) {
        priority = "HIGH";
        priorityReason = "First Year Backlog (Promotional Standing Critical)";
      } else if (credit >= 4) {
        priority = "HIGH";
        priorityReason = `High Credit Weight (${credit} Credits Impact)`;
      } else if (semNum % 2 !== maxSemEvaluated % 2) {
        priority = "MEDIUM";
        priorityReason = "Immediate Upcoming Exam Window";
      }

      const item: ReappearSubject = {
        semester: semNum,
        paperCode,
        subjectTitle,
        marks: isNaN(Number(rawTotal)) ? String(rawTotal || "–") : Number(rawTotal),
        maxMarks: 100,
        credit,
        isOddSem,
        resultState: semantic,
        sessionType: isOddSem ? "ODD_TERM" : "EVEN_TERM",
        sessionWindow: isOddSem
          ? "Typical Nov - Dec Winter Window"
          : "Typical May - Jun Summer Window",
        priority,
        priorityReason,
      };

      if (isOddSem) {
        oddTermBacklogs.push(item);
      } else {
        evenTermBacklogs.push(item);
      }
    }
  });

  const priorityOrder = { HIGH: 0, MEDIUM: 1, STANDARD: 2 };
  oddTermBacklogs.sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority] || a.semester - b.semester
  );
  evenTermBacklogs.sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority] || a.semester - b.semester
  );

  const oddTermCredits = oddTermBacklogs.reduce((acc, curr) => acc + curr.credit, 0);
  const evenTermCredits = evenTermBacklogs.reduce((acc, curr) => acc + curr.credit, 0);
  const totalBacklogs = oddTermBacklogs.length + evenTermBacklogs.length;
  const cleanRecord = totalBacklogs === 0;

  let nextRecommendedSession: "ODD" | "EVEN" | "NONE" = "NONE";
  let nextSessionLabel = "All Semesters Cleared";

  if (!cleanRecord) {
    const nextIsEven = maxSemEvaluated % 2 !== 0;
    if (nextIsEven) {
      if (evenTermBacklogs.length > 0) {
        nextRecommendedSession = "EVEN";
      } else if (oddTermBacklogs.length > 0) {
        nextRecommendedSession = "ODD";
      } else {
        nextRecommendedSession = "NONE";
      }
      nextSessionLabel = "Typical Upcoming: May - Jun (Even Term Re-appear)";
    } else {
      if (oddTermBacklogs.length > 0) {
        nextRecommendedSession = "ODD";
      } else if (evenTermBacklogs.length > 0) {
        nextRecommendedSession = "EVEN";
      } else {
        nextRecommendedSession = "NONE";
      }
      nextSessionLabel = "Typical Upcoming: Nov - Dec (Odd Term Re-appear)";
    }
  }

  return {
    totalBacklogs,
    totalCreditsAtRisk,
    oddTermBacklogs,
    evenTermBacklogs,
    oddTermCredits,
    evenTermCredits,
    nextRecommendedSession,
    nextSessionLabel,
    cleanRecord,
  };
}
