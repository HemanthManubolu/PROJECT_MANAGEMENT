import {
  PrismaClient,
  Priority,
  Role,
  TaskStatus,
  NotificationType,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const password = "DemoPass123!";

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.notification.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: "Asha Admin",
        email: "admin@agency.test",
        passwordHash,
        role: Role.ADMIN,
      },
    }),
    prisma.user.create({
      data: {
        name: "Ravi Kumar",
        email: "ravi.pm@agency.test",
        passwordHash,
        role: Role.PROJECT_MANAGER,
      },
    }),
    prisma.user.create({
      data: {
        name: "Maya Patel",
        email: "maya.pm@agency.test",
        passwordHash,
        role: Role.PROJECT_MANAGER,
      },
    }),
    prisma.user.create({
      data: {
        name: "Alex Chen",
        email: "alex.dev@agency.test",
        passwordHash,
        role: Role.DEVELOPER,
      },
    }),
    prisma.user.create({
      data: {
        name: "Sam Wilson",
        email: "sam.dev@agency.test",
        passwordHash,
        role: Role.DEVELOPER,
      },
    }),
    prisma.user.create({
      data: {
        name: "Priya Shah",
        email: "priya.dev@agency.test",
        passwordHash,
        role: Role.DEVELOPER,
      },
    }),
    prisma.user.create({
      data: {
        name: "Jordan Lee",
        email: "jordan.dev@agency.test",
        passwordHash,
        role: Role.DEVELOPER,
      },
    }),
  ]);
  const [, ravi, maya, alex, sam, priya, jordan] = users;
  const clients = await Promise.all([
    prisma.client.create({
      data: {
        name: "Northstar Health",
        email: "team@northstar.example",
        company: "Northstar Health",
      },
    }),
    prisma.client.create({
      data: {
        name: "Acme Retail",
        email: "ops@acme.example",
        company: "Acme Retail",
      },
    }),
    prisma.client.create({
      data: {
        name: "Blue Horizon",
        email: "hello@bluehorizon.example",
        company: "Blue Horizon",
      },
    }),
  ]);
  const [northstar, acme, blue] = clients;
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        name: "Patient Portal",
        description: "Secure care coordination portal",
        clientId: northstar.id,
        createdById: ravi.id,
        projectManagerId: ravi.id,
      },
    }),
    prisma.project.create({
      data: {
        name: "Commerce Refresh",
        description: "Retail checkout and catalog modernization",
        clientId: acme.id,
        createdById: ravi.id,
        projectManagerId: ravi.id,
      },
    }),
    prisma.project.create({
      data: {
        name: "Insights Platform",
        description: "Executive analytics workspace",
        clientId: blue.id,
        createdById: maya.id,
        projectManagerId: maya.id,
      },
    }),
  ]);
  const [portal, commerce, insights] = projects;
  const definitions: Array<{
    projectId: string;
    title: string;
    developerId: string;
    status: TaskStatus;
    priority: Priority;
    dueDate: Date;
  }> = [
    {
      projectId: portal.id,
      title: "Implement SSO",
      developerId: alex.id,
      status: TaskStatus.IN_REVIEW,
      priority: Priority.CRITICAL,
      dueDate: new Date("2026-09-16"),
    },
    {
      projectId: portal.id,
      title: "Build appointment timeline",
      developerId: sam.id,
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.HIGH,
      dueDate: new Date("2026-09-24"),
    },
    {
      projectId: portal.id,
      title: "Accessibility audit",
      developerId: priya.id,
      status: TaskStatus.TODO,
      priority: Priority.MEDIUM,
      dueDate: new Date("2026-09-28"),
    },
    {
      projectId: portal.id,
      title: "Export medical summary",
      developerId: jordan.id,
      status: TaskStatus.DONE,
      priority: Priority.LOW,
      dueDate: new Date("2026-09-12"),
    },
    {
      projectId: portal.id,
      title: "Consent flow",
      developerId: alex.id,
      status: TaskStatus.TODO,
      priority: Priority.HIGH,
      dueDate: new Date("2026-10-03"),
    },
    {
      projectId: commerce.id,
      title: "Cart performance budget",
      developerId: sam.id,
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.CRITICAL,
      dueDate: new Date("2026-09-17"),
    },
    {
      projectId: commerce.id,
      title: "Checkout fraud signals",
      developerId: priya.id,
      status: TaskStatus.IN_REVIEW,
      priority: Priority.HIGH,
      dueDate: new Date("2026-09-23"),
    },
    {
      projectId: commerce.id,
      title: "Product grid filters",
      developerId: jordan.id,
      status: TaskStatus.TODO,
      priority: Priority.MEDIUM,
      dueDate: new Date("2026-09-30"),
    },
    {
      projectId: commerce.id,
      title: "Tax rules integration",
      developerId: alex.id,
      status: TaskStatus.DONE,
      priority: Priority.HIGH,
      dueDate: new Date("2026-09-10"),
    },
    {
      projectId: commerce.id,
      title: "Wishlist migration",
      developerId: sam.id,
      status: TaskStatus.TODO,
      priority: Priority.LOW,
      dueDate: new Date("2026-10-05"),
    },
    {
      projectId: insights.id,
      title: "Data source connector",
      developerId: priya.id,
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.CRITICAL,
      dueDate: new Date("2026-09-25"),
    },
    {
      projectId: insights.id,
      title: "Revenue forecast chart",
      developerId: jordan.id,
      status: TaskStatus.TODO,
      priority: Priority.HIGH,
      dueDate: new Date("2026-09-27"),
    },
    {
      projectId: insights.id,
      title: "Saved views",
      developerId: alex.id,
      status: TaskStatus.IN_REVIEW,
      priority: Priority.MEDIUM,
      dueDate: new Date("2026-09-21"),
    },
    {
      projectId: insights.id,
      title: "CSV export",
      developerId: sam.id,
      status: TaskStatus.DONE,
      priority: Priority.LOW,
      dueDate: new Date("2026-09-13"),
    },
    {
      projectId: insights.id,
      title: "Executive onboarding",
      developerId: priya.id,
      status: TaskStatus.TODO,
      priority: Priority.MEDIUM,
      dueDate: new Date("2026-10-02"),
    },
  ];
  const tasks = await Promise.all(
    definitions.map((task) =>
      prisma.task.create({
        data: {
          projectId: task.projectId,
          title: task.title,
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate,
          description: `Seeded work item: ${task.title}`,
          assignedDeveloperId: task.developerId,
          isOverdue:
            task.dueDate < new Date() && task.status !== TaskStatus.DONE,
        },
      }),
    ),
  );
  await prisma.activityLog.createMany({
    data: tasks.slice(0, 8).map((task, index) => ({
      projectId: task.projectId,
      taskId: task.id,
      userId: index % 2 === 0 ? ravi.id : maya.id,
      action: "TASK_STATUS_CHANGED",
      oldStatus: TaskStatus.TODO,
      newStatus: task.status,
    })),
  });
  await prisma.notification.createMany({
    data: [
      {
        recipientId: alex.id,
        projectId: portal.id,
        taskId: tasks[0]!.id,
        type: NotificationType.TASK_ASSIGNED,
        message: "You were assigned “Implement SSO”.",
      },
      {
        recipientId: ravi.id,
        projectId: portal.id,
        taskId: tasks[0]!.id,
        type: NotificationType.TASK_IN_REVIEW,
        message: "Alex moved “Implement SSO” to review.",
      },
      {
        recipientId: maya.id,
        projectId: insights.id,
        taskId: tasks[12]!.id,
        type: NotificationType.TASK_IN_REVIEW,
        message: "Alex moved “Saved views” to review.",
      },
    ],
  });
}
main()
  .then(() => prisma.$disconnect())
  .catch(async (error: unknown) => {
    console.error("Seed failed:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
