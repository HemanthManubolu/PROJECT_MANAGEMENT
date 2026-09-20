-- Keep the creator audit trail separate from the manager who owns delivery.
ALTER TABLE "Project" ADD COLUMN "projectManagerId" TEXT;

-- Existing PM-created projects retain their creator as manager.
UPDATE "Project" AS project
SET "projectManagerId" = creator."id"
FROM "User" AS creator
WHERE project."createdById" = creator."id"
  AND creator."role" = 'PROJECT_MANAGER';

-- Legacy admin-created projects receive the first available PM. Abort rather
-- than creating an invalid project if the database has no PM to assign.
UPDATE "Project" AS project
SET "projectManagerId" = manager."id"
FROM LATERAL (
  SELECT "id" FROM "User" WHERE "role" = 'PROJECT_MANAGER' ORDER BY "createdAt" ASC LIMIT 1
) AS manager
WHERE project."projectManagerId" IS NULL;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "Project" WHERE "projectManagerId" IS NULL) THEN
    RAISE EXCEPTION 'Cannot assign a project manager because no PROJECT_MANAGER user exists';
  END IF;
END $$;

ALTER TABLE "Project" ALTER COLUMN "projectManagerId" SET NOT NULL;
CREATE INDEX "Project_projectManagerId_idx" ON "Project"("projectManagerId");
ALTER TABLE "Project" ADD CONSTRAINT "Project_projectManagerId_fkey"
  FOREIGN KEY ("projectManagerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
