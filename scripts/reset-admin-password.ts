// استعادة كلمة مرور الحساب التجريبي الافتراضية (Demo1234!)
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const passwordHash = await hash("Demo1234!", 10);
  await db.user.update({
    where: { email: "admin@demo.com" },
    data: { passwordHash },
  });
  console.log("أُعيدت كلمة مرور admin@demo.com إلى Demo1234!");
}

main().finally(() => db.$disconnect());
