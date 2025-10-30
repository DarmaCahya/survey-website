-- CreateTable
CREATE TABLE "draft_surveys" (
    "userId" INTEGER NOT NULL,
    "formId" INTEGER NOT NULL,
    "answers" JSONB NOT NULL,
    "currentIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "draft_surveys_pkey" PRIMARY KEY ("userId","formId")
);

-- AddForeignKey
ALTER TABLE "draft_surveys" ADD CONSTRAINT "draft_surveys_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
