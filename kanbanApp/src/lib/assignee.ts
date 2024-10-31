export type Assignee = {
  name: "pumpkin" | "dracula" | "ghost" | "hat" | "spider";
  src: `/assignee/${string}.svg`;
};

export const assigneeMap: Record<Assignee["name"], Assignee> = {
  pumpkin: { name: "pumpkin", src: "/assignee/pumpkin.svg" },
  dracula: { name: "dracula", src: "/assignee/dracula.svg" },
  ghost: { name: "ghost", src: "/assignee/ghost.svg" },
  hat: { name: "hat", src: "/assignee/hat.svg" },
  spider: { name: "spider", src: "/assignee/spider.svg" },
};

export const getUnassignedAssignee = (assignees: Assignee[]): Assignee[] => {
  const unassignedAssignee = Object.values(assigneeMap).filter(
    (assignee) => !assignees.includes(assignee)
  );
  return unassignedAssignee;
};
