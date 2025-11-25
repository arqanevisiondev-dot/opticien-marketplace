-- CreateTable
CREATE TABLE "ProductOption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "ProductOption_type_idx" ON "ProductOption"("type");

-- CreateIndex
CREATE UNIQUE INDEX "ProductOption_type_value_key" ON "ProductOption"("type", "value");
